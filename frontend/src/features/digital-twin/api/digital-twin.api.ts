import { digitalTwinApi } from '@/api';
import type {
  DigitalTwinData,
  HealthHistoryPoint,
  HealthTrendAnalysisData,
  PaginatedSnapshots,
  SnapshotFilterParams,
  TrendPeriod,
  UpdateDigitalTwinPayload,
} from '../types/digital-twin.types';

export const digitalTwinServiceApi = {
  /**
   * Fetches the persisted digital twin or initializes if not present.
   */
  async getDigitalTwin(userId: string): Promise<DigitalTwinData> {
    const response = await digitalTwinApi.getDigitalTwin(userId);
    return response.data.data as DigitalTwinData;
  },

  /**
   * Computes dynamic real-time twin state with latest sensor telemetry.
   */
  async getCurrentTwinState(userId: string): Promise<DigitalTwinData> {
    const response = await digitalTwinApi.getCurrentTwinState(userId);
    return response.data.data as DigitalTwinData;
  },

  /**
   * Retrieves daily longitudinal health score and vitals history.
   */
  async getHealthHistory(userId: string, days: number = 30): Promise<HealthHistoryPoint[]> {
    const response = await digitalTwinApi.getHealthHistory(userId, days);
    return (response.data.data || []) as HealthHistoryPoint[];
  },

  /**
   * Retrieves trajectory trends and clinical insights.
   */
  async getHealthTrendAnalysis(
    userId: string,
    period: TrendPeriod = '7_DAYS',
  ): Promise<HealthTrendAnalysisData> {
    const response = await digitalTwinApi.getHealthTrendAnalysis(userId, period);
    return response.data.data as HealthTrendAnalysisData;
  },

  /**
   * Updates baseline vitals calibration parameters.
   */
  async updateDigitalTwin(
    userId: string,
    payload: UpdateDigitalTwinPayload,
  ): Promise<DigitalTwinData> {
    const response = await digitalTwinApi.updateDigitalTwin(userId, payload);
    return response.data.data as DigitalTwinData;
  },

  /**
   * Retrieves paginated immutable snapshots of the Digital Twin evolution ledger.
   */
  async getSnapshots(userId: string, params?: SnapshotFilterParams): Promise<PaginatedSnapshots> {
    const response = await digitalTwinApi.getDigitalTwinSnapshots(
      userId,
      params?.page,
      params?.limit,
      params?.startDate,
      params?.endDate,
      params?.trigger,
    );
    return response.data.data as PaginatedSnapshots;
  },
};
