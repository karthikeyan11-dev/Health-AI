import axios from 'axios';
import { Types } from 'mongoose';
import { Config } from '@config/env.config';
import { logger } from '@config/logger';
import { NotFoundError, InternalServerError } from '../../shared/errors/httpErrors';
import { StressRepository, stressRepository } from './stress.repository';
import {
  StressLevel,
  EmotionType,
  normalizeEmotion,
  type IStressAssessmentDocument,
} from '../../models/stress-assessment.model';
import { UserModel } from '../../models/user.model';
import { PatientModel } from '../../models/patient.model';
import { SensorReadingModel, SensorType } from '../../models/sensor-reading.model';
import { DigitalTwinModel } from '../../models/digital-twin.model';

export interface AssessStressInput {
  userId: string;
  heartRate?: number;
  spo2?: number;
  temperature?: number;
  currentEmotion?: EmotionType | string;
  readings?: Array<{ hr: number; spo2: number; temp: number; timestamp?: string }>;
}

interface AIStressResponse {
  primary_prediction: string;
  stress_probability: number;
  confidence: number;
  summary_vitals: {
    hr_mean: number;
    hr_min: number;
    hr_max: number;
    spo2_mean: number;
    temp_mean: number;
  };
  model_name: string;
  window_size_sec: number;
}

export class StressService {
  constructor(private readonly repository: StressRepository = stressRepository) {}

  /**
   * Executes autonomic stress assessment using the Unified Python AI Hub (SVM RBF Kernel on Port 5001).
   */
  public async assessStress(input: AssessStressInput): Promise<IStressAssessmentDocument> {
    const { userId } = input;

    // 1. Verify User Exists
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const patient = await PatientModel.findOne({ userId: user._id }).exec();

    // 2. Fetch Latest Telemetry if readings array not provided
    let telemetryReadings = input.readings;

    if (!telemetryReadings || telemetryReadings.length === 0) {
      let safeHr = input.heartRate;
      let safeSpo2 = input.spo2;
      let safeTemp = input.temperature;

      if (safeHr === undefined || safeSpo2 === undefined || safeTemp === undefined) {
        const [latestHr, latestSpo2, latestTemp] = await Promise.all([
          SensorReadingModel.findOne({ userId: user._id, sensorType: SensorType.HEART_RATE })
            .sort({ timestamp: -1 })
            .exec(),
          SensorReadingModel.findOne({ userId: user._id, sensorType: SensorType.SPO2 })
            .sort({ timestamp: -1 })
            .exec(),
          SensorReadingModel.findOne({ userId: user._id, sensorType: SensorType.TEMPERATURE })
            .sort({ timestamp: -1 })
            .exec(),
        ]);

        safeHr = safeHr ?? (latestHr?.value ? Number(latestHr.value) : 75.0);
        safeSpo2 = safeSpo2 ?? (latestSpo2?.value ? Number(latestSpo2.value) : 98.0);
        safeTemp = safeTemp ?? (latestTemp?.value ? Number(latestTemp.value) : 36.6);
      }

      // Generate 90s standard window based on available measurements
      telemetryReadings = Array.from({ length: 90 }, (_, i) => ({
        hr: (safeHr as number) + Math.sin(i / 10.0) * 1.5,
        spo2: safeSpo2 as number,
        temp: safeTemp as number,
      }));
    }

    // 3. Call AI Service Hub on Port 5001
    const aiUrl = `${Config.AI_SERVICE_URL}/stress/predict`;
    let aiResponseData: AIStressResponse;

    try {
      const response = await axios.post<AIStressResponse>(
        aiUrl,
        { readings: telemetryReadings },
        { timeout: Config.AI_SERVICE_TIMEOUT_MS, headers: { 'Content-Type': 'application/json' } },
      );
      aiResponseData = response.data;
    } catch (err) {
      logger.error(
        { err, url: aiUrl },
        'Failed to communicate with AI Service for stress prediction',
      );
      throw new InternalServerError(
        'Stress AI inference engine is temporarily unreachable. Please ensure ai_service is running.',
      );
    }

    const { primary_prediction, stress_probability, confidence, summary_vitals } = aiResponseData;

    // 4. Map Stress Level Categorization
    let mappedLevel: StressLevel;
    const score = Math.round(stress_probability * 100);

    if (score < 25) {
      mappedLevel = StressLevel.LOW;
    } else if (score < 50) {
      mappedLevel = StressLevel.MODERATE;
    } else if (score < 75) {
      mappedLevel = StressLevel.HIGH;
    } else {
      mappedLevel = StressLevel.SEVERE;
    }

    // 5. Construct Contributing Factors Description
    const factors: string[] = [
      `Heart Rate Mean: ${summary_vitals.hr_mean} BPM (Range: ${summary_vitals.hr_min}-${summary_vitals.hr_max})`,
      `SpO2 Average: ${summary_vitals.spo2_mean}%`,
      `Body Temp: ${summary_vitals.temp_mean}°C`,
      `Autonomic State: ${primary_prediction}`,
    ];

    // 6. Persist to MongoDB
    const savedRecord = await this.repository.create({
      userId: new Types.ObjectId(userId),
      patientId: patient?._id ? new Types.ObjectId(patient._id) : undefined,
      stressScore: score,
      stressLevel: mappedLevel,
      contributingFactors: factors,
      confidence: Math.round(confidence * 100),
      heartRate: summary_vitals.hr_mean,
      spo2: summary_vitals.spo2_mean,
      temperature: summary_vitals.temp_mean,
      currentEmotion: normalizeEmotion(input.currentEmotion),
      timestamp: new Date(),
    });

    // 7. Update Digital Twin Stress Metrics
    try {
      await DigitalTwinModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            'stressState.level': mappedLevel,
            'stressState.score': score,
            'stressState.lastAssessmentDate': new Date(),
            updatedAt: new Date(),
          },
        },
        { new: true },
      ).exec();
    } catch (dtError) {
      logger.warn({ err: dtError }, 'Failed to update Digital Twin state from stress assessment');
    }

    return savedRecord;
  }

  /**
   * Retrieves the latest stress assessment for a user.
   */
  public async getCurrentStress(userId: string): Promise<IStressAssessmentDocument> {
    const latest = await this.repository.findLatestByUserId(userId);
    if (!latest) {
      return await this.assessStress({ userId });
    }
    return latest;
  }

  /**
   * Retrieves paginated stress assessment history.
   */
  public async getStressHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ records: IStressAssessmentDocument[]; total: number }> {
    return await this.repository.getHistoryByUserId(userId, page, limit);
  }
}

export const stressService = new StressService();
