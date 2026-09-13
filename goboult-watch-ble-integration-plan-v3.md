# GOBOULT Crown 1.95 — BLE Health Data Integration Plan (v3)

## 1. Goal
Run a standalone local BLE daemon that connects directly to the GOBOULT Crown 1.95 smartwatch, extracts the full set of health/activity metrics needed by the Health AI platform, and pushes them into the existing backend ingest pipeline — no vendor app, no browser, no phone relay.

## 2. Architecture (confirmed — "Option 3")

```
Boult Crown 1.95 (BLE GATT)
    -> Local BLE Daemon (Python, bleak)      <-- this project
    -> Local REST Ingest
    -> Existing Health AI Backend: POST /api/v1/telemetry/ingest
    -> (backend already handles) Socket.IO Live Broadcast + Cardio Risk & Digital Twin AI
```

This was chosen over two alternatives:
- **Web Bluetooth (browser)** — rejected: requires an open tab + user gesture, can't run as a persistent headless backend process.
- **Mobile Health Connect Bridge** — rejected: depends on BoultFit's sync to Health Connect (reported flaky), requires building a new Android/Flutter app, and keeps a vendor app + phone in the loop as mandatory always-on relays.

Where this daemon lives in the existing stack: as its own local process (not folded into the port-5001 AI service), since it needs a continuous, independent BLE connection lifecycle and pushes outward rather than being queried.

## 2a. Full System Architecture (confirmed from project docs) — where the daemon plugs in

This is the real 5-layer platform the daemon must integrate with. **Nothing here was known when Phases 1–4 below were first drafted — this section corrects and sharpens the target, it does not replace the daemon design itself.**

```
Layer 1 — Ingestion & Hardware
  Boult Crown 1.95 --BLE GATT--> [THIS DAEMON] --HTTP POST--> Layer 2

Layer 2 — Backend Gateway (:5000) — Express + TypeScript  <-- NOTE: NOT port 5001
  POST /api/v1/telemetry/ingest  (Telemetry Controller)
    -> validates physiological bounds
    -> updates device heartbeat (devices collection)
    -> evaluates WARNING/CRITICAL alerts
    -> writes to MongoDB (sensorreadings, devices)
    -> emits Socket.IO: telemetry:reading:new / telemetry:alert

Layer 3 — Data Persistence — MongoDB & Redis
  sensorreadings (time-series), patients/users, devices, cardio_assessments/twins, Redis (OTP/rate-limit/cache)

Layer 4 — AI Inference Hub (:5001) — Python/FastAPI
  /cardio/predict, /digital_twin/simulate, /stress/predict, /rl/recommend
  (called BY the Layer 2 backend, not directly by this daemon)

Layer 5 — Frontend (:3000) — React/Vite
  useTelemetryStream listens for telemetry:reading:new -> VitalsMetricGrid, PatientDeviceBanner, alerts
```

**Critical correction from earlier drafts of this plan:** the ingest endpoint is on the **Node/Express gateway at port 5000**, not the Python AI Hub at port 5001. Port 5001 is a downstream service the *backend* calls after ingest — this daemon never talks to it directly.

### 2b. There is already a Smartwatch Simulator hitting this exact endpoint
`backend/src/scripts/smartwatch-simulator.ts` already POSTs synthetic data to `POST /api/v1/telemetry/ingest` under 5 physiological profiles (HEALTHY_REST, CARDIO_STRAIN, EXERCISE_ZONE, RELAXATION_RECOVERY, CIRCADIAN_DYNAMIC). This is extremely valuable: **the daemon should be a drop-in real-data replacement for the simulator**, meaning:
- Its JSON payload shape must match whatever the telemetry controller/simulator already sends field-for-field (key names, casing, units, timestamp format) — the validation logic in the ingest controller was built around that shape and will likely reject anything that doesn't match.
- **Action item before finalizing `ingest_client.py`:** read `backend/src/scripts/smartwatch-simulator.ts` and the telemetry controller/validator source directly, and copy the exact schema rather than inventing field names.

### 2c. Auth — unresolved, must confirm before the daemon can push anything
The gateway has a full `AuthModule` (JWT, roles, RBAC). It is not yet confirmed whether `POST /api/v1/telemetry/ingest` is:
- protected by a user JWT (meaning the daemon needs a way to obtain/store a token — e.g. a long-lived service/device credential), or
- protected by a separate device API key/secret tied to the `devices` collection, or
- open only on localhost for the simulator's convenience (less likely for a real deployment, but check).

**Action item:** inspect the Express route definition and its middleware chain for `/api/v1/telemetry/ingest` to determine which of these applies, then design the daemon's config (env vars) around whichever it is. Do not assume no-auth.

### 2d. Device identity
`PatientDeviceBanner` references a device like `WATCH_HEALTH_AI_PRO_01`, and the `devices` collection tracks battery %, sync frequency, connection state (ONLINE/OFFLINE) per device. The daemon needs a real `deviceId` (and likely a `userId` it's reporting on behalf of) that already exists in that collection, or a registration step to create one — not an arbitrary string invented client-side.

## 3. Confirmed BLE Surface (from NRF Connect scan)

| Service | UUID | Type |
|---|---|---|
| Generic Access | `0x1800` | Standard |
| Generic Attribute | `0x1801` | Standard |
| Device Information | `0x180A` | Standard |
| Battery Service | `0x180F` | Standard — Battery Level `0x2A19` (READ) |
| Heart Rate | `0x180D` | Standard — `0x2A37` (NOTIFY, confirmed live), `0x2A38` Body Sensor Location (READ), `0x2A39` Control Point (WRITE) |
| Device Comm Service | `000001ff-3c17-d293-8e48-14fe2e4da212` | Custom — "Da Fit / MOYOUNG-V2" OEM protocol family (shared across Colmi, Moyoung, Cubot, and other white-labeled devices). `0000ff02-...` = WRITE (commands), `0000ff03-...` = NOTIFY (responses) |
| Unknown | `0000d0ff-...`, `000002fd-...`, `0xFEE7`, `0xFEEA` | Custom — purpose unconfirmed, log all traffic |

Reference implementations for the custom protocol: Gadgetbridge's Moyoung/Da Fit device support (`Freeyourgadget/Gadgetbridge`, fork `Ph0rk0z/Gadgetbridge-MT863`), `eduardoposadas/recun1sw`.

## 4. Full Metrics Scope

Grouped by what's actually feasible on this hardware, not just what's desired.

### Tier 1 — Confirmed standard BLE, implement immediately
| Metric | Source | Notes |
|---|---|---|
| Heart Rate (live BPM) | `0x2A37` | Already confirmed streaming |
| Signal/Contact Confidence | `0x2A37` flags byte | "Sensor Contact Detected/Supported" bits — use to flag unreliable readings |
| HRV via RR-Intervals | `0x2A37` payload | The standard Heart Rate Measurement format has an *optional* RR-interval field, indicated by a flag bit. **Must verify in practice** whether this watch's firmware populates it — if yes, HRV/SDNN can be computed backend-side from these intervals with zero extra protocol work. If the flag is never set, this data isn't available from this watch and HRV becomes infeasible without the vendor protocol. |
| Battery % | `0x2A19` | Direct read, standard |

### Tier 2 — Custom vendor protocol, needs Phase 1 packet capture
| Metric | Source | Notes |
|---|---|---|
| SpO2 | `000001ff-...` notify | On-demand reading, watch-side computed |
| Steps | `000001ff-...` notify | Likely bundled with distance/calories in one packet |
| Calories burned | `000001ff-...` notify | Watch-computed (motion + HR based) |
| Distance | `000001ff-...` notify | Likely same packet as steps |
| Sleep duration / stages | `000001ff-...` notify | Synced periodically, not live |
| Blood Pressure (Sys/Dia) | `000001ff-...` notify | **We consume the watch's own computed value only** — we are not implementing our own PPG-to-BP estimation algorithm; that's a separate, much harder signal-processing project outside scope here |

### Tier 3 — Unconfirmed hardware support, verify before building
| Metric | Status |
|---|---|
| Skin/Body Temperature | Not listed in this watch's spec sheet or GATT scan. Likely **not present** on this hardware. Do not build for it until/unless a scan reveals a plausible characteristic. |
| Real-Time Motion State (REST/WALK/RUN) | Raw accelerometer/IMU data is unlikely to be exposed over BLE on this OEM protocol family — typically only the pre-computed step count is exposed. **Recommended approach: derive motion state backend-side from step-count deltas over short time windows**, rather than depending on undocumented raw sensor access. |

### Tier 4 — Derived, computed entirely by the backend (no new BLE work)
- Resting Heart Rate — lowest stable HR over rest/night windows from the continuous HR stream
- Rate Pressure Product (HR × Systolic BP)
- Autonomic Stress Score — from rolling HR + SpO2 + HRV window
- Cardiovascular Risk Score/Classification
- Digital Twin 30-day trajectory (GRU model)

## 5. Implementation Phases

### Phase 1 — Protocol confirmation (manual, before writing parsers)
1. Enable Bluetooth HCI snoop logging on Android (Developer Options).
2. **Wear the watch** (sensors need skin contact for real HR/SpO2 values) and keep it paired to the BoultFit app.
3. In the app: trigger an SpO2 reading, view steps, view calories, check if a sleep/BP screen exists and trigger those too.
4. Pull the snoop log, open in Wireshark, filter by watch MAC (`FE:E4:B4:91:28:67`).
5. Identify exact write bytes to `ff02` and matching response bytes on `ff03` for each action.
6. Separately, inspect a live `0x2A37` notification payload byte-by-byte to check the flags byte for the RR-interval bit.
7. Cross-reference against Gadgetbridge's Moyoung/Da Fit handler and `recun1sw` to speed up decoding.

### Phase 2 — Daemon implementation (Tier 1 metrics fully working)
Build the daemon end-to-end for Heart Rate, HRV (if available), Battery, and signal confidence — this alone unlocks live streaming + stress scoring on the dashboard immediately, without waiting on Tier 2 decode work.

### Phase 3 — Incremental Tier 2 decode
As each command/response pair is confirmed from Phase 1 captures, plug it into the protocol dispatch table one metric at a time (steps first, then calories/distance, then SpO2, then sleep, then BP).

### Phase 4 — Backend contract
Push a single JSON payload per interval to `POST /api/v1/telemetry/ingest` with a stable schema — every Tier 1–2 field present (null if not yet available), so the backend/AI models don't need schema changes as Tier 2 metrics come online incrementally.

### Phase 0 (do this FIRST, before Phase 1) — Codebase reconnaissance
Added after reviewing the full system architecture. This must happen before Phase 1's hardware work is wired to the backend, though it can run in parallel with it:
1. Read `backend/src/scripts/smartwatch-simulator.ts` — extract the exact JSON payload shape it sends to `/api/v1/telemetry/ingest` (field names, casing, units, nesting, timestamp format).
2. Read the telemetry controller/route/validator on the Express gateway — confirm request validation rules (required fields, physiological bounds) and the auth middleware attached to that route (JWT vs API key vs none).
3. Check the `devices` collection schema/seed data for the expected `deviceId` format and whether a device must be pre-registered before it can post telemetry.
4. Only after 1–3 are confirmed, finalize `ingest_client.py`'s payload builder and auth header logic — do not guess these.

## 6. Risks / Caveats
- Only one BLE central (phone app OR the daemon) can hold the GATT connection at a time — BoultFit app must stay closed during daemon operation.
- Command bytes are not guaranteed identical across Moyoung-family firmware variants — Phase 1 capture is mandatory, not optional.
- BP and sleep values, if available, are the watch's own algorithm output — accuracy is whatever the OEM firmware provides, not something we can improve on our end.
- Firmware updates via the official app could change the protocol.
- **New, from architecture review:** if the ingest endpoint requires a user-scoped JWT rather than a device credential, the daemon needs a way to acquire/refresh that token unattended (e.g. a long-lived service account) — this is a backend/auth design decision, not something the daemon can work around unilaterally. Flag this to whoever owns the Auth module before building `ingest_client.py`'s auth logic.
- If the telemetry validator enforces strict physiological bounds (mentioned in Layer 2 docs) and Tier 2 fields are sent as `null` while unimplemented, confirm the validator accepts `null`/omitted fields rather than rejecting the whole payload — otherwise Tier 1-only pushes (Phase 2) may fail validation until Tier 2 is fully done, which would block incremental rollout.

## 7. References
- `Freeyourgadget/Gadgetbridge` (AGPL-3.0) — issue `#5618` (Colmi P78 / MOYOUNG-V2 protocol dump)
- `Ph0rk0z/Gadgetbridge-MT863` — Da Fit app / MOYOUNG-V2 protocol fork
- `eduardoposadas/recun1sw` — Cubot N1 BLE reverse engineering, same UUID base
- `bleak` — https://github.com/hbldh/bleak