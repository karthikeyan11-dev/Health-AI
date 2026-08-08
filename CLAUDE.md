# 📋 AGENT CODING GUIDELINES & SOFTWARE ENGINEERING STANDARDS

> **Notice for AI Agents & Engineers**: This file defines the mandatory rules, regulations, coding standards, architectural constraints, and forbidden practices for building and maintaining the **Health AI** codebase. Every AI agent, engineer, and contributor MUST strictly follow these guidelines.

---

## 1. 🎯 CORE PHILOSOPHY & EXECUTION RULES

### 1.1 First Principles
1. **Inspect Before You Implement**: Never guess file paths, database schemas, function signatures, or API contracts. Inspect authoritative source files (`.ts`, schema definitions, types, `ProjectPlan.md`) first.
2. **Fix Root Causes, Never Mask Symptoms**: Never wrap failing code in silent `try/catch` blocks, return dummy fallback data on errors, or disable failing tests. Always fix the underlying defect.
3. **Verify Every Edit**: Editing code does NOT complete a task. You MUST execute `pnpm type-check`, `pnpm lint`, `pnpm format:check`, and `pnpm build` to verify runtime correctness and prevent regressions.
4. **Preserve API Contracts**: Maintain backward compatibility for existing module interfaces and API endpoints. Follow the OpenAPI 3.0.3 specification as the single source of truth (SSOT).
5. **Atomic & Incremental Edits**: Focus on minimal, high-quality, self-contained changes. Avoid mass refactoring or modifying unrelated code.
6. **Zero Assumptions**: If any field, schema relation, business rule, or architectural constraint is unclear or contradictory, STOP and ask the user before writing code.

---

## 2. ⛔ STRICT PROHIBITIONS (STRICTLY FORBIDDEN)

| Category | Prohibited Action | Risk / Consequences |
| :--- | :--- | :--- |
| **Typing** | ❌ Strictly don't use `any`, `unknown` types and also don't use `ts-ignore` / `eslint-disable` | This destroys type safety; causes runtime `TypeError` crashes. Also if you are using type `infer`  then also you strictly check the type guard to prevent type errors. |
| **Secrets & Env** | ❌ Hardcoding API keys, JWT secrets, DB strings, or calling `process.env` directly | This is a major security vulnerability; violates centralized configuration. |
| **Error Handling** | ❌ Empty `catch` blocks or swallowing exceptions (`catch (err) {}`) | This Obscures critical bugs, resource leaks, and causes silent data corruption. |
| **Microservice Boundary** | ❌ Merging Python AI code into Node.js or moving the `emotion_detection/` service | This breaks decoupled microservices architecture; corrupts native Python ML env. |
| **Inventing Features** | ❌ Adding undocumented medical fields, doctors/prescriptions, BP sensors, or ECG fields | This violates capstone project scope and pollutes core data models. |
| **Package Manager** | ❌ Using `npm` or `yarn` instead of `pnpm` (v10+) | This corrupts dependency lockfiles (`pnpm-lock.yaml`) and workspace resolution. |
| **OpenAPI Hierarchy** | ❌ Creating nested `index.yaml` files inside feature subfolders | This violates the unified root index architecture (`paths/index.yaml`, `schemas/index.yaml`). |
| **State Mutation** | ❌ Mutating global state, shared variables, or external library internals | Introduces non-deterministic bugs, side-effects, and race conditions. |
| **Performance** | ❌ Synchronous/blocking code (`readFileSync`, `sleep`) on the main event loop | Causes event loop blocking, high latency, and application freezes. |
| **Database** | ❌ Un-indexed query filters, manual ObjectId strings, or raw unescaped queries | Causes database CPU spikes, full collection scans, and injection vulnerabilities. |
| **Architecture** | ❌ Circular dependencies between modules, controllers, or service layers | Causes `undefined` import bindings, runtime panics, and tight coupling. |

---

## 3. 🏗️ SYSTEM ARCHITECTURE & MICROSERVICES BOUNDARIES

### 3.1 Node.js Core Backend Gateway (`backend/`)
- **Runtime**: Node.js (v20+) with TypeScript 5.7+ running Express.
- **Port**: `5000` (Base URL: `http://localhost:5000/api/v1`).
- **Clean 3-Tier Layering**:
  - `controllers/`: HTTP request parsing, Zod DTO validation, status code formatting. *Zero business logic.*
  - `services/`: Pure business logic, Digital Twin computations, stress/cardio algorithms. *Framework-agnostic.*
  - `repositories/`: MongoDB Mongoose data access and ORM query abstractions. *No HTTP logic.*
  - `models/`: Mongoose schemas, TypeScript document interfaces, and collection indexes.
  - `config/`: Centralized `envalid` configuration, structured `pino` logger, and database connector.
  - `middlewares/`: JWT authentication, RBAC authorization, error envelope handling.

### 3.2 Python AI Microservice (`emotion_detection/`)
- **Runtime**: Python 3.10+, Flask, OpenCV Haar-Cascades, TensorFlow/Keras (`model.h5`).
- **Port**: `5001` (Base URL: `http://localhost:5001`).
- **Isolation Directive**: Must remain a completely independent service. Node.js communicates with Python **strictly via REST HTTP using Axios** (`POST /emotion/predict`, `POST /chat`, `POST /health-analysis`).

### 3.3 Hardware IoT Sensors (Active Ground Truth)
The project utilizes ONLY the following confirmed hardware sensors and input streams:
1. **Heart Rate**: MAX30102 PPG sensor (`bpm`).
2. **Blood Oxygen (SpO₂)**: MAX30102 sensor (`%`).
3. **Body Temperature**: MLX90614 / DS18B20 sensor (`°C`).
4. **Emotion Detection**: Python AI Microservice webcam CNN inference (`Angry`, `Disgust`, `Fear`, `Happy`, `Neutral`, `Sad`, `Surprise`).

> [!IMPORTANT]
> **Blood Pressure & ECG Policy**: Do NOT include Blood Pressure (`systolicBp`, `diastolicBp`) or ECG as mandatory core parameters. The schema supports optional/nullable fields for future extensions without breaking contracts.

---

## 4. 🗄️ DATABASE & MONGOOSE MODEL STANDARDS

### 4.1 Local Docker MongoDB Setup
- **Directory**: `docker/` contains dedicated `docker-compose.yml` and `.env` files.
- **Port**: Host `27017` mapped to container `27017` for MongoDB Compass.
- **Persistence**: Host-persisted named volume `health_ai_mongodb_data` mounted to `/data/db`.
- **Compass URI**: `mongodb://admin:healthai_secret_pass@localhost:27017/health_ai_db?authSource=admin`.

### 4.2 The 11 Core Database Collections & Models (`backend/src/models/`)
All models MUST use Mongoose + strict TypeScript with `{ timestamps: true }`:

1. **`users`** (`UserModel`): System user credentials, email, passwordHash, role (`PATIENT`, `CLINICIAN`, `ADMIN`, `SYSTEM`), isActive.
2. **`patients`** (`PatientModel`): Clinical patient profile linked 1-to-1 to `User` via `userId`, gender, bloodType, emergencyContact, assignedClinicianId.
3. **`devices`** (`DeviceModel`): Hardware ESP32 registry, `deviceId`, `macAddress`, `deviceType`, `status` (`ONLINE`, `OFFLINE`, `ERROR`, `UNREGISTERED`), `userId`, `patientId`.
4. **`sensor_readings`** (`SensorReadingModel`): Time-series biometric telemetry (`HEART_RATE`, `TEMPERATURE`, `SPO2`, `EMOTION`), `value`, `unit`, `timestamp`. Compound indexed on `{ userId: 1, timestamp: -1 }`.
5. **`stress_assessments`** (`StressAssessmentModel`): Computed stress score (0-100), `stressLevel` (`LOW`, `MODERATE`, `HIGH`, `SEVERE`), `contributingFactors`, `heartRate`, `temperature`, `spo2`, `currentEmotion`.
6. **`cardiovascular_assessments`** (`CardiovascularAssessmentModel`): Computed cardio risk score (0-100), `riskLevel` (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`), `recommendations`, vitals snapshot, optional nullable `systolicBp`/`diastolicBp`.
7. **`digital_twins`** (`DigitalTwinModel`): 1-to-1 physiological health mirror (`userId`), `overallHealthScore`, `healthState` (`OPTIMAL`, `STABLE`, `ELEVATED_STRESS`, `AT_RISK`, `CRITICAL`), baseline averages (`baselineHeartRate`, `baselineTemperature`, `baselineSpO2`), `dominantEmotion`.
8. **`recommendations`** (`RecommendationModel`): Clinical and wellness recommendations (`userId`), `category` (`LIFESTYLE`, `EXERCISE`, `MEDICATION_REMINDER`, `STRESS_RELIEF`, `CLINICAL_ALERT`), `priority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`), `isAcknowledged`.
9. **`chat_sessions`** (`ChatSessionModel`): AI conversational dialog sessions (`userId`, `title`, `status`: `ACTIVE`, `CLOSED`, `ARCHIVED`, `lastMessageAt`).
10. **`chat_messages`** (`ChatMessageModel`): Dialogue turns (`sessionId`, `userId`, `sender`: `USER`, `BOT`, `SYSTEM`, `message`, `intent`, `detectedEmotion`, `timestamp`).
11. **`reports`** (`ReportModel`): Generated clinical export metadata (`userId`, `reportType`, `format`: `PDF`, `JSON`, `CSV`, `downloadUrl`, `status`, `generatedAt`).

---

## 5. ⚙️ CONFIGURATION & LOGGING STANDARDS

### 5.1 Centralized Environment (`backend/src/config/env.config.ts`)
- **Rule**: NEVER use `process.env.VAR` directly in deep files.
- **Implementation**: Use `Config` exported from `@config` validated via `envalid`:
  ```typescript
  import { Config } from '@config';
  const port = Config.PORT;
  const dbUri = Config.MONGODB_URI;
  ```

### 5.2 Structured Logging (`backend/src/config/logger.ts`)
- **Rule**: Use the global `logger` (Pino) for all runtime events.
- **Levels**:
  - `logger.info()`: Standard operational events (server start, DB connected).
  - `logger.warn()`: Non-critical anomalies or retryable failures.
  - `logger.error()`: Caught application exceptions with `{ err: error }`.
  - `logger.debug()`: Verbose telemetry or algorithm calculation details.
- **PII Protection**: NEVER log raw passwords, JWT tokens, hashes, or encryption keys.

---

## 6. 🌐 OPENAPI-FIRST ARCHITECTURE (OPTION B)

### 6.1 Server & Path Rules
- **Base Server URL**: `http://localhost:5000/api/v1` (Local Dev) / `https://api.healthai.org/api/v1` (Production).
- **Paths Index**: `backend/openapi/paths/index.yaml` maps all relative endpoints (e.g. `/auth/login`, `/sensors/readings`, `/digital-twin/{userId}`) without `/api/v1` prefix.
- **Schemas Index**: `backend/openapi/components/schemas/index.yaml` maps all DTO definitions.
- **Type Generation**: Run `pnpm openapi:types` to generate strict TypeScript interfaces into `backend/src/types/generated/api-types.ts`.

---

## 7. 🛡️ ERROR ENVELOPE & HTTP RESPONSE FORMAT

All API endpoints MUST return responses adhering strictly to the standardized envelope:

### 7.1 Success Envelope (`SuccessResponse.yaml`)
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {},
  "meta": {
    "timestamp": "2026-08-08T11:00:00.000Z",
    "requestId": "req_88a99c01"
  }
}
```

### 7.2 Error Envelope (`ErrorResponse.yaml`)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid sensor reading payload",
    "details": []
  },
  "meta": {
    "timestamp": "2026-08-08T11:00:00.000Z",
    "requestId": "req_88a99c01"
  }
}
```

---

## 8. 💻 CODE STYLE & NAMING CONVENTIONS

- **Directories & Source Files**: `kebab-case` (e.g. `sensor-reading.model.ts`, `auth.controller.ts`).
- **Classes, Interfaces, Enums, Models**: `PascalCase` (e.g. `UserModel`, `SensorType`, `IUserDocument`).
- **Methods, Functions, Variables**: `camelCase` (e.g. `connectDatabase()`, `calculateStressIndex()`).
- **Constants & Envs**: `UPPER_SNAKE_CASE` (e.g. `MONGODB_URI`, `DEFAULT_PAGE_LIMIT`).
- **Path Aliases** (defined in `tsconfig.json`):
  - `@config/*` -> `config/*`
  - `@controllers/*` -> `controllers/*`
  - `@services/*` -> `services/*`
  - `@repositories/*` -> `repositories/*`
  - `@models/*` -> `models/*`
  - `@middlewares/*` -> `middlewares/*`
  - `@utils/*` -> `utils/*`
  - `@types/*` -> `types/*`

---

## 9. 🤖 AGENT OPERATIONAL WORKFLOW

When receiving any coding task, follow this 4-step execution lifecycle:

```mermaid
flowchart TD
    A[Step 1: Inspect & Analyze] --> B[Step 2: Plan Architecture]
    B --> C[Step 3: Implement Code]
    C --> D[Step 4: Verify & Self-Test]
    D -->|Build/Lint Fails| C
    D -->|Build/Lint Passes| E[Task Complete]
```

1. **Inspect**: Search the workspace using grep/view tools to inspect existing models, config, and routes.
2. **Plan**: Align with `ProjectPlan.md` and `CLAUDE.md`. Ask questions if anything is ambiguous.
3. **Implement**: Write modular, clean TypeScript adhering to 3-tier layering and strict type safety.
4. **Verify**: Always run the complete verification routine:
   ```bash
   pnpm type-check    # Verifies strict TypeScript (tsc --noEmit)
   pnpm lint          # Verifies ESLint rules
   pnpm format:check  # Verifies Prettier formatting
   pnpm build         # Verifies production JavaScript compilation
   ```
