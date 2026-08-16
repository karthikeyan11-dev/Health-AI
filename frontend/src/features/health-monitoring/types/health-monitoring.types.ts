import type { HealthMonitoringData, GetHealthMonitoringTimeRangeEnum } from '@/sdk';

export type HealthMonitoringFilterState = {
  timeRange: GetHealthMonitoringTimeRangeEnum;
  deviceId: string;
};

export type CurrentReadingsCardsProps = {
  currentReadings: HealthMonitoringData['currentReadings'];
};

export type VitalChartsProps = {
  heartRateHistory: HealthMonitoringData['heartRateHistory'];
  spo2History: HealthMonitoringData['spo2History'];
  temperatureHistory: HealthMonitoringData['temperatureHistory'];
  combinedVitalTrends: HealthMonitoringData['combinedVitalTrends'];
};

export type HealthMonitoringFiltersProps = {
  devices: HealthMonitoringData['devices'];
  timeRange: string;
  selectedDeviceId: string;
  onTimeRangeChange: (value: string) => void;
  onDeviceChange: (value: string) => void;
};

export type HealthMonitoringViewProps = {
  data: HealthMonitoringData | null;
  isLoading: boolean;
  error: string | null;
  filters: HealthMonitoringFilterState;
  onFilterChange: (key: keyof HealthMonitoringFilterState, value: string) => void;
  onRetry: () => void;
};
