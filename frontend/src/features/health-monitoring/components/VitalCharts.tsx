import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { VitalChartsProps } from '../types/health-monitoring.types';
import { HEALTH_MONITORING_TEXTS } from '../constants/health-monitoring.constants';
import { HeartPulse, Activity, Thermometer, TrendingUp, Info } from 'lucide-react';

export const VitalCharts: React.FC<VitalChartsProps> = ({
  heartRateHistory,
  spo2History,
  temperatureHistory,
  combinedVitalTrends,
}) => {
  // Format timestamps for clean XAxis ticks
  const formatXAxis = (isoTime: string) => {
    try {
      const d = new Date(isoTime);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoTime;
    }
  };

  const renderEmptyState = (msg: string) => (
    <div className="h-56 flex flex-col items-center justify-center space-y-2 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 text-center">
      <Info className="w-6 h-6 text-slate-400" />
      <p className="text-xs font-semibold text-slate-500">{msg}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 1. Combined Vital Trends Multi-line Chart */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span>{HEALTH_MONITORING_TEXTS.CHARTS.COMBINED_TITLE}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {HEALTH_MONITORING_TEXTS.CHARTS.COMBINED_SUBTITLE}
          </p>
        </div>

        {combinedVitalTrends.length > 0 ? (
          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedVitalTrends}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  labelFormatter={(lbl) => `Time: ${formatXAxis(String(lbl))}`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f43f5e' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="spo2"
                  name="SpO₂ (%)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#06b6d4' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#f59e0b' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          renderEmptyState(HEALTH_MONITORING_TEXTS.EMPTY_READINGS)
        )}
      </div>

      {/* Grid of Individual Vital Line Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heart Rate History Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>{HEALTH_MONITORING_TEXTS.CHARTS.HEART_RATE_TITLE}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {HEALTH_MONITORING_TEXTS.CHARTS.HEART_RATE_SUBTITLE}
            </p>
          </div>

          {heartRateHistory.length > 0 ? (
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={heartRateHistory}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxis}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    domain={['dataMin - 5', 'dataMax + 5']}
                  />
                  <Tooltip
                    labelFormatter={(lbl) => `Time: ${formatXAxis(String(lbl))}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Heart Rate (BPM)"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderEmptyState('No Heart Rate readings recorded')
          )}
        </div>

        {/* SpO2 History Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-600" />
              <span>{HEALTH_MONITORING_TEXTS.CHARTS.SPO2_TITLE}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {HEALTH_MONITORING_TEXTS.CHARTS.SPO2_SUBTITLE}
            </p>
          </div>

          {spo2History.length > 0 ? (
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spo2History} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxis}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[85, 100]} />
                  <Tooltip
                    labelFormatter={(lbl) => `Time: ${formatXAxis(String(lbl))}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="SpO₂ (%)"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#06b6d4' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderEmptyState('No SpO₂ readings recorded')
          )}
        </div>

        {/* Temperature History Line Chart */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-amber-600" />
              <span>{HEALTH_MONITORING_TEXTS.CHARTS.TEMPERATURE_TITLE}</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {HEALTH_MONITORING_TEXTS.CHARTS.TEMPERATURE_SUBTITLE}
            </p>
          </div>

          {temperatureHistory.length > 0 ? (
            <div className="h-56 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={temperatureHistory}
                  margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="timestamp"
                    tickFormatter={formatXAxis}
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} domain={[30, 42]} />
                  <Tooltip
                    labelFormatter={(lbl) => `Time: ${formatXAxis(String(lbl))}`}
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      fontSize: '11px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Temp (°C)"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            renderEmptyState('No Temperature readings recorded')
          )}
        </div>
      </div>
    </div>
  );
};
