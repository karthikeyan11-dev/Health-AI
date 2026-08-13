# 🏥 Health AI - Production-Grade Smart Healthcare Monitoring Platform
## Master Technical Architecture, Blueprint & System Specification Document

---

> **Document Status**: Single Source of Truth (SSOT)  
> **Target Audience**: Software Architects, Technical Leads, Senior Engineers, AI Engineers, and Hardware Integrators  
> **Project Type**: Final Year Engineering Capstone & Production Architecture Blueprint  

---

## 📋 TABLE OF CONTENTS
1. [Project Overview](#1-project-overview)
2. [Project Goals](#2-project-goals)
3. [Architecture Overview](#3-architecture-overview)
4. [Microservices Architecture](#4-microservices-architecture)
5. [Folder Structure](#5-folder-structure)
6. [Backend Structure](#6-backend-structure)
7. [OpenAPI Structure](#7-openapi-structure)
8. [Technology Stack](#8-technology-stack)
9. [Database Design](#9-database-design)
10. [Database Collections & Schemas](#10-database-collections--schemas)
11. [Feature Modules](#11-feature-modules)
12. [Comprehensive Endpoint Directory](#12-comprehensive-endpoint-directory)
13. [Detailed Endpoint Purpose & Specifications](#13-detailed-endpoint-purpose--specifications)
14. [AI Microservice Overview](#14-ai-microservice-overview)
15. [Emotion Detection AI Service Integration](#15-emotion-detection-ai-service-integration)
16. [Digital Twin Computational Engine](#16-digital-twin-computational-engine)
17. [Stress Analysis Subsystem](#17-stress-analysis-subsystem)
18. [Cardiovascular Risk Assessment Engine](#18-cardiovascular-risk-assessment-engine)
19. [Personalized Recommendation Engine](#19-personalized-recommendation-engine)
20. [Authentication & Authorization Flow](#20-authentication--authorization-flow)
21. [Sensor Telemetry Ingestion Flow](#21-sensor-telemetry-ingestion-flow)
22. [Future Frontend Architecture](#22-future-frontend-architecture)
23. [Future ML Engine Integration](#23-future-ml-engine-integration)
24. [Deployment & Containerization Plan](#24-deployment--containerization-plan)
25. [Development Phases & Roadmap](#25-development-phases--roadmap)
26. [Coding Standards & Engineering Rules](#26-coding-standards--engineering-rules)
27. [API Design Principles](#27-api-design-principles)
28. [Naming Conventions & Schema Rules](#28-naming-conventions--schema-rules)
29. [Testing & Quality Verification Strategy](#29-testing--quality-verification-strategy)
30. [Future Project Roadmap & Scaling](#30-future-project-roadmap--scaling)

---

## 1. PROJECT OVERVIEW
**Health AI** is a production-grade, enterprise-ready Smart Healthcare Monitoring Platform designed to fuse hardware IoT sensor telemetry (ESP32), computer vision (Deep Learning Facial Emotion Recognition), and physiological Digital Twin computational models into a unified, actionable patient monitoring system.

The platform continuously consumes multi-modal data stream inputs (Heart Rate, Blood Oxygen SpO2, Body Temperature, Galvanic Skin Response, and Facial Emotion Expression) to build a dynamic digital twin of a patient's physical and psychological state, detecting acute stress spikes, predicting cardiovascular risks, providing conversational AI assistance, and generating automated clinical recommendations.

---

## 2. PROJECT GOALS
1. **OpenAPI-First API Gateway**: Standardize all service boundaries and DTO contracts through modular OpenAPI 3.0 specs prior to controller code creation.
2. **Decoupled Microservice Isolation**: Maintain complete decoupling between the high-throughput Node.js API backend and the Python Deep Learning AI microservice (`emotion_detection`).
3. **Real-Time IoT Telemetry Stream Processing**: Ingest multi-sensor payload streams from ESP32 microcontrollers with sub-second response latency.
4. **Physiological Digital Twin Modeling**: Construct stateful mathematical baselines for every patient to track health score shifts and detect subtle physiological anomalies.
5. **Multi-Factor Risk Assessment**: Combine computer vision facial emotion indicators with biometric vitals for high-accuracy stress and cardiovascular risk rating.
6. **Strict Enterprise Maintainability**: Enforce zero-implicit-any TypeScript, 3-tier clean architecture, schema validation, and structured audit logs.

---

## 3. ARCHITECTURE OVERVIEW

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ESP32 IoT Sensor Nodes                          │
│        (Heart Rate BPM, SpO2 %, Temperature °C, Emotion Detection)     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / MQTT Telemetry
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Node.js API Gateway Backend                        │
│       (Clean 3-Tier Architecture: Controllers -> Services -> Repos)    │
└──────────────┬────────────────────┬───────────────────┬────────────────┘
               │                    │                   │
               ▼                    ▼                   ▼
┌─────────────────────────┐  ┌─────────────┐  ┌──────────────────────────┐
│  MongoDB Database Store │  │ Redis Cache │  │ Python AI Microservice   │
│  (Vitals, Twins, Users) │  │ (Pub/Sub)   │  │ (Emotion CNN & Chatbot)  │
└─────────────────────────┘  └─────────────┘  └──────────────────────────┘
               │                    │                   │
               └────────────────────┼───────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Future React Frontend UI                        │
│                 (Real-Time Vitals Dashboard & Chatbot)                 │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 4. MICROSERVICES ARCHITECTURE
The system is divided into decoupled microservices:

1. **Node.js Core Backend Service**: Handles request routing, user management, JWT auth, device registration, sensor ingestion, Digital Twin state computation, cardiovascular & stress algorithms, recommendation dispatching, and database persistence.
2. **Python AI Microservice (`emotion_detection`)**: An independent, self-contained Python microservice containing OpenCV face cascading, TensorFlow/Keras emotion CNN models (`model.h5`, `face_emotion_model.h5`), and intent-based NLP chatbots (`MLChatbot`). Inter-service communication with Node.js occurs strictly via REST APIs (`POST /emotion/predict`, `POST /chat`, `POST /health-analysis`).

---

## 5. FOLDER STRUCTURE

```
Health AI/
├── CLAUDE.md                             # Mandatory Agent & Coding Guidelines
├── ProjectPlan.md                        # Master Project Technical Specification (SSOT)
├── backend/                              # Node.js Express/TypeScript Backend Gateway
│   └── openapi/                          # OpenAPI 3.0 Specification Files
│       ├── openapi.yaml                  # Root OpenAPI Specification Entrypoint
│       ├── components/                   # Reusable Components Directory
│       │   ├── index.yaml                # Components Root Index
│       │   ├── parameters/               # Shared HTTP Parameter Definitions
│       │   ├── securitySchemes/          # JWT & API Key Security Definitions
│       │   └── schemas/                  # Reusable Component Data Schemas
│       │       ├── index.yaml            # Schemas Root Index
│       │       ├── common/               # Core Standardized Schemas
│       │       ├── auth/                 # Authentication Request/Response DTOs
│       │       ├── users/                # User Management DTOs
│       │       ├── devices/              # ESP32 Device DTOs
│       │       ├── sensors/              # Telemetry & Sensor DTOs
│       │       ├── emotion/              # Emotion AI DTOs
│       │       ├── digitalTwin/          # Digital Twin Engine DTOs
│       │       ├── stress/               # Stress Analysis DTOs
│       │       ├── cardiovascular/       # Cardiovascular Risk DTOs
│       │       ├── recommendations/      # Recommendation Engine DTOs
│       │       ├── reports/              # Report Generation DTOs
│       │       ├── chatbot/              # Emotion Chatbot DTOs
│       │       ├── notifications/        # Notification Service DTOs
│       │       ├── health/               # System Health DTOs
│       │       └── system/               # System Metrics DTOs
│       └── paths/                        # OpenAPI Path Operations Directory
│           ├── index.yaml                # Paths Root Index
│           ├── auth/                     # Auth Endpoints
│           ├── users/                    # User Endpoints
│           ├── devices/                  # Device Endpoints
│           ├── sensors/                  # Sensor Endpoints
│           ├── emotion/                  # Emotion AI Service Endpoints
│           ├── digitalTwin/              # Digital Twin Endpoints
│           ├── stress/                   # Stress Endpoints
│           ├── cardiovascular/           # Cardiovascular Endpoints
│           ├── recommendations/          # Recommendation Endpoints
│           ├── reports/                  # Report Endpoints
│           ├── chatbot/                  # Chatbot Endpoints
│           ├── notifications/            # Notification Endpoints
│           ├── health/                   # Health Check Endpoints
│           └── system/                   # System Metrics Endpoints
└── emotion_detection/                    # Python AI Microservice (Preserved untouched)
    ├── app.py                            # Flask AI Microservice Gateway
    ├── face.py                           # MLChatbot & Medicine Reminder Core Logic
    ├── model.h5                          # Keras Facial Emotion CNN Model
    └── requirements.txt                  # Python AI Dependencies
```

---

## 6. BACKEND STRUCTURE
When backend implementation begins, the `backend/` codebase will strictly adhere to clean 3-tier architecture:

```
backend/src/
├── config/             # Environment configurations & Zod schema validation
├── constants/          # Global enums, error codes, HTTP constants
├── controllers/        # HTTP Handlers (Request parsing & DTO validation only)
├── services/           # Pure Business Logic, Digital Twin core, algorithms
├── repositories/       # MongoDB Data Access Layer & ORM query abstractions
├── models/             # Mongoose Schemas & TypeScript interfaces
├── middlewares/        # JWT Auth, RBAC, Rate Limiting, Error Envelope Handler
├── routes/             # Express Router bindings mapped to OpenAPI endpoints
└── utils/              # Structured Pino logger, cryptography, math functions
```

---

## 7. OPENAPI STRUCTURE
The OpenAPI specification in `backend/openapi/` is modularized for clarity:
- **`openapi.yaml`**: Standard 3.0.3 declaration referencing `$ref: './paths/index.yaml'` and `$ref: './components/index.yaml'`.
- **`paths/index.yaml`**: Maps relative route templates (e.g. `/auth/register`, `/digital-twin/{userId}`) to feature endpoint files.
- **`components/schemas/common/`**: Contains standardized envelopes (`ErrorResponse`, `SuccessResponse`, `Pagination`, `Metadata`, `BaseEntity`, `ValidationError`, `ApiResponse`).
- **Feature folders in `schemas/` and `paths/`**: Feature-specific DTOs and operation paths.

---

## 8. TECHNOLOGY STACK

| Layer | Technologies | Role & Function |
| :--- | :--- | :--- |
| **IoT Hardware** | ESP32, MAX30102 (Heart Rate & SpO2), MLX90614 / DS18B20 (Temperature) | Biometric vital signs collection and Wi-Fi streaming |
| **API Gateway** | Node.js (v20+), Express.js, TypeScript 5+ | Central HTTP Router, Business Logic, Validation |
| **API Spec** | OpenAPI 3.0.3, Redocly CLI | API-First design, contract enforcement, linting |
| **Database** | MongoDB (v7+), Mongoose ORM | Document storage for telemetry, users, digital twins |
| **Caching** | Redis (v7+) | Telemetry caching, session validation, Pub/Sub |
| **AI Microservice** | Python 3.10+, Flask, TensorFlow 2.x, OpenCV | CNN Facial Emotion inference & intent NLP Chatbot |
| **Validation** | Zod / Joi Schema Validation | Fast fail input payload guard on every endpoint |
| **Logging** | Pino Structured JSON Logger | Contextual audit logging with correlation IDs |

---

## 9. DATABASE DESIGN
The backend utilizes MongoDB to handle dynamic health records and time-series sensor ingestion:
- **Relational Integrity via ObjectIds**: Soft foreign keys link `Device`, `SensorReading`, `DigitalTwin`, `StressAssessment`, and `CardiovascularRisk` documents to `User` ObjectIds.
- **Indexed Read Queries**: Compound indexing on `{ userId: 1, timestamp: -1 }` for high-speed chronological vitals querying.
- **TTL Telemetry Archival**: Optional MongoDB Time-To-Live index on raw high-frequency sensor readings to optimize storage.

---

## 10. DATABASE COLLECTIONS & SCHEMAS

### 10.1 `users` Collection
- `_id`: ObjectId
- `email`: String (Unique, Indexed)
- `passwordHash`: String
- `firstName`: String
- `lastName`: String
- `phoneNumber`: String
- `role`: String Enum [`PATIENT`, `CLINICIAN`, `ADMIN`]
- `isActive`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### 10.2 `devices` Collection
- `_id`: ObjectId
- `deviceId`: String (Unique, Indexed)
- `macAddress`: String (Unique)
- `deviceType`: String
- `firmwareVersion`: String
- `status`: String Enum [`ONLINE`, `OFFLINE`, `ERROR`]
- `userId`: ObjectId (Ref `users`)
- `lastSeenAt`: Date

### 10.3 `sensor_readings` Collection
- `_id`: ObjectId
- `deviceId`: String (Indexed)
- `userId`: ObjectId (Indexed)
- `sensorType`: String Enum [`HEART_RATE`, `TEMPERATURE`, `SPO2`, `EMOTION`]
- `value`: Number
- `unit`: String
- `timestamp`: Date (Indexed)

### 10.4 `digital_twins` Collection
- `_id`: ObjectId
- `userId`: ObjectId (Unique, Indexed)
- `overallHealthScore`: Number (0-100)
- `healthState`: String Enum [`OPTIMAL`, `STABLE`, `ELEVATED_STRESS`, `AT_RISK`, `CRITICAL`]
- `baselineHeartRate`: Number
- `baselineTemperature`: Number
- `baselineSpO2`: Number
- `dominantEmotion`: String
- `currentStressScore`: Number
- `currentCardioRiskScore`: Number
- `lastSyncTimestamp`: Date

---

## 11. FEATURE MODULES
The platform consists of 14 integrated domain feature modules:
1. **Authentication (`auth`)**: User signup, login, JWT token refresh, session revocation, password management.
2. **Users (`users`)**: Patient and clinician user profile management and RBAC.
3. **Devices (`devices`)**: ESP32 IoT hardware registration, status polling, and device lifecycle management.
4. **Sensors (`sensors`)**: High-throughput telemetry ingestion, vitals snapshot fetching, and historical chart querying.
5. **Emotion (`emotion`)**: Facial emotion classification proxying and historical emotion logs.
6. **Digital Twin (`digitalTwin`)**: Stateful physiological baselining, state modeling, and predictive trend analysis.
7. **Stress Analysis (`stress`)**: Acute stress evaluation algorithm engine.
8. **Cardiovascular Risk (`cardiovascular`)**: Cardiovascular threat estimation combining vitals and demographics.
9. **Recommendation Engine (`recommendations`)**: Automated clinical and lifestyle wellness suggestion dispatching.
10. **Reports (`reports`)**: Asynchronous PDF/JSON clinical summary document generation.
11. **Chatbot (`chatbot`)**: Emotion-aware mental health and medical assistant proxying to Python AI.
12. **Notifications (`notifications`)**: Multi-priority health alert notification service.
13. **Health (`health`)**: Microservices liveness, readiness, and connectivity health probes.
14. **System (`system`)**: Infrastructure telemetry and runtime memory metrics.

---

## 12. COMPREHENSIVE ENDPOINT DIRECTORY
> **Base Server URL**: `http://localhost:5000/api/v1` (Local Dev) / `https://api.healthai.org/api/v1` (Production)

| Method | Endpoint Path (Relative) | Feature Module | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Authentication | Public |
| `POST` | `/auth/login` | Authentication | Public |
| `POST` | `/auth/refresh-token` | Authentication | Public |
| `POST` | `/auth/logout` | Authentication | Bearer |
| `POST` | `/auth/forgot-password` | Authentication | Public |
| `POST` | `/auth/reset-password` | Authentication | Public |
| `GET` | `/auth/profile` | Authentication | Bearer |
| `PUT` | `/auth/change-password` | Authentication | Bearer |
| `GET` | `/users` | Users | Bearer (Admin) |
| `POST` | `/users` | Users | Bearer (Admin) |
| `GET` | `/users/{userId}` | Users | Bearer |
| `PUT` | `/users/{userId}` | Users | Bearer |
| `DELETE` | `/users/{userId}` | Users | Bearer (Admin) |
| `GET` | `/devices` | Devices | Bearer |
| `POST` | `/devices` | Devices | Bearer / API-Key |
| `GET` | `/devices/{id}` | Devices | Bearer |
| `PUT` | `/devices/{id}` | Devices | Bearer |
| `DELETE` | `/devices/{id}` | Devices | Bearer (Admin) |
| `GET` | `/devices/{id}/status` | Devices | Bearer / API-Key |
| `POST` | `/sensors/readings` | Sensors | API-Key |
| `GET` | `/sensors/readings/latest` | Sensors | Bearer |
| `GET` | `/sensors/readings/history` | Sensors | Bearer |
| `GET` | `/sensors/heart-rate` | Sensors | Bearer |
| `GET` | `/sensors/temperature` | Sensors | Bearer |
| `GET` | `/sensors/spo2` | Sensors | Bearer |
| `POST` | `/emotion/predict` | Emotion AI | Bearer |
| `GET` | `/emotion/logs` | Emotion AI | Bearer |
| `GET` | `/emotion/latest` | Emotion AI | Bearer |
| `POST` | `/digital-twin` | Digital Twin | Bearer |
| `GET` | `/digital-twin/{userId}` | Digital Twin | Bearer |
| `PUT` | `/digital-twin/{userId}` | Digital Twin | Bearer |
| `GET` | `/digital-twin/{userId}/state` | Digital Twin | Bearer |
| `GET` | `/digital-twin/{userId}/history` | Digital Twin | Bearer |
| `GET` | `/digital-twin/{userId}/trends` | Digital Twin | Bearer |
| `POST` | `/stress/assess` | Stress Analysis | Bearer |
| `GET` | `/stress/current` | Stress Analysis | Bearer |
| `GET` | `/stress/history` | Stress Analysis | Bearer |
| `POST` | `/cardiovascular/assess` | Cardio Risk | Bearer |
| `GET` | `/cardiovascular/current` | Cardio Risk | Bearer |
| `GET` | `/cardiovascular/history` | Cardio Risk | Bearer |
| `POST` | `/recommendations/generate` | Recommendations | Bearer |
| `GET` | `/recommendations/active` | Recommendations | Bearer |
| `PUT` | `/recommendations/{id}/acknowledge` | Recommendations | Bearer |
| `POST` | `/reports/generate` | Reports | Bearer |
| `GET` | `/reports` | Reports | Bearer |
| `GET` | `/reports/{id}` | Reports | Bearer |
| `GET` | `/reports/{id}/download` | Reports | Bearer |
| `POST` | `/chatbot/message` | AI Chatbot | Bearer |
| `GET` | `/chatbot/history` | AI Chatbot | Bearer |
| `DELETE` | `/chatbot/history` | AI Chatbot | Bearer |
| `POST` | `/notifications/send` | Notifications | Bearer |
| `GET` | `/notifications` | Notifications | Bearer |
| `PUT` | `/notifications/{id}/read` | Notifications | Bearer |
| `PUT` | `/notifications/read-all` | Notifications | Bearer |
| `GET` | `/health` | System Health | Public |
| `GET` | `/health/liveness` | System Health | Public |
| `GET` | `/health/readiness` | System Health | Public |
| `GET` | `/system/info` | System Metrics | Public |
| `GET` | `/system/metrics` | System Metrics | Bearer (Admin) |

---

## 13. DETAILED ENDPOINT PURPOSE & SPECIFICATIONS

### 13.1 Authentication Endpoints
- **`POST /auth/register`**: Validates user details and inserts a new patient or clinician account into MongoDB.
- **`POST /auth/login`**: Verifies password hash using Argon2/Bcrypt and issues short-lived JWT access tokens & refresh tokens.
- **`POST /auth/refresh-token`**: Validates cryptographic refresh token and returns a fresh JWT access token.
- **`POST /auth/logout`**: Revokes current user refresh token session in Redis cache.

### 13.2 Sensor Ingestion Endpoints
- **`POST /sensors/readings`**: Accepts high-frequency batch JSON telemetry arrays from hardware ESP32 microcontrollers over HTTPS/API-Key.
- **`GET /sensors/readings/latest`**: Returns the latest reading snapshot of heart rate, temperature, and SpO2 for frontend display.

### 13.3 Emotion & Chatbot AI Endpoints
- **`POST /emotion/predict`**: Accepts base64 camera frame image, proxies request to Python `emotion_detection` microservice, and logs predicted emotion.
- **`POST /chatbot/message`**: Forwards user queries with current emotional state context to the Python `MLChatbot` model.

### 13.4 Digital Twin & Analytics Endpoints
- **`POST /digital-twin`**: Establishes baseline physiological vital parameters for a newly registered patient.
- **`GET /digital-twin/{userId}/state`**: Dynamically calculates the overall health state (`OPTIMAL`, `STABLE`, `ELEVATED_STRESS`, `AT_RISK`, `CRITICAL`).

---

## 14. AI MICROSERVICE OVERVIEW
The existing `emotion_detection/` Python project serves as an independent AI Microservice. Node.js backend acts as an API gateway that calls Python via REST endpoints over internal localhost/Docker bridge network.

```
┌─────────────────────────┐          REST HTTP          ┌─────────────────────────┐
│ Node.js Backend Gateway │ ──────────────────────────> │  Python AI Microservice │
│ (Port 5000)             │ <────────────────────────── │  (Flask / Port 5001)    │
└─────────────────────────┘      JSON Prediction        └─────────────────────────┘
```

---

## 15. EMOTION DETECTION AI SERVICE INTEGRATION
The Python service utilizes OpenCV Haar-Cascades for face detection and a trained Keras Convolutional Neural Network (`model.h5`) to classify 7 distinct emotions:
1. `Angry`
2. `Disgust`
3. `Fear`
4. `Happy`
5. `Neutral`
6. `Sad`
7. `Surprise`

---

## 16. DIGITAL TWIN COMPUTATIONAL ENGINE
The Digital Twin module creates a stateful digital mirror of patient physiological health.
- **Dynamic Baseline Computation**: Keeps rolling averages of baseline vitals over a 14-day window.
- **Health Score Formula**:
  $$\text{HealthScore} = 100 - (w_1 \cdot \Delta HR + w_2 \cdot \Delta SpO2 + w_3 \cdot \Delta Temp + w_4 \cdot \text{StressIndex})$$
- **State Classification**: Automatically transitions patient state from `OPTIMAL` down to `CRITICAL` when vital deviations exceed 2.5 standard deviations.

---

## 17. STRESS ANALYSIS SUBSYSTEM
Calculates multi-modal stress scores (0 to 100) by combining:
- **Physiological Factors**: Heart Rate Spikes ($>15\%$ above baseline), SpO2 drops, and Body Temperature shifts.
- **Psychological Factors**: Detected negative facial emotions (`Sad`, `Fear`, `Angry`).

---

## 18. CARDIOVASCULAR RISK ASSESSMENT ENGINE
Evaluates real-time cardiovascular threat risk categories (`LOW`, `MODERATE`, `HIGH`, `CRITICAL`). Incorporates confirmed continuous telemetry:
- **Heart Rate (MAX30102)**: Detects sustained tachycardia ($>100\text{ BPM}$) or bradycardia ($<60\text{ BPM}$).
- **Blood Oxygen SpO₂ (MAX30102)**: Evaluates hypoxemia thresholds ($SpO2 < 95\%$).
- **Body Temperature**: Detects hyperthermia/fever impacts on cardiovascular workload.
- **Facial Emotion**: Incorporates negative emotional stress triggers from the Python AI microservice.
- **Real-Time Stress Score**: Factors in acute stress index calculation.
- **Digital Twin Health Trends**: Baseline physiological deviation analysis over historical time windows.

*Future Extension*: The schema includes optional nullable `systolicBp` and `diastolicBp` fields to allow seamless future Blood Pressure sensor integration without breaking API contracts.

---

## 19. PERSONALIZED RECOMMENDATION ENGINE
Triggers automated wellness recommendations based on active risk level:
- **Acute Stress Detected**: Dispatches box breathing exercises and grounding prompts.
- **Hypoxia Warning ($SpO2 < 92\%$)**: Triggers immediate posture adjustment alert and notifies assigned clinician.
- **Medication Reminders**: Schedules and dispatches alerts synced with patient prescription records.

---

## 20. AUTHENTICATION & AUTHORIZATION FLOW

```
Patient/Clinician      Node.js Gateway       MongoDB Store       Redis Cache
       │                      │                    │                 │
       │─── 1. POST /login ──>│                    │                 │
       │                      │── 2. Verify Hash ─>│                 │
       │                      │<── 3. User Data ───│                 │
       │                      │─────────────────────────────────────>│ 4. Store Session
       │<── 5. JWT Tokens ────│                                      │
       │    (Access + Refresh)│                                      │
```

---

## 21. SENSOR TELEMETRY INGESTION FLOW

```
ESP32 Hardware        Node.js Ingestion      Redis Pub/Sub       MongoDB Storage
     │                       │                    │                     │
     │── 1. Batch Telemetry >│                    │                     │
     │   (X-API-KEY Header)  │── 2. Validate Zod ─│                     │
     │                       │───────────────────>│ 3. Publish Stream   │
     │                       │─────────────────────────────────────────>│ 4. Insert Batch
     │<── 5. HTTP 202 ───────│                                          │
```

---

## 22. FUTURE FRONTEND ARCHITECTURE
The future `frontend/` single-page application will be built using **React 18+**, **TypeScript**, **Tailwind CSS**, and **Recharts**:
- **Real-Time Telemetry Dashboard**: Live line charts rendering heart rate, SpO2, and temperature streamed via WebSockets/Server-Sent Events.
- **Digital Twin Visualizer**: Interactive composite score breakdown card showing real-time health score shifts.
- **Emotion AI Chatbot Drawer**: Floating conversational UI connecting patients to the AI Assistant.

---

## 23. FUTURE ML ENGINE INTEGRATION
Future iterations will incorporate an advanced `ml-engine/` service featuring:
- **Long Short-Term Memory (LSTM)** models for 24-hour predictive vitals forecasting.
- **ECG Arrhythmia Detection** using lightweight 1D-CNN architectures.

---

## 24. DEPLOYMENT & CONTAINERIZATION PLAN
The platform will be containerized using **Docker** and **Docker Compose**:
- **`backend-service`**: Node.js Alpine container with health probes (`GET /health/liveness`).
- **`ai-service`**: Python 3.10 slim container with OpenCV and TensorFlow CPU optimizations.
- **`database`**: MongoDB 7.0 replica set.
- **`cache`**: Redis 7.2 container.

---

## 25. DEVELOPMENT PHASES & ROADMAP

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: AI Inspection & OpenAPI-First Design (COMPLETED)               │
│ - Inspected Python AI microservice (`emotion_detection`)               │
│ - Created complete modular OpenAPI 3.0.3 specification                 │
│ - Created Master Project Plan (`ProjectPlan.md`)                       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 2: Node.js Backend Core Infrastructure (NEXT PHASE)              │
│ - Initialize Node.js TypeScript project structure                       │
│ - Build centralized Zod config, Pino logger, and database connector    │
│ - Implement JWT authentication & user RBAC middlewares                 │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 3: Feature Controllers, Domain Logic & AI Integration            │
│ - Implement Sensor Ingestion, Digital Twin, Stress & Cardio services   │
│ - Integrate REST bridge to Python AI Microservice (`emotion_detection`)│
│ - Unit & Integration Test Suite execution                              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 26. CODING STANDARDS & ENGINEERING RULES
*Strictly adhering to `CLAUDE.md`*:
1. **Zero `any` Typing**: `"strict": true` enforced across all TypeScript files.
2. **Standard Error Envelope**: All API error responses must match the standardized JSON structure.
3. **No Empty Catch Blocks**: Swallowing errors is strictly prohibited.
4. **No Direct `process.env` Calls**: All environment configurations must be accessed via centralized `config.ts`.
5. **Clean 3-Tier Layering**: Controllers must contain zero business logic; Repositories must contain zero HTTP logic.

---

## 27. API DESIGN PRINCIPLES
- **RESTful Resource Hierarchy**: Standard singular/plural noun relative resource URLs (e.g. `/devices`, `/users/{userId}`). Base URL: `/api/v1`.
- **Predictable HTTP Status Codes**:
  - `200 OK`: Successful synchronous operation.
  - `201 Created`: Resource successfully initialized.
  - `202 Accepted`: Telemetry batch accepted for asynchronous processing.
  - `400 Bad Request`: Payload fails schema validation.
  - `401 Unauthorized`: Missing or expired JWT token.
  - `403 Forbidden`: Authenticated user lacks required RBAC permission.
  - `404 Not Found`: Target resource identifier does not exist.
  - `503 Service Unavailable`: AI Microservice or Database unreachable.

---

## 28. NAMING CONVENTIONS & SCHEMA RULES
- **Directories & Source Files**: `kebab-case` (e.g. `ingest-readings.yaml`, `digital-twin-service.ts`).
- **Data Schemas & Interfaces**: `PascalCase` (e.g. `PredictEmotionRequest`, `DigitalTwin`).
- **Properties & Methods**: `camelCase` (e.g. `overallHealthScore`, `calculateStressIndex()`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_PAGINATION_LIMIT`).

---

## 29. TESTING & QUALITY VERIFICATION STRATEGY
- **OpenAPI Schema Linting**: Automated specification validation using Redocly CLI (`npx @redocly/cli lint openapi.yaml`).
- **Unit Testing**: Jest unit tests covering pure domain logic in `DigitalTwin`, `Stress`, and `Cardio` services.
- **Integration Testing**: Supertest end-to-end HTTP route verification validating status codes and error payloads.
- **Continuous Quality Checks**:
  1. `npm run type-check` (`tsc --noEmit`)
  2. `npm run lint` (`eslint .`)
  3. `npm test` (`jest`)

---

## 30. FUTURE PROJECT ROADMAP & SCALING
1. **MQTT Telemetry Integration**: Implement EMQX / Eclipse Mosquitto MQTT broker for streaming high-frequency sensor readings directly from hardware.
2. **FHIR / HL7 Interoperability**: Add compliance adapters for clinical Electronic Health Record (EHR) data export.
3. **Edge AI Inference**: Quantize TensorFlow Keras models to TensorFlow Lite (`.tflite`) for local edge deployment on hardware nodes.
