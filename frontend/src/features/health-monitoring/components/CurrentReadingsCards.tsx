import React from 'react';
import type { CurrentReadingsCardsProps } from '../types/health-monitoring.types';
import { formatReadingTime, formatValueWithUnit } from '../utils/health-monitoring.utils';
import { HeartPulse, Activity, Thermometer, Cpu } from 'lucide-react';

export const CurrentReadingsCards: React.FC<CurrentReadingsCardsProps> = ({ currentReadings }) => {
  const hr = currentReadings.heartRate;
  const spo2 = currentReadings.spo2;
  const temp = currentReadings.temperature;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Heart Rate Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-rose-50/30 border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-rose-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            Heart Rate
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold text-xs shadow-inner">
            BPM
          </div>
        </div>

        <div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {formatValueWithUnit(hr?.value, '', '--')}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Unit: {hr?.unit || 'BPM'}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            {hr?.deviceId || 'No device'}
          </span>
          <span>{formatReadingTime(hr?.timestamp)}</span>
        </div>
      </div>

      {/* SpO2 Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-cyan-50/30 border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-cyan-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-600" />
            Blood Oxygen (SpO₂)
          </span>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-700 flex items-center justify-center font-bold text-xs shadow-inner">
            %
          </div>
        </div>

        <div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {formatValueWithUnit(spo2?.value, '', '--')}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Unit: {spo2?.unit || '%'}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            {spo2?.deviceId || 'No device'}
          </span>
          <span>{formatReadingTime(spo2?.timestamp)}</span>
        </div>
      </div>

      {/* Body Temperature Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-white to-amber-50/30 border border-slate-200/80 shadow-sm space-y-3 relative overflow-hidden group hover:border-amber-300 transition-all">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-600" />
            Body Temperature
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold text-xs shadow-inner">
            °C
          </div>
        </div>

        <div>
          <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {formatValueWithUnit(temp?.value, '', '--')}
          </p>
          <p className="text-xs font-medium text-slate-500 mt-1">Unit: {temp?.unit || '°C'}</p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-slate-400" />
            {temp?.deviceId || 'No device'}
          </span>
          <span>{formatReadingTime(temp?.timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
