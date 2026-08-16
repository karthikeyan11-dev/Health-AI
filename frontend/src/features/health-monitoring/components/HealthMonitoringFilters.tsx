import React from 'react';
import { Select } from '@/components/ui/select';
import { HEALTH_MONITORING_TEXTS } from '../constants/health-monitoring.constants';
import type { HealthMonitoringFiltersProps } from '../types/health-monitoring.types';
import { Clock, Cpu } from 'lucide-react';

export const HealthMonitoringFilters: React.FC<HealthMonitoringFiltersProps> = ({
  devices,
  timeRange,
  selectedDeviceId,
  onTimeRangeChange,
  onDeviceChange,
}) => {
  const deviceOptions = [
    { value: 'all', label: HEALTH_MONITORING_TEXTS.FILTERS.ALL_DEVICES_LABEL },
    ...devices.map((d) => ({
      value: d.deviceId,
      label: d.name ? `${d.name} (${d.deviceId})` : `${d.deviceId} • [${d.status}]`,
    })),
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-emerald-600" />
          Filter Telemetry
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Time Range Selector */}
        <div className="flex items-center gap-2 min-w-[170px]">
          <Select
            value={timeRange}
            onValueChange={onTimeRangeChange}
            options={[...HEALTH_MONITORING_TEXTS.TIME_RANGE_OPTIONS]}
            placeholder={HEALTH_MONITORING_TEXTS.FILTERS.TIME_RANGE_LABEL}
            className="w-full bg-white font-medium text-slate-700 shadow-sm border-slate-200"
          />
        </div>

        {/* Device Selector */}
        <div className="flex items-center gap-2 min-w-[210px]">
          <div className="w-full relative flex items-center">
            <Cpu className="w-4 h-4 text-slate-400 absolute left-3 z-10 pointer-events-none" />
            <Select
              value={selectedDeviceId || 'all'}
              onValueChange={onDeviceChange}
              options={deviceOptions}
              placeholder={HEALTH_MONITORING_TEXTS.FILTERS.DEVICE_LABEL}
              className="w-full bg-white pl-9 font-medium text-slate-700 shadow-sm border-slate-200"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
