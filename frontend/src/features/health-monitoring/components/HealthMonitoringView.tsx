import React from 'react';
import type { HealthMonitoringViewProps } from '../types/health-monitoring.types';
import { HEALTH_MONITORING_TEXTS } from '../constants/health-monitoring.constants';
import { HealthMonitoringFilters } from './HealthMonitoringFilters';
import { CurrentReadingsCards } from './CurrentReadingsCards';
import { VitalCharts } from './VitalCharts';
import { ErrorCard } from '@/components/ui';
import { HeartPulse, Loader2 } from 'lucide-react';

export const HealthMonitoringView: React.FC<HealthMonitoringViewProps> = ({
  data,
  isLoading,
  error,
  filters,
  onFilterChange,
  onRetry,
}) => {
  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-80 space-y-4">
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">
          {HEALTH_MONITORING_TEXTS.LOADING_TEXT}
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <ErrorCard
          title={HEALTH_MONITORING_TEXTS.ERROR_TITLE}
          message={error}
          onRetry={onRetry}
          retryText={HEALTH_MONITORING_TEXTS.RETRY_BUTTON}
        />
      </div>
    );
  }

  const currentReadings = data?.currentReadings || {
    heartRate: null,
    spo2: null,
    temperature: null,
  };

  const devices = data?.devices || [];
  const heartRateHistory = data?.heartRateHistory || [];
  const spo2History = data?.spo2History || [];
  const temperatureHistory = data?.temperatureHistory || [];
  const combinedVitalTrends = data?.combinedVitalTrends || [];

  return (
    <div className="max-w-6xl mx-auto space-y-7 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shadow-sm">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
            </div>
            <span>{HEALTH_MONITORING_TEXTS.TITLE}</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">{HEALTH_MONITORING_TEXTS.SUBTITLE}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <HealthMonitoringFilters
        devices={devices}
        timeRange={filters.timeRange}
        selectedDeviceId={filters.deviceId}
        onTimeRangeChange={(val) => onFilterChange('timeRange', val)}
        onDeviceChange={(val) => onFilterChange('deviceId', val)}
      />

      {/* Current Readings Cards */}
      <CurrentReadingsCards currentReadings={currentReadings} />

      {/* Historical Telemetry Charts */}
      <VitalCharts
        heartRateHistory={heartRateHistory}
        spo2History={spo2History}
        temperatureHistory={temperatureHistory}
        combinedVitalTrends={combinedVitalTrends}
      />
    </div>
  );
};
