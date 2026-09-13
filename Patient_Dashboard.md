# Patient Dashboard — Streamlined Architecture & Specification

## 1. Executive Summary & Navigation Structure

To prevent UI redundancy and maintain a clean, clinically powerful user experience, the Patient Portal is streamlined into **6 Core Pillars**. 

Redundant standalone pages have been consolidated:
- **Emotion Analysis** is integrated directly into the **Digital Twin** and **Overview** as a core physiological pillar rather than an isolated page.
- **Personalized Recommendations** are powered by the **PPO Actor-Critic Reinforcement Learning** intervention engine and **Digital Twin Trend Insights** within the assessment and digital twin views.

```
Patient Portal (Final Frozen Navigation)
│
├── 1. 🏠 Overview (/dashboard)
├── 2. 🫀 Health Monitoring (/health-monitoring)
├── 3. 🧠 AI Assessments (/assessments)
│   ├── 3.1 ❤️ Cardiovascular Risk (/assessments/cardiovascular)
│   └── 3.2 ⚡ Autonomic Stress (/assessments/stress)
├── 4. 🧬 Digital Twin (/digital-twin)
├── 5. 💬 AI Chat Assistant (/chat or Global Assistant Drawer)
└── 6. 📄 Health Reports & Clinical Export (/reports)
```

---

## 2. Detailed Pillar Specifications

---

### 1. 🏠 Overview (`/dashboard`)
* **Purpose**: Primary mission-control hub providing an immediate, at-a-glance summary of current physiological state, recent risk assessments, connected devices, and digital twin status without requiring the user to navigate individual pages.
* **Data Sources**:
  - **Patient Profile**: Demographics, age, biological sex, BMI.
  - **Connected Devices**: Active telemetry source status, sync timestamps.
  - **Latest Sensor Telemetry**: Heart rate (BPM), blood oxygenation ($\text{SpO}_2$), body temperature ($^\circ\text{C}$).
  - **AI Assessments**: Latest Cardiovascular Risk Score & Level, Latest Autonomic Stress Score & Level.
  - **Digital Twin**: Current overall health score ($0-100$) and health state classification (`OPTIMAL`, `STABLE`, `ELEVATED_RISK`, `CRITICAL`).
  - **Active Guidance**: Summary of latest PPO-recommended clinical/lifestyle intervention.
* **UI Components**:
  - **Vitals Metric Grid**: High-contrast KPI cards for HR, $\text{SpO}_2$, Temperature, Cardio Risk, and Stress.
  - **Quick Digital Twin Status Widget**: Visual score radial/gauge with health state badge.
  - **Recent Vital Trends Chart**: Sparkline/line chart showing multi-day vital stability.
  - **Quick Action Triggers**: Instant buttons for "New Assessment", "Simulate Trajectory", and "Download Report".

---

### 2. 🫀 Health Monitoring (`/health-monitoring`)
* **Purpose**: Detailed, continuous physiological sensor data explorer and telemetry dashboard for raw IoT vitals.
* **Data Sources**:
  - `sensor_readings` collection / API endpoints:
    - Heart Rate (BPM)
    - Blood Oxygenation ($\text{SpO}_2\%$)
    - Body Temperature ($^\circ\text{C}$)
  - Device hardware metadata & sync connection logs.
* **UI Components**:
  - **Live Telemetry Cards**: Real-time readings with normal clinical range indicators.
  - **Interactive Vital Trend Charts**:
    - Heart Rate History (Line chart with resting vs. active thresholds).
    - $\text{SpO}_2$ Oxygenation Trend (Line chart with hypoxemia safety boundaries at $95\%$).
    - Body Temperature Trend (Line chart with normal baseline bounds).
    - Multi-Vital Combined Timeline.
  - **Telemetry Filtering**: Time ranges ($24\text{h}$, $7\text{d}$, $30\text{d}$), device filter selector.

---

### 3. 🧠 AI Assessments (`/assessments`)

#### 3.1 ❤️ Cardiovascular Risk Assessment (`/assessments/cardiovascular`)
* **Purpose**: Comprehensive cardiovascular disease risk prediction, feature attribution, and RL-guided clinical intervention recommendations powered by the research-backed 5-phase ML pipeline.
* **AI Models & Pipeline**:
  - **Risk Classifier**: 150-Tree Bagged Random Forest ($100\%$ validation accuracy across 5 risk classes: `OPTIMAL`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`).
  - **Biometrics Engine**: Deterministic calculation of Pulse Pressure ($PP$), Mean Arterial Pressure ($MAP$), Rate-Pressure Product ($RPP$), Sleep Impact, and Autonomic Stress Proxy.
  - **Explainability**: Kernel SHAP physiological attribution determining the top 3 contributing risk drivers.
  - **RL Decision Engine**: PPO Actor-Critic agent with Rule-Guided Action-Masking safety guardrails providing actionable clinical/lifestyle intervention.
  - **Natural Language Synthesis**: Empathetic guidance generator (Gemini $\to$ Groq $\to$ Clinical Template fallback).
* **UI Components**:
  - **Current Risk KPI Card**: Risk Class badge, continuous Risk Score ($0-100$), ML confidence gauge, and hemodynamic metrics ($PP, MAP, RPP$).
  - **Kernel SHAP Drivers Card**: Visual horizontal impact bar charts showing top physiological risk factors.
  - **PPO Action Guidance Card**: Empathetic AI guidance text, recommended intervention category, dosage/intensity level, and safety constraint status.
  - **Historical Risk Trajectory**: Multi-assessment risk score progression line chart and historical assessment table with modal breakdown.

#### 3.2 ⚡ Autonomic Stress Assessment (`/assessments/stress`)
* **Purpose**: Evaluates acute and chronic autonomic nervous system stress using multi-parameter physiological windows.
* **AI Models & Pipeline**:
  - Support Vector Machine / Classifier evaluating autonomic sympathetic tone from telemetry windows.
* **UI Components**:
  - **Current Stress Score Card**: Score ($0-100$), level badge (`LOW`, `MODERATE`, `HIGH`, `SEVERE`), and dominant autonomic state.
  - **Autonomic Drivers Card**: Breakdown of HR variability, temperature fluctuations, and SpO2 stability.
  - **Stress Trend Chart**: Historical stress score line chart over time.
  - **Assessment History Table**: Timestamped audit logs.

---

### 4. 🧬 Digital Twin (`/digital-twin`)
* **Purpose**: Dynamic, time-evolving digital representation of the patient's holistic health state with 30-day temporal trajectory simulation and historical snapshot calibration.
* **AI Models & Pipeline**:
  - **Temporal Sequence Predictor**: PyTorch `GRUAttentionNet` (Bi-directional GRU with Multi-Head Self-Attention) forecasting 30-day vital drift and health degradation.
  - **State Evaluation Engine**: Evaluates physiological balance, cardiovascular risk, autonomic stress, and emotional tone into a single composite score ($0-100$).
  - **Immutable Snapshot Store**: Historical state time-travel enabling longitudinal calibration.
* **UI Components**:
  - **Digital Twin Header Card**: Composite Health Score ($0-100$), overall health state badge, baseline calibration stats, and dominant emotion indicator.
  - **Physiological Dimensions Grid**: 4 pillars showing Cardiovascular Resilience, Autonomic Tone, Metabolic/Vital Stability, and Emotional Balance.
  - **30-Day Trajectory Forecast Card**: Interactive PyTorch GRU simulation showing predicted systolic BP, diastolic BP, resting HR, and predicted risk drift over 30 days.
  - **Time-Travel Evolution Timeline**: Historical snapshots with rollback/inspection modal.
  - **Trend Analysis & Insights**: Data-grounded clinical trajectory insights.

---

### 5. 💬 AI Chat Assistant (`/chat` & Global Floating Drawer)
* **Purpose**: Interactive, conversational AI health companion allowing patients to ask questions about their health data, risk scores, digital twin trajectory, and lifestyle recommendations in natural language.
* **AI Architecture**:
  - Grounded Conversational Agent connected to the Unified AI Hub (powered by Gemini with Groq fallback).
  - Automatically receives active patient context (latest vitals, current cardio risk, top SHAP drivers, and digital twin state) to provide personalized, non-generic health coaching.
* **UI Components**:
  - **Interactive Chat Interface**: Streaming message feed with suggested quick-prompt chips (*"Why is my MAP elevated?"*, *"Explain my 30-day digital twin forecast"*, *"How can I improve sleep efficiency?"*).
  - **Conversation Session Sidebar**: History of past chat sessions organized by date.
  - **Dual Access Modality**:
    - Full-screen view at `/chat`.
    - Persistent floating AI Assistant drawer/button accessible from any page.

---

### 6. 📄 Health Reports & Clinical Export (`/reports`)
* **Purpose**: Generates comprehensive, exportable clinical summary reports in PDF format with verifiable QR codes for patients to share with their physicians, cardiologists, or caregivers.
* **Content Compiled in Report**:
  - Patient demographics & baseline metrics.
  - 30-day vital telemetry trends (HR, $\text{SpO}_2$, Temp).
  - Latest Cardiovascular Risk Assessment with Kernel SHAP physiological drivers.
  - Autonomic Stress breakdown and Digital Twin state history.
  - PPO-recommended clinical interventions and patient lifestyle guidance.
  - Verifiable digital signature & QR code for clinical record verification.
* **UI Components**:
  - **Report Generation Panel**: Date range selector ($7\text{d}, 30\text{d}, 90\text{d}$, Custom) and report type filter (Full Comprehensive, Cardiovascular Focus, Telemetry Summary).
  - **Generated Reports Archive**: Table of generated reports with generation date, period, download button (PDF), and preview modal.
  - **QR Code Verification Card**: Displays cryptographically signed verification QR code.

---

## 3. Data Ownership & API Route Mapping

| Page / Pillar | Primary Data Dependencies | Backend API Endpoints |
| :--- | :--- | :--- |
| **Overview** | Patient + Devices + Latest Vitals + Assessments + Twin | `GET /api/v1/patients/profile`<br>`GET /api/v1/patients/devices`<br>`GET /api/v1/digital-twin/current`<br>`GET /api/v1/cardiovascular/current` |
| **Health Monitoring** | IoT Telemetry + Connected Devices | `GET /api/v1/patients/sensor-readings`<br>`GET /api/v1/patients/devices` |
| **Cardiovascular Risk** | Cardiovascular Assessments + Feature Extractor | `POST /api/v1/cardiovascular/assess`<br>`GET /api/v1/cardiovascular/current`<br>`GET /api/v1/cardiovascular/history` |
| **Stress Assessment** | Telemetry Window + Stress Model | `POST /api/v1/stress/assess`<br>`GET /api/v1/stress/current`<br>`GET /api/v1/stress/history` |
| **Digital Twin** | Twin Model + Trajectory Simulator + Snapshots | `GET /api/v1/digital-twin/current`<br>`POST /api/v1/digital-twin/simulate`<br>`GET /api/v1/digital-twin/snapshots`<br>`POST /api/v1/digital-twin/calibrate` |
| **Chat Assistant** | Chat Sessions + AI Context Engine | `GET /api/v1/chat/sessions`<br>`POST /api/v1/chat/messages`<br>`GET /api/v1/chat/sessions/:id` |
| **Health Reports** | Aggregated Clinical Summary + PDF Generator | `POST /api/v1/reports/generate`<br>`GET /api/v1/reports`<br>`GET /api/v1/reports/:id/pdf` |

---

## 4. Architectural Rules & Best Practices

1. **Avoid Duplicate Independent Fetching**: The Overview page fetches lightweight summary DTOs, while deep-dive pages fetch their own paginated historical records on demand.
2. **Deterministic Clinical Integrity**: The frontend never invents or mocks risk classifications, SHAP values, or PPO actions; all calculations originate from verified Python AI services and backend repositories.
3. **Responsive & Mobile-First**: All charts and cards dynamically adapt to mobile screens, collapsible sidebar navigation, and high-DPI desktop viewports.