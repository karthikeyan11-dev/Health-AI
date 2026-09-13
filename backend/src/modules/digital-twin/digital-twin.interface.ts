import type { EmotionType, TwinHealthState } from '../../models/digital-twin.model';
import type { SnapshotTriggerReason } from '../../models/digital-twin-snapshot.model';

export interface CreateDigitalTwinDTO {
  userId: string;
  baselineHeartRate?: number;
  baselineTemperature?: number;
  baselineSpO2?: number;
  dominantEmotion?: EmotionType;
}

export interface UpdateDigitalTwinDTO {
  baselineHeartRate?: number;
  baselineTemperature?: number;
  baselineSpO2?: number;
  dominantEmotion?: EmotionType;
}

export interface HealthHistoryPoint {
  timestamp: string;
  healthScore: number;
  healthState: TwinHealthState;
  avgHeartRate?: number;
  avgSpO2?: number;
}

export interface HealthTrendAnalysisData {
  userId: string;
  period: '7_DAYS' | '30_DAYS' | '90_DAYS';
  heartRateTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE';
  stressTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE';
  cardioRiskTrend: 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE';
  insights: string[];
}

export interface TrajectoryPointDTO {
  day: number;
  risk_class: number;
  risk_level: string;
  risk_score: number;
  confidence: number;
  probabilities: Record<string, number>;
  vitals_snapshot: {
    bp_systolic?: number;
    bp_diastolic?: number;
    resting_hr?: number;
    hrv?: number;
  };
}

export interface TrajectorySimulationResponseDTO {
  status: string;
  forecast_days: number;
  mean_risk_score: number;
  risk_trend: string;
  trajectory: TrajectoryPointDTO[];
}

export interface DigitalTwinResponseDTO {
  id: string;
  userId: string;
  patientId?: string;
  version: number;
  overallHealthScore: number;
  healthState: TwinHealthState;
  baselineHeartRate: number;
  baselineTemperature: number;
  baselineSpO2: number;
  dominantEmotion: EmotionType;
  currentStressScore: number;
  currentCardioRiskScore: number;
  confidence: number;
  lastSyncTimestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface DigitalTwinSnapshotDTO {
  id: string;
  userId: string;
  patientId?: string;
  digitalTwinId: string;
  overallHealthScore: number;
  healthState: TwinHealthState;
  heartRate?: number;
  spO2?: number;
  temperature?: number;
  dominantEmotion: EmotionType;
  stressScore: number;
  cardioRiskScore: number;
  confidence?: number;
  triggerReason: SnapshotTriggerReason;
  version: number;
  timestamp: string;
  createdAt: string;
}

export interface GetSnapshotsQueryDTO {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  trigger?: SnapshotTriggerReason;
}

export interface PaginatedSnapshotsDTO {
  items: DigitalTwinSnapshotDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
