import axios from 'axios';
import { Types } from 'mongoose';
import { Config } from '@config/env.config';
import { logger } from '@config/logger';
import { NotFoundError, InternalServerError } from '../../shared/errors/httpErrors';
import { CardiovascularRepository, cardiovascularRepository } from './cardiovascular.repository';
import {
  CardiovascularRiskLevel,
  type ICardiovascularAssessmentDocument,
} from '../../models/cardiovascular-assessment.model';
import { UserModel } from '../../models/user.model';
import { PatientModel } from '../../models/patient.model';
import { SensorReadingModel, SensorType } from '../../models/sensor-reading.model';
import { DigitalTwinModel } from '../../models/digital-twin.model';

export interface AssessCardioInput {
  userId: string;
  age?: number;
  sex?: number;
  bmi?: number;
  smokingStatus?: number;
  familyHistoryCvd?: number;
  heartRate?: number;
  restingHr?: number;
  spo2?: number;
  temperature?: number;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  hrv?: number;
  steps?: number;
  caloriesBurned?: number;
  distanceKm?: number;
  sleepHours?: number;
  sleepEfficiency?: number;
  caloriesConsumed?: number;
  waterIntakeL?: number;
  activityType?: string;
  stressScore?: number;
  digitalTwinHealthScore?: number;
}

interface AICardioDriver {
  feature: string;
  value: number;
  impact: number;
}

interface AICardioBiometrics {
  pulse_pressure: number;
  map_score: number;
  rpp: number;
  sleep_impact: number;
  autonomic_stress_proxy: number;
  activity_efficiency: number;
  bp_systolic: number;
  bp_diastolic: number;
  resting_hr: number;
}

interface AICardioResponse {
  status: string;
  assessment: {
    risk_class: number;
    risk_level: string;
    risk_score: number;
    confidence: number;
    probabilities: Record<string, number>;
    biometrics?: AICardioBiometrics;
    top_drivers: AICardioDriver[];
    shap_string: string;
    recommended_intervention: string;
    action_id: number;
    raw_action_id?: number;
    is_action_safe?: boolean;
  };
  guidance: {
    guidance_status: string;
    provider: string;
    message: string;
  };
}

export class CardiovascularService {
  constructor(private readonly repository: CardiovascularRepository = cardiovascularRepository) {}

  /**
   * Executes cardiovascular risk assessment by merging database patient telemetry with
   * manual inputs and delegating ML inference to the Unified Python AI Hub on Port 5001.
   */
  public async assessCardiovascularRisk(
    input: AssessCardioInput,
  ): Promise<ICardiovascularAssessmentDocument> {
    const { userId } = input;

    // 1. Verify User Exists
    const user = await UserModel.findById(userId).exec();
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const patient = await PatientModel.findOne({ userId: user._id }).exec();

    // 2. Fetch Latest Telemetry for each sensor type if not provided
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

    // 3. Resolve Input Feature Values with Intelligent Clinical Fallbacks
    const resolvedAge = input.age ?? (user.age ? Number(user.age) : 35);
    const resolvedSex = input.sex ?? (user.gender === 'FEMALE' ? 0 : 1);
    const resolvedBmi = input.bmi ?? 24.5;
    const resolvedSmoking = input.smokingStatus ?? 0;
    const resolvedFamilyCvd = input.familyHistoryCvd ?? 0;

    const resolvedHeartRate = input.heartRate ?? (latestHr?.value ? Number(latestHr.value) : 75.0);
    const resolvedRestingHr = input.restingHr ?? 68.0;
    const resolvedSpo2 = input.spo2 ?? (latestSpo2?.value ? Number(latestSpo2.value) : 98.0);
    const resolvedTemp = input.temperature ?? (latestTemp?.value ? Number(latestTemp.value) : 36.6);
    const resolvedSystolicBp = input.systolicBp ?? 120.0;
    const resolvedDiastolicBp = input.diastolicBp ?? 80.0;
    const resolvedHrv = input.hrv ?? 45.0;

    const resolvedSteps = input.steps ?? 7500;
    const resolvedCaloriesBurned = input.caloriesBurned ?? 2200;
    const resolvedDistanceKm = input.distanceKm ?? 5.0;
    const resolvedSleepHours = input.sleepHours ?? 7.5;
    const resolvedSleepEfficiency = input.sleepEfficiency ?? 0.85;
    const resolvedCaloriesConsumed = input.caloriesConsumed ?? 2100;
    const resolvedWaterIntakeL = input.waterIntakeL ?? 2.5;
    const resolvedActivityType = input.activityType ?? 'Walking';

    // 4. Construct AI Hub Microservice Request Payload
    const aiPayload = {
      age: resolvedAge,
      sex: resolvedSex,
      bmi: resolvedBmi,
      smoking_status: resolvedSmoking,
      family_history_cvd: resolvedFamilyCvd,
      avg_heart_rate: resolvedHeartRate,
      resting_hr: resolvedRestingHr,
      spo2: resolvedSpo2,
      body_temp_c: resolvedTemp,
      bp_systolic: resolvedSystolicBp,
      bp_diastolic: resolvedDiastolicBp,
      hrv: resolvedHrv,
      steps: resolvedSteps,
      calories_burned: resolvedCaloriesBurned,
      distance_km: resolvedDistanceKm,
      sleep_hours: resolvedSleepHours,
      sleep_efficiency: resolvedSleepEfficiency,
      calories_consumed: resolvedCaloriesConsumed,
      water_intake_l: resolvedWaterIntakeL,
      activity_type: resolvedActivityType,
    };

    // 5. Call Unified AI Hub Service
    let aiResponseData: AICardioResponse;
    const aiUrl = `${Config.AI_SERVICE_URL}/cardio/predict`;

    try {
      const aiResponse = await axios.post<AICardioResponse>(aiUrl, aiPayload, {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' },
      });
      aiResponseData = aiResponse.data;
    } catch (err) {
      logger.error({ err, url: aiUrl }, 'Failed to communicate with AI Service');
      throw new InternalServerError(
        'Cardiovascular AI inference engine is temporarily unreachable. Please ensure ai_service is running.',
      );
    }

    const { assessment, guidance } = aiResponseData;

    // 6. Map Risk Level to Enum
    const mappedRiskLevel =
      CardiovascularRiskLevel[assessment.risk_level as keyof typeof CardiovascularRiskLevel] ||
      CardiovascularRiskLevel.LOW;

    // 7. Format Recommendations
    const recommendations: string[] = [];
    if (assessment.recommended_intervention) {
      recommendations.push(assessment.recommended_intervention);
    }
    recommendations.push('Maintain consistent hydration throughout the day');
    recommendations.push('Aim for at least 7 hours of restorative sleep');

    // 8. Persist Assessment to Database with new clinical biometrics & PPO safety flags
    const savedAssessment = await this.repository.create({
      userId: new Types.ObjectId(userId),
      patientId: patient?._id ? new Types.ObjectId(patient._id) : undefined,
      riskScore: assessment.risk_score,
      riskLevel: mappedRiskLevel,
      contributingFactors: assessment.top_drivers.map(
        (d) => `${d.feature}: ${d.value} (Impact: ${d.impact})`,
      ),
      topDrivers: assessment.top_drivers,
      probabilities: assessment.probabilities,
      confidence: assessment.confidence,
      explanation: guidance.message,
      recommendations,
      recommendedIntervention: assessment.recommended_intervention,
      actionId: assessment.action_id,
      isActionSafe: assessment.is_action_safe ?? true,
      mapScore: assessment.biometrics?.map_score,
      ratePressureProduct: assessment.biometrics?.rpp,
      pulsePressure: assessment.biometrics?.pulse_pressure,
      autonomicStressScore: assessment.biometrics?.autonomic_stress_proxy,
      guidance: {
        status: guidance.guidance_status,
        provider: guidance.provider,
        message: guidance.message,
      },
      heartRate: resolvedHeartRate,
      spo2: resolvedSpo2,
      temperature: resolvedTemp,
      systolicBp: resolvedSystolicBp,
      diastolicBp: resolvedDiastolicBp,
      stressScore: input.stressScore,
      digitalTwinHealthScore: input.digitalTwinHealthScore,
      timestamp: new Date(),
    });

    // 9. Update Digital Twin State if present
    try {
      await DigitalTwinModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        {
          $set: {
            'cardiovascularState.riskLevel': mappedRiskLevel,
            'cardiovascularState.riskScore': assessment.risk_score,
            'cardiovascularState.lastAssessmentDate': new Date(),
            updatedAt: new Date(),
          },
        },
        { new: true },
      ).exec();
    } catch (dtError) {
      logger.warn({ err: dtError }, 'Failed to update Digital Twin state from cardio assessment');
    }

    return savedAssessment;
  }

  /**
   * Retrieves the most recent assessment for a given user.
   */
  public async getCurrentRisk(userId: string): Promise<ICardiovascularAssessmentDocument> {
    const latest = await this.repository.findLatestByUserId(userId);
    if (!latest) {
      // If no assessment exists yet, perform an initial baseline assessment
      return await this.assessCardiovascularRisk({ userId });
    }
    return latest;
  }

  /**
   * Retrieves paginated risk assessment history.
   */
  public async getRiskHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ records: ICardiovascularAssessmentDocument[]; total: number }> {
    return await this.repository.getHistoryByUserId(userId, page, limit);
  }
}

export const cardiovascularService = new CardiovascularService();
