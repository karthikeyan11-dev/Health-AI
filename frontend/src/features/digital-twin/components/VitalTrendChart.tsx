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
  ReferenceLine,
} from 'recharts';
import { HeartPulse } from 'lucide-react';
import type { HealthHistoryPoint } from '../types/digital-twin.types';

interface VitalTrendChartProps {
  history: HealthHistoryPoint[];
  baselineHeartRate: number;
  baselineSpO2: number;
}

export const VitalTrendChart: React.FC<VitalTrendChartProps> = ({
  history,
  baselineHeartRate,
  baselineSpO2,
}) => {
  const chartData = history.map((item) => ({
    ...item,
    formattedDate: new Date(item.timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }),
  }));

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-600">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Biometric Vital Signs Longitudinal History
            </h2>
            <p className="text-xs text-slate-500">
              Heart rate & SpO₂ progression vs calibrated baseline references
            </p>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                domain={[50, 110]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '0.75rem',
                  color: '#fff',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
              />
              <ReferenceLine
                y={baselineHeartRate}
                stroke="#F43F5E"
                strokeDasharray="4 4"
                label={{ value: `Base HR (${baselineHeartRate})`, fill: '#F43F5E', fontSize: 10 }}
              />
              <ReferenceLine
                y={baselineSpO2}
                stroke="#0EA5E9"
                strokeDasharray="4 4"
                label={{ value: `Base SpO₂ (${baselineSpO2}%)`, fill: '#0EA5E9', fontSize: 10 }}
              />
              <Line
                type="monotone"
                dataKey="avgHeartRate"
                name="Heart Rate (BPM)"
                stroke="#F43F5E"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#F43F5E' }}
                activeDot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="avgSpO2"
                name="Blood Oxygen SpO₂ (%)"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0EA5E9' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No biometric sensor history points available.
          </div>
        )}
      </div>
    </div>
  );
};
