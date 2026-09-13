import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Config } from '../config/env.config';
import { logger } from '../config/logger';
import {
  UserModel,
  UserRole,
  PatientModel,
  Gender,
  ActivityLevel,
  DeviceModel,
  DeviceStatus,
  DeviceType,
  ConnectionProtocol,
  SensorReadingModel,
  SensorType,
  CardiovascularAssessmentModel,
  CardiovascularRiskLevel,
  StressAssessmentModel,
  StressLevel,
  EmotionType,
  DigitalTwinModel,
  TwinHealthState,
  RecommendationModel,
  RecommendationCategory,
  RecommendationPriority,
  ChatSessionModel,
  ChatSessionStatus,
  ChatMessageModel,
  ChatSender,
  ReportModel,
  ReportType,
  ReportFormat,
  ReportStatus,
} from '../models';

async function seedDatabase(): Promise<void> {
  try {
    logger.info('Connecting to MongoDB database for seeding...');
    await mongoose.connect(Config.MONGODB_URI);
    logger.info('Successfully connected to MongoDB.');

    // 1. Purge all existing data across all collections
    logger.info('Clearing existing development records...');
    await Promise.all([
      UserModel.deleteMany({}),
      PatientModel.deleteMany({}),
      DeviceModel.deleteMany({}),
      SensorReadingModel.deleteMany({}),
      CardiovascularAssessmentModel.deleteMany({}),
      StressAssessmentModel.deleteMany({}),
      DigitalTwinModel.deleteMany({}),
      RecommendationModel.deleteMany({}),
      ChatSessionModel.deleteMany({}),
      ChatMessageModel.deleteMany({}),
      ReportModel.deleteMany({}),
    ]);
    logger.info('All collections cleared.');

    // 2. Create single patient user account
    const rawPassword = 'Karthi@1111';
    const passwordHash = await bcrypt.hash(rawPassword, Config.BCRYPT_SALT_ROUNDS || 10);

    const user = await UserModel.create({
      email: 'karthikeyanm2209@gmail.com',
      passwordHash,
      firstName: 'Karthikeyan',
      lastName: 'M',
      phoneNumber: '+917339321071',
      age: 24,
      gender: Gender.MALE,
      role: UserRole.PATIENT,
      isEmailVerified: true,
      isPhoneVerified: true,
      isActive: true,
      lastLoginAt: new Date(),
    });
    logger.info({ userId: user.id, email: user.email }, 'Seeded User account created.');

    // 3. Create Patient profile
    const patient = await PatientModel.create({
      userId: user._id,
      gender: Gender.MALE,
      dateOfBirth: new Date('2000-09-22'),
      bloodType: 'O+',
      heightCm: 175,
      weightKg: 70.0,
      bmi: 22.9,
      smokingStatus: 0,
      familyHistoryCvd: 0,
      activityLevel: ActivityLevel.MODERATELY_ACTIVE,
      dailyStepGoal: 8500,
      targetSleepHours: 8.0,
      emergencyContact: {
        name: 'Parent / Primary Contact',
        relationship: 'Family',
        phoneNumber: '+919842000000',
      },
      medicalHistorySummary:
        'Healthy adult patient. Active lifestyle with continuous smartwatch bio-telemetry monitoring.',
      isActive: true,
    });
    logger.info({ patientId: patient.id }, 'Seeded Patient profile created.');

    // 4. Create connected telemetry Device (Smartwatch)
    const device = await DeviceModel.create({
      deviceId: 'WATCH_HEALTH_AI_PRO_01',
      name: 'Health AI Pulse Pro Smartwatch',
      macAddress: 'AA:BB:CC:DD:EE:FF',
      deviceType: DeviceType.SMARTWATCH,
      supportedSensors: [
        SensorType.HEART_RATE,
        SensorType.RESTING_HEART_RATE,
        SensorType.SPO2,
        SensorType.TEMPERATURE,
        SensorType.BLOOD_PRESSURE_SYSTOLIC,
        SensorType.BLOOD_PRESSURE_DIASTOLIC,
        SensorType.HRV,
        SensorType.STEPS,
        SensorType.CALORIES_BURNED,
        SensorType.DISTANCE,
        SensorType.SLEEP_HOURS,
        SensorType.SLEEP_EFFICIENCY,
      ],
      batteryLevel: 94,
      connectionProtocol: ConnectionProtocol.BLE,
      syncFrequencySeconds: 5,
      firmwareVersion: 'v2.1.0',
      status: DeviceStatus.ONLINE,
      userId: user._id,
      patientId: patient._id,
      isActive: true,
      lastSeenAt: new Date(),
    });
    logger.info({ deviceId: device.deviceId }, 'Seeded Smartwatch Device created.');

    // 5. Create realistic time-series SensorReading documents from Smartwatch
    const now = Date.now();
    const sensorReadingsData = [
      // Heart Rate readings (BPM)
      { sensorType: SensorType.HEART_RATE, value: 72, unit: 'bpm', minutesAgo: 60 },
      { sensorType: SensorType.HEART_RATE, value: 74, unit: 'bpm', minutesAgo: 50 },
      { sensorType: SensorType.HEART_RATE, value: 71, unit: 'bpm', minutesAgo: 40 },
      { sensorType: SensorType.HEART_RATE, value: 75, unit: 'bpm', minutesAgo: 30 },
      { sensorType: SensorType.HEART_RATE, value: 73, unit: 'bpm', minutesAgo: 20 },
      { sensorType: SensorType.HEART_RATE, value: 72, unit: 'bpm', minutesAgo: 10 },

      // Resting Heart Rate (BPM)
      { sensorType: SensorType.RESTING_HEART_RATE, value: 64, unit: 'bpm', minutesAgo: 15 },

      // SpO2 readings (%)
      { sensorType: SensorType.SPO2, value: 98.5, unit: '%', minutesAgo: 60 },
      { sensorType: SensorType.SPO2, value: 99.0, unit: '%', minutesAgo: 50 },
      { sensorType: SensorType.SPO2, value: 98.2, unit: '%', minutesAgo: 40 },
      { sensorType: SensorType.SPO2, value: 98.6, unit: '%', minutesAgo: 30 },
      { sensorType: SensorType.SPO2, value: 99.0, unit: '%', minutesAgo: 20 },
      { sensorType: SensorType.SPO2, value: 98.5, unit: '%', minutesAgo: 10 },

      // Temperature readings (°C)
      { sensorType: SensorType.TEMPERATURE, value: 36.5, unit: '°C', minutesAgo: 60 },
      { sensorType: SensorType.TEMPERATURE, value: 36.6, unit: '°C', minutesAgo: 50 },
      { sensorType: SensorType.TEMPERATURE, value: 36.6, unit: '°C', minutesAgo: 40 },
      { sensorType: SensorType.TEMPERATURE, value: 36.7, unit: '°C', minutesAgo: 30 },
      { sensorType: SensorType.TEMPERATURE, value: 36.5, unit: '°C', minutesAgo: 20 },
      { sensorType: SensorType.TEMPERATURE, value: 36.6, unit: '°C', minutesAgo: 10 },

      // Blood Pressure (mmHg)
      { sensorType: SensorType.BLOOD_PRESSURE_SYSTOLIC, value: 118, unit: 'mmHg', minutesAgo: 30 },
      { sensorType: SensorType.BLOOD_PRESSURE_DIASTOLIC, value: 78, unit: 'mmHg', minutesAgo: 30 },

      // Heart Rate Variability (ms)
      { sensorType: SensorType.HRV, value: 55, unit: 'ms', minutesAgo: 20 },

      // Step count & Activity
      { sensorType: SensorType.STEPS, value: 8420, unit: 'steps', minutesAgo: 10 },
      { sensorType: SensorType.CALORIES_BURNED, value: 2150, unit: 'kcal', minutesAgo: 10 },
      { sensorType: SensorType.DISTANCE, value: 5.6, unit: 'km', minutesAgo: 10 },

      // Sleep metrics
      { sensorType: SensorType.SLEEP_HOURS, value: 7.8, unit: 'hours', minutesAgo: 240 },
      { sensorType: SensorType.SLEEP_EFFICIENCY, value: 0.89, unit: 'ratio', minutesAgo: 240 },

      // Emotion reading
      { sensorType: SensorType.EMOTION, value: 1, unit: 'state', minutesAgo: 10 },
    ];

    const sensorReadings = await SensorReadingModel.insertMany(
      sensorReadingsData.map((item) => ({
        deviceId: device.deviceId,
        userId: user._id,
        patientId: patient._id,
        sensorType: item.sensorType,
        value: item.value,
        unit: item.unit,
        timestamp: new Date(now - item.minutesAgo * 60 * 1000),
      })),
    );
    logger.info({ count: sensorReadings.length }, 'Seeded Sensor readings inserted.');

    // 6. Create CardiovascularAssessment
    const cardioAssessment = await CardiovascularAssessmentModel.create({
      userId: user._id,
      patientId: patient._id,
      riskScore: 18.5,
      riskLevel: CardiovascularRiskLevel.LOW,
      contributingFactors: ['Normal resting heart rate', 'Stable blood oxygen saturation'],
      confidence: 96.0,
      explanation:
        'Continuous PPG biometrics indicate normal vascular tone and low cardiovascular risk.',
      recommendations: [
        'Maintain regular physical activity (at least 30 mins daily).',
        'Keep sodium intake within standard dietary guidelines.',
      ],
      heartRate: 72,
      spo2: 98.5,
      temperature: 36.6,
      currentEmotion: EmotionType.HAPPY,
      stressScore: 22.0,
      digitalTwinHealthScore: 92.5,
      systolicBp: 118,
      diastolicBp: 78,
      timestamp: new Date(),
    });
    logger.info({ cardioId: cardioAssessment.id }, 'Seeded Cardiovascular Assessment created.');

    // 7. Create StressAssessment
    const stressAssessment = await StressAssessmentModel.create({
      userId: user._id,
      patientId: patient._id,
      stressScore: 22.0,
      stressLevel: StressLevel.LOW,
      contributingFactors: [
        'Stable Heart Rate Variability',
        'Normal galvanic skin response baseline',
      ],
      confidence: 94.0,
      heartRate: 72,
      temperature: 36.6,
      spo2: 98.5,
      currentEmotion: EmotionType.HAPPY,
      timestamp: new Date(),
    });
    logger.info({ stressId: stressAssessment.id }, 'Seeded Stress Assessment created.');

    // 8. Create DigitalTwin state
    const digitalTwin = await DigitalTwinModel.create({
      userId: user._id,
      patientId: patient._id,
      overallHealthScore: 92.5,
      healthState: TwinHealthState.OPTIMAL,
      baselineHeartRate: 72.0,
      baselineTemperature: 36.5,
      baselineSpO2: 98.5,
      dominantEmotion: EmotionType.HAPPY,
      currentStressScore: 22.0,
      currentCardioRiskScore: 18.5,
      confidence: 95.0,
      lastSyncTimestamp: new Date(),
    });
    logger.info({ twinId: digitalTwin.id }, 'Seeded Digital Twin state created.');

    // 9. Create Recommendations
    const recommendations = await RecommendationModel.insertMany([
      {
        userId: user._id,
        patientId: patient._id,
        title: 'Daily Hydration Goal',
        description:
          'Maintain 2.5 liters of water intake daily to support cellular hydration and metabolic efficiency.',
        category: RecommendationCategory.LIFESTYLE,
        priority: RecommendationPriority.MEDIUM,
        source: 'Digital Twin AI Engine',
        isAcknowledged: false,
      },
      {
        userId: user._id,
        patientId: patient._id,
        title: 'Evening Relaxing Routine',
        description:
          'Engage in a 10-minute evening deep breathing exercise to lower physiological stress baseline.',
        category: RecommendationCategory.STRESS_RELIEF,
        priority: RecommendationPriority.LOW,
        source: 'Stress Analytics Model',
        isAcknowledged: false,
      },
      {
        userId: user._id,
        patientId: patient._id,
        title: 'ESP32 Device Synchronized',
        description:
          'Telemetry streams are transmitting active biometric signals to your Health AI portal.',
        category: RecommendationCategory.CLINICAL_ALERT,
        priority: RecommendationPriority.MEDIUM,
        source: 'Gateway Telemetry Daemon',
        isAcknowledged: false,
      },
    ]);
    logger.info({ count: recommendations.length }, 'Seeded Recommendations created.');

    // 10. Create ChatSession and ChatMessage documents
    const chatSession = await ChatSessionModel.create({
      userId: user._id,
      patientId: patient._id,
      title: 'Health Telemetry Inquiry',
      context: 'Patient asking about cardiovascular risk score calculation.',
      status: ChatSessionStatus.ACTIVE,
      lastMessageAt: new Date(),
    });

    await ChatMessageModel.insertMany([
      {
        sessionId: chatSession._id,
        userId: user._id,
        patientId: patient._id,
        sender: ChatSender.USER,
        message: 'How is my cardiovascular risk score evaluated?',
        timestamp: new Date(now - 300000),
      },
      {
        sessionId: chatSession._id,
        userId: user._id,
        patientId: patient._id,
        sender: ChatSender.BOT,
        message:
          'Your cardiovascular risk score is computed dynamically using real-time heart rate (PPG), blood oxygen (SpO2), body temperature telemetry, and baseline parameters from your Digital Twin model.',
        intent: 'EXPLAIN_CARDIO_RISK',
        detectedEmotion: EmotionType.NEUTRAL,
        timestamp: new Date(now - 240000),
      },
    ]);
    logger.info({ sessionId: chatSession.id }, 'Seeded Chat session and messages created.');

    // 11. Create Report document
    const report = await ReportModel.create({
      userId: user._id,
      patientId: patient._id,
      reportType: ReportType.DAILY_SUMMARY,
      format: ReportFormat.PDF,
      downloadUrl: '/api/v1/reports/daily-summary.pdf',
      status: ReportStatus.COMPLETED,
      summary: 'Daily Health Telemetry & Risk Assessment Report for Karthikeyan M.',
      generatedAt: new Date(),
    });
    logger.info({ reportId: report.id }, 'Seeded Report created.');

    logger.info('=====================================================');
    logger.info('DATABASE SEED COMPLETED SUCCESSFULLY!');
    logger.info('Seeded Account Credentials:');
    logger.info('  Email:    karthikeyanm2209@gmail.com');
    logger.info('  Password: Karthi@1111');
    logger.info('=====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error seeding database');
    await mongoose.disconnect();
    process.exit(1);
  }
}

void seedDatabase();
