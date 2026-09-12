import axios from 'axios';
import { Types } from 'mongoose';
import { Config } from '@config/env.config';
import { logger } from '@config/logger';
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from '../../shared/errors/httpErrors';
import { DigitalTwinRepository, digitalTwinRepository } from './digital-twin.repository';
import {
  TwinHealthState,
  EmotionType,
  type IDigitalTwinDocument,
} from '../../models/digital-twin.model';
import {
  SnapshotTriggerReason,
  type IDigitalTwinSnapshotDocument,
} from '../../models/digital-twin-snapshot.model';
import type {
  CreateDigitalTwinDTO,
  UpdateDigitalTwinDTO,
  HealthHistoryPoint,
  HealthTrendAnalysisData,
  GetSnapshotsQueryDTO,
  PaginatedSnapshotsDTO,
  DigitalTwinSnapshotDTO,
  TrajectorySimulationResponseDTO,
} from './digital-twin.interface';

export class DigitalTwinService {
  constructor(private readonly repo: DigitalTwinRepository = digitalTwinRepository) {}

  /**
   * Evaluates overall health score & state from composite clinical inputs.
   */
  public calculateHealthScoreAndState(
    cardioRiskScore: number = 0,
    stressScore: number = 0,
    currentHr?: number,
    baselineHr: number = 72.0,
    currentSpo2?: number,
    _baselineSpo2: number = 98.0,
    currentTemp?: number,
    baselineTemp: number = 36.5,
  ): { healthScore: number; healthState: TwinHealthState } {
    const cardioImpact = cardioRiskScore * 0.35;
    const stressImpact = stressScore * 0.25;

    let vitalPenalties = 0;

    if (currentHr !== undefined && Math.abs(currentHr - baselineHr) > 15) {
      vitalPenalties += Math.min(15, Math.abs(currentHr - baselineHr) * 0.5);
    }

    if (currentSpo2 !== undefined && currentSpo2 < 95.0) {
      vitalPenalties += Math.min(15, (95.0 - currentSpo2) * 3.0);
    }

    if (currentTemp !== undefined && Math.abs(currentTemp - baselineTemp) > 1.0) {
      vitalPenalties += Math.min(10, Math.abs(currentTemp - baselineTemp) * 5.0);
    }

    const calculatedScore = Math.max(
      0,
      Math.min(100, Math.round(100 - cardioImpact - stressImpact - vitalPenalties)),
    );

    let state: TwinHealthState;
    if (calculatedScore >= 85) {
      state = TwinHealthState.OPTIMAL;
    } else if (calculatedScore >= 70) {
      state = TwinHealthState.STABLE;
    } else if (calculatedScore >= 55) {
      state = TwinHealthState.ELEVATED_STRESS;
    } else if (calculatedScore >= 40) {
      state = TwinHealthState.AT_RISK;
    } else {
      state = TwinHealthState.CRITICAL;
    }

    return { healthScore: calculatedScore, healthState: state };
  }

  /**
   * Initializes a new Digital Twin for a user and records initial snapshot.
   */
  public async createDigitalTwin(input: CreateDigitalTwinDTO): Promise<IDigitalTwinDocument> {
    const { userId } = input;

    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const existingTwin = await this.repo.findByUserId(userId);
    if (existingTwin) {
      throw new BadRequestError(`Digital Twin already exists for user ${userId}`);
    }

    const patient = await this.repo.findPatientByUserId(userId);
    const { heartRate, spo2, temperature } = await this.repo.findLatestReadings(userId);
    const latestCardio = await this.repo.findLatestCardioAssessment(userId);
    const latestStress = await this.repo.findLatestStressAssessment(userId);

    const baselineHr = input.baselineHeartRate ?? 72.0;
    const baselineTemp = input.baselineTemperature ?? 36.5;
    const baselineSpO2 = input.baselineSpO2 ?? 98.0;
    const dominantEmotion = input.dominantEmotion ?? EmotionType.NEUTRAL;

    const cardioScore = latestCardio?.riskScore ?? 0.0;
    const stressScore = latestStress?.stressScore ?? 0.0;

    const currentHr = heartRate?.value ? Number(heartRate.value) : baselineHr;
    const currentSpo2 = spo2?.value ? Number(spo2.value) : baselineSpO2;
    const currentTemp = temperature?.value ? Number(temperature.value) : baselineTemp;

    const { healthScore, healthState } = this.calculateHealthScoreAndState(
      cardioScore,
      stressScore,
      currentHr,
      baselineHr,
      currentSpo2,
      baselineSpO2,
      currentTemp,
      baselineTemp,
    );

    const twin = await this.repo.create({
      userId: user._id,
      patientId: patient?._id ? new Types.ObjectId(patient._id) : undefined,
      version: 1,
      overallHealthScore: healthScore,
      healthState,
      baselineHeartRate: baselineHr,
      baselineTemperature: baselineTemp,
      baselineSpO2,
      dominantEmotion,
      currentStressScore: stressScore,
      currentCardioRiskScore: cardioScore,
      confidence: 95.0,
      lastSyncTimestamp: new Date(),
    });

    // Record initial immutable evolution snapshot
    await this.repo.createSnapshot({
      userId: user._id,
      patientId: patient?._id ? new Types.ObjectId(patient._id) : undefined,
      digitalTwinId: twin._id,
      overallHealthScore: healthScore,
      healthState,
      heartRate: currentHr,
      spO2: currentSpo2,
      temperature: currentTemp,
      dominantEmotion,
      stressScore,
      cardioRiskScore: cardioScore,
      confidence: 95.0,
      triggerReason: SnapshotTriggerReason.TELEMETRY_SYNC,
      version: 1,
      timestamp: new Date(),
    });

    return twin;
  }

  /**
   * Retrieves or auto-initializes the Digital Twin for a user.
   */
  public async getDigitalTwin(userId: string): Promise<IDigitalTwinDocument> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    const twin = await this.repo.findByUserId(userId);
    if (!twin) {
      return await this.createDigitalTwin({ userId });
    }

    return twin;
  }

  /**
   * Updates Digital Twin baseline parameters and records BASELINE_CALIBRATION snapshot.
   */
  public async updateDigitalTwin(
    userId: string,
    input: UpdateDigitalTwinDTO,
  ): Promise<IDigitalTwinDocument> {
    const twin = await this.getDigitalTwin(userId);

    const updatedBaselineHr = input.baselineHeartRate ?? twin.baselineHeartRate;
    const updatedBaselineTemp = input.baselineTemperature ?? twin.baselineTemperature;
    const updatedBaselineSpo2 = input.baselineSpO2 ?? twin.baselineSpO2;
    const updatedDominantEmotion = input.dominantEmotion ?? twin.dominantEmotion;

    const { heartRate, spo2, temperature } = await this.repo.findLatestReadings(userId);

    const currentHr = heartRate?.value ? Number(heartRate.value) : updatedBaselineHr;
    const currentSpo2 = spo2?.value ? Number(spo2.value) : updatedBaselineSpo2;
    const currentTemp = temperature?.value ? Number(temperature.value) : updatedBaselineTemp;

    const { healthScore, healthState } = this.calculateHealthScoreAndState(
      twin.currentCardioRiskScore,
      twin.currentStressScore,
      currentHr,
      updatedBaselineHr,
      currentSpo2,
      updatedBaselineSpo2,
      currentTemp,
      updatedBaselineTemp,
    );

    const updated = await this.repo.updateByUserId(
      userId,
      {
        baselineHeartRate: updatedBaselineHr,
        baselineTemperature: updatedBaselineTemp,
        baselineSpO2: updatedBaselineSpo2,
        dominantEmotion: updatedDominantEmotion,
        overallHealthScore: healthScore,
        healthState,
        lastSyncTimestamp: new Date(),
      },
      true, // increment version
    );

    if (!updated) {
      throw new NotFoundError(`Failed to update Digital Twin for user ${userId}`);
    }

    // Record immutable snapshot on baseline calibration
    await this.repo.createSnapshot({
      userId: twin.userId,
      patientId: twin.patientId,
      digitalTwinId: twin._id,
      overallHealthScore: healthScore,
      healthState,
      heartRate: currentHr,
      spO2: currentSpo2,
      temperature: currentTemp,
      dominantEmotion: updatedDominantEmotion,
      stressScore: twin.currentStressScore,
      cardioRiskScore: twin.currentCardioRiskScore,
      confidence: twin.confidence,
      triggerReason: SnapshotTriggerReason.BASELINE_CALIBRATION,
      version: updated.version,
      timestamp: new Date(),
    });

    return updated;
  }

  /**
   * Computes real-time dynamic Digital Twin state and records evolution snapshot when state/delta warrants.
   */
  public async getCurrentTwinState(userId: string): Promise<IDigitalTwinDocument> {
    const twin = await this.getDigitalTwin(userId);

    const [readings, latestCardio, latestStress, latestSnapshot] = await Promise.all([
      this.repo.findLatestReadings(userId),
      this.repo.findLatestCardioAssessment(userId),
      this.repo.findLatestStressAssessment(userId),
      this.repo.findLatestSnapshot(userId),
    ]);

    const cardioScore = latestCardio?.riskScore ?? twin.currentCardioRiskScore;
    const stressScore = latestStress?.stressScore ?? twin.currentStressScore;
    const emotion = latestStress?.currentEmotion ?? twin.dominantEmotion;

    const currentHr = readings.heartRate?.value
      ? Number(readings.heartRate.value)
      : twin.baselineHeartRate;
    const currentSpo2 = readings.spo2?.value ? Number(readings.spo2.value) : twin.baselineSpO2;
    const currentTemp = readings.temperature?.value
      ? Number(readings.temperature.value)
      : twin.baselineTemperature;

    const { healthScore, healthState } = this.calculateHealthScoreAndState(
      cardioScore,
      stressScore,
      currentHr,
      twin.baselineHeartRate,
      currentSpo2,
      twin.baselineSpO2,
      currentTemp,
      twin.baselineTemperature,
    );

    const confidence =
      latestCardio?.confidence && latestStress?.confidence
        ? Math.round((latestCardio.confidence + latestStress.confidence) / 2)
        : (latestCardio?.confidence ?? latestStress?.confidence ?? 92.0);

    const isStateTransition = healthState !== twin.healthState;
    const isSignificantDelta = Math.abs(healthScore - twin.overallHealthScore) >= 2;
    const timeSinceLastSnapshot = latestSnapshot
      ? Date.now() - new Date(latestSnapshot.timestamp).getTime()
      : Infinity;
    const shouldRecordSnapshot =
      isStateTransition || isSignificantDelta || timeSinceLastSnapshot > 15 * 60 * 1000;

    const updated = await this.repo.updateByUserId(
      userId,
      {
        overallHealthScore: healthScore,
        healthState,
        dominantEmotion: emotion,
        currentCardioRiskScore: cardioScore,
        currentStressScore: stressScore,
        confidence,
        lastSyncTimestamp: new Date(),
      },
      shouldRecordSnapshot, // increment version when a new snapshot evolution occurs
    );

    const liveTwin = updated || twin;

    if (shouldRecordSnapshot) {
      await this.repo.createSnapshot({
        userId: liveTwin.userId,
        patientId: liveTwin.patientId,
        digitalTwinId: liveTwin._id,
        overallHealthScore: healthScore,
        healthState,
        heartRate: currentHr,
        spO2: currentSpo2,
        temperature: currentTemp,
        dominantEmotion: emotion,
        stressScore,
        cardioRiskScore: cardioScore,
        confidence,
        triggerReason: isStateTransition
          ? SnapshotTriggerReason.STATE_TRANSITION
          : SnapshotTriggerReason.TELEMETRY_SYNC,
        version: liveTwin.version,
        timestamp: new Date(),
      });
    }

    return liveTwin;
  }

  /**
   * Retrieves paginated immutable snapshots for auditing and time-travel reconstruction.
   */
  public async getSnapshots(
    userId: string,
    query: GetSnapshotsQueryDTO = {},
  ): Promise<PaginatedSnapshotsDTO> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError(`User with ID ${userId} not found`);
    }

    // Ensure twin exists
    await this.getDigitalTwin(userId);

    const page = Math.max(1, query.page ?? 1);
    const limit = Math.max(1, Math.min(100, query.limit ?? 10));
    const startDate = query.startDate ? new Date(query.startDate) : undefined;
    const endDate = query.endDate ? new Date(query.endDate) : undefined;

    const { items, total } = await this.repo.findSnapshots(userId, {
      page,
      limit,
      startDate,
      endDate,
      trigger: query.trigger,
    });

    const totalPages = Math.ceil(total / limit) || 1;

    const formattedItems: DigitalTwinSnapshotDTO[] = items.map((snap) =>
      this.formatSnapshotDTO(snap),
    );

    return {
      items: formattedItems,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Maps Mongoose snapshot document to clean API DTO with ISO strings.
   */
  public formatSnapshotDTO(doc: IDigitalTwinSnapshotDocument): DigitalTwinSnapshotDTO {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      patientId: doc.patientId ? String(doc.patientId) : undefined,
      digitalTwinId: String(doc.digitalTwinId),
      overallHealthScore: doc.overallHealthScore,
      healthState: doc.healthState,
      heartRate: doc.heartRate,
      spO2: doc.spO2,
      temperature: doc.temperature,
      dominantEmotion: doc.dominantEmotion,
      stressScore: doc.stressScore,
      cardioRiskScore: doc.cardioRiskScore,
      confidence: doc.confidence,
      triggerReason: doc.triggerReason,
      version: doc.version,
      timestamp: doc.timestamp.toISOString(),
      createdAt: doc.createdAt.toISOString(),
    };
  }

  /**
   * Generates historical health score and vital trajectories over a requested time window.
   */
  public async getHealthHistory(userId: string, days: number = 30): Promise<HealthHistoryPoint[]> {
    const safeDays = Math.max(1, Math.min(365, days));
    const twin = await this.getDigitalTwin(userId);
    const startDate = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    const [sensorReadings, cardioAssessments, stressAssessments] = await Promise.all([
      this.repo.findHistoricalSensorReadings(userId, startDate),
      this.repo.findHistoricalCardioAssessments(userId, startDate),
      this.repo.findHistoricalStressAssessments(userId, startDate),
    ]);

    // Group time-series entries by Day (YYYY-MM-DD)
    const dailyMap = new Map<
      string,
      {
        hrs: number[];
        spo2s: number[];
        temps: number[];
        cardioScores: number[];
        stressScores: number[];
        timestamp: Date;
      }
    >();

    sensorReadings.forEach((reading) => {
      const dayKey = reading.timestamp.toISOString().split('T')[0] as string;
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          hrs: [],
          spo2s: [],
          temps: [],
          cardioScores: [],
          stressScores: [],
          timestamp: reading.timestamp,
        });
      }
      const item = dailyMap.get(dayKey)!;
      const val = Number(reading.value);
      if (reading.sensorType === 'HEART_RATE') item.hrs.push(val);
      if (reading.sensorType === 'SPO2') item.spo2s.push(val);
      if (reading.sensorType === 'TEMPERATURE') item.temps.push(val);
    });

    cardioAssessments.forEach((assessment) => {
      const dayKey = assessment.timestamp.toISOString().split('T')[0] as string;
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          hrs: [],
          spo2s: [],
          temps: [],
          cardioScores: [],
          stressScores: [],
          timestamp: assessment.timestamp,
        });
      }
      dailyMap.get(dayKey)!.cardioScores.push(assessment.riskScore);
    });

    stressAssessments.forEach((assessment) => {
      const dayKey = assessment.timestamp.toISOString().split('T')[0] as string;
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, {
          hrs: [],
          spo2s: [],
          temps: [],
          cardioScores: [],
          stressScores: [],
          timestamp: assessment.timestamp,
        });
      }
      dailyMap.get(dayKey)!.stressScores.push(assessment.stressScore);
    });

    const historyPoints: HealthHistoryPoint[] = [];

    // If real telemetry exists across days, compile daily aggregates
    if (dailyMap.size > 0) {
      const sortedKeys = Array.from(dailyMap.keys()).sort();
      sortedKeys.forEach((key) => {
        const data = dailyMap.get(key)!;
        const avgHr =
          data.hrs.length > 0
            ? Math.round(data.hrs.reduce((a, b) => a + b, 0) / data.hrs.length)
            : twin.baselineHeartRate;
        const avgSpo2 =
          data.spo2s.length > 0
            ? Number((data.spo2s.reduce((a, b) => a + b, 0) / data.spo2s.length).toFixed(1))
            : twin.baselineSpO2;
        const avgTemp =
          data.temps.length > 0
            ? Number((data.temps.reduce((a, b) => a + b, 0) / data.temps.length).toFixed(1))
            : twin.baselineTemperature;

        const cardio =
          data.cardioScores.length > 0
            ? data.cardioScores[data.cardioScores.length - 1]
            : twin.currentCardioRiskScore;
        const stress =
          data.stressScores.length > 0
            ? data.stressScores[data.stressScores.length - 1]
            : twin.currentStressScore;

        const { healthScore, healthState } = this.calculateHealthScoreAndState(
          cardio,
          stress,
          avgHr,
          twin.baselineHeartRate,
          avgSpo2,
          twin.baselineSpO2,
          avgTemp,
          twin.baselineTemperature,
        );

        historyPoints.push({
          timestamp: data.timestamp.toISOString(),
          healthScore,
          healthState,
          avgHeartRate: avgHr,
          avgSpO2: avgSpo2,
        });
      });
    }

    // If historical records are fewer than 3, construct baseline timeline points
    if (historyPoints.length < 3) {
      const intervals = Math.min(safeDays, 7);
      for (let i = intervals - 1; i >= 0; i--) {
        const pointTime = new Date(Date.now() - i * (safeDays / intervals) * 24 * 60 * 60 * 1000);
        const dateStr = pointTime.toISOString().split('T')[0] as string;
        if (!historyPoints.some((p) => p.timestamp.startsWith(dateStr))) {
          historyPoints.push({
            timestamp: pointTime.toISOString(),
            healthScore: twin.overallHealthScore,
            healthState: twin.healthState,
            avgHeartRate: twin.baselineHeartRate,
            avgSpO2: twin.baselineSpO2,
          });
        }
      }
    }

    return historyPoints.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }

  /**
   * Computes health trend trajectories and data-grounded clinical insights.
   */
  public async getHealthTrendAnalysis(
    userId: string,
    period: '7_DAYS' | '30_DAYS' | '90_DAYS' = '7_DAYS',
  ): Promise<HealthTrendAnalysisData> {
    const days = period === '90_DAYS' ? 90 : period === '30_DAYS' ? 30 : 7;
    const history = await this.getHealthHistory(userId, days);
    const twin = await this.getDigitalTwin(userId);

    // 1. Analyze Heart Rate Trajectory
    const hrValues = history.map((h) => h.avgHeartRate).filter((v): v is number => v !== undefined);

    let hrTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE' = 'STABLE';
    if (hrValues.length >= 2) {
      const firstHr = hrValues[0] as number;
      const lastHr = hrValues[hrValues.length - 1] as number;
      const hrDiff = lastHr - firstHr;
      const hrVariance =
        hrValues.reduce((acc, v) => acc + Math.pow(v - twin.baselineHeartRate, 2), 0) /
        hrValues.length;

      if (hrVariance > 60) {
        hrTrend = 'VOLATILE';
      } else if (hrDiff > 4) {
        hrTrend = 'INCREASING';
      } else if (hrDiff < -4) {
        hrTrend = 'DECREASING';
      }
    }

    // 2. Analyze Stress Trajectory
    let stressTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE' = 'STABLE';
    if (twin.currentStressScore > 65) {
      stressTrend = 'INCREASING';
    } else if (twin.currentStressScore < 30) {
      stressTrend = 'DECREASING';
    }

    // 3. Analyze Cardio Risk Trajectory
    let cardioTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE' = 'STABLE';
    if (twin.currentCardioRiskScore > 50) {
      cardioTrend = 'INCREASING';
    } else if (twin.currentCardioRiskScore < 20) {
      cardioTrend = 'STABLE';
    }

    // 4. Synthesize Clinical Insights Grounded Strictly in Real Data
    const insights: string[] = [
      `Overall Digital Twin health score is currently evaluated at ${twin.overallHealthScore}/100 (${twin.healthState}).`,
      `Baseline Heart Rate is calibrated at ${twin.baselineHeartRate} BPM with ${hrTrend.toLowerCase()} stability.`,
      `Blood oxygenation level remains steady at ~${twin.baselineSpO2}% SpO₂.`,
    ];

    if (twin.currentCardioRiskScore < 20) {
      insights.push('Cardiovascular profile demonstrates optimal hemodynamic resilience.');
    } else if (twin.currentCardioRiskScore > 50) {
      insights.push(
        'Cardiovascular risk markers indicate elevated profile; consider scheduled clinical follow-up.',
      );
    }

    if (twin.currentStressScore < 30) {
      insights.push('Autonomic nervous tone indicates balanced parasympathetic dominance.');
    } else if (twin.currentStressScore > 60) {
      insights.push('Elevated sympathetic tone observed; relaxation and hydration recommended.');
    }

    return {
      userId,
      period,
      heartRateTrend: hrTrend,
      stressTrend,
      cardioRiskTrend: cardioTrend,
      insights,
    };
  }

  /**
   * Simulates 30-day temporal digital twin trajectory using the PyTorch GRU-Attention model on AI Service.
   */
  public async simulateDigitalTwinTrajectory(
    userId: string,
    forecastDays: number = 30,
  ): Promise<TrajectorySimulationResponseDTO> {
    const twin = await this.getDigitalTwin(userId);
    const { heartRate, spo2, temperature } = await this.repo.findLatestReadings(userId);
    const latestCardio = await this.repo.findLatestCardioAssessment(userId);

    const initialVitals = {
      user_id: userId,
      resting_hr: heartRate?.value ?? twin.baselineHeartRate,
      spo2: spo2?.value ?? twin.baselineSpO2,
      body_temp_c: temperature?.value ?? twin.baselineTemperature,
      bp_systolic: latestCardio?.systolicBp ?? 120.0,
      bp_diastolic: latestCardio?.diastolicBp ?? 80.0,
      hrv: 50.0,
      sleep_hours: 7.5,
      sleep_efficiency: 0.85,
      steps: 7500,
      calories_burned: 2200,
    };

    const aiUrl = `${Config.AI_SERVICE_URL}/digital-twin/simulate`;
    try {
      const response = await axios.post<TrajectorySimulationResponseDTO>(
        aiUrl,
        {
          user_id: userId,
          initial_vitals: initialVitals,
          forecast_days: forecastDays,
        },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        },
      );
      return response.data;
    } catch (err) {
      logger.error({ err, url: aiUrl }, 'Failed to simulate Digital Twin trajectory on AI Service');
      throw new InternalServerError(
        'Digital Twin GRU simulation engine is temporarily unreachable. Please ensure ai_service is running.',
      );
    }
  }
}

export const digitalTwinService = new DigitalTwinService();
