import type {
  DigitalTwin,
  TwinHealthStateEnum,
  EmotionEnum,
  HealthHistoryResponseDataInner,
  GetHealthTrendAnalysisPeriodEnum,
  HealthTrendAnalysisResponseData,
  UpdateTwinRequest,
  DigitalTwinSnapshot,
  SnapshotTriggerReasonEnum,
  DigitalTwinSnapshotListResponseData,
} from '@/sdk';

export type TwinHealthState = TwinHealthStateEnum;
export type EmotionType = EmotionEnum;
export type DigitalTwinData = DigitalTwin;
export type HealthHistoryPoint = HealthHistoryResponseDataInner;
export type TrendPeriod = GetHealthTrendAnalysisPeriodEnum;
export type TrendTrajectory = 'STABLE' | 'INCREASING' | 'DECREASING' | 'VOLATILE';

export type HealthTrendAnalysisData = HealthTrendAnalysisResponseData;

export type DigitalTwinSnapshotData = DigitalTwinSnapshot;
export type SnapshotTriggerReason = SnapshotTriggerReasonEnum;
export type PaginatedSnapshots = DigitalTwinSnapshotListResponseData;

export interface SnapshotFilterParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  trigger?: SnapshotTriggerReasonEnum;
}

export interface UpdateDigitalTwinPayload extends UpdateTwinRequest {
  dominantEmotion?: EmotionEnum;
}

export interface TrajectoryPoint {
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

export interface TrajectorySimulationData {
  status: string;
  forecast_days: number;
  mean_risk_score: number;
  risk_trend: string;
  trajectory: TrajectoryPoint[];
}

export interface DigitalTwinViewState {
  twin: DigitalTwinData | null;
  history: HealthHistoryPoint[];
  trends: HealthTrendAnalysisData | null;
  snapshots: PaginatedSnapshots | null;
  selectedSnapshot: DigitalTwinSnapshotData | null;
  trajectory: TrajectorySimulationData | null;
  isLoading: boolean;
  isSyncing: boolean;
  isCalibrating: boolean;
  isSnapshotsLoading: boolean;
  isSimulating: boolean;
  error: string | null;
  selectedPeriod: TrendPeriod;
}
