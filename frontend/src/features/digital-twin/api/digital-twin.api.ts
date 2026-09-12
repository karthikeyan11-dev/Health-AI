import { digitalTwinApi } from '@/api';
import globalAxios from 'axios';
import { API_BASE_URL } from '@/api/apiConfig';
import { storage } from '@/lib/storage';
import type {
  DigitalTwinData,
  HealthHistoryPoint,
  HealthTrendAnalysisData,
  PaginatedSnapshots,
  SnapshotFilterParams,
  TrendPeriod,
  UpdateDigitalTwinPayload,
  TrajectorySimulationData,
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

  /**
   * Simulates 30-day temporal trajectory using the PyTorch GRU-Attention model.
   */
  async simulateTrajectory(
    userId: string,
    forecastDays: number = 30,
  ): Promise<TrajectorySimulationData> {
    const token = storage.getToken();
    const response = await globalAxios.get(`${API_BASE_URL}/digital-twin/${userId}/trajectory`, {
      params: { forecastDays },
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data.data as TrajectorySimulationData;
  },
};
