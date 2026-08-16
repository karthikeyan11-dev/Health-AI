import React, { useState, useEffect, useCallback } from 'react';
import { HealthMonitoringView } from '../components/HealthMonitoringView';
import { healthMonitoringApi } from '../api/health-monitoring.api';
import type { HealthMonitoringFilterState } from '../types/health-monitoring.types';
import type { HealthMonitoringData, GetHealthMonitoringTimeRangeEnum } from '@/sdk';
import { extractErrorMessage } from '@/utils/error.util';
import { HEALTH_MONITORING_TEXTS } from '../constants/health-monitoring.constants';

export const HealthMonitoringContainer: React.FC = () => {
  const [data, setData] = useState<HealthMonitoringData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HealthMonitoringFilterState>({
    timeRange: '24h' as GetHealthMonitoringTimeRangeEnum,
    deviceId: 'all',
  });

  const fetchMonitoringData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const selectedDevice = filters.deviceId === 'all' ? undefined : filters.deviceId;
      const res = await healthMonitoringApi.getHealthMonitoring({
        timeRange: filters.timeRange,
        deviceId: selectedDevice,
      });
      setData(res);
    } catch (err: unknown) {
      setError(extractErrorMessage(err, HEALTH_MONITORING_TEXTS.ERROR_SUBTITLE));
    } finally {
      setIsLoading(false);
    }
  }, [filters.timeRange, filters.deviceId]);

  useEffect(() => {
    void fetchMonitoringData();
  }, [fetchMonitoringData]);

  const handleFilterChange = (field: keyof HealthMonitoringFilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <HealthMonitoringView
      data={data}
      isLoading={isLoading}
      error={error}
      filters={filters}
      onFilterChange={handleFilterChange}
      onRetry={() => void fetchMonitoringData()}
    />
  );
};
