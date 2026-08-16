import { patientsApi } from '@/api';
import type { HealthMonitoringData, GetHealthMonitoringTimeRangeEnum } from '@/sdk';

export const healthMonitoringApi = {
  async getHealthMonitoring(params?: {
    timeRange?: GetHealthMonitoringTimeRangeEnum;
    deviceId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<HealthMonitoringData> {
    const response = await patientsApi.getHealthMonitoring(
      params?.timeRange,
      params?.deviceId,
      params?.startDate,
      params?.endDate,
    );
    return response.data.data;
  },
};
