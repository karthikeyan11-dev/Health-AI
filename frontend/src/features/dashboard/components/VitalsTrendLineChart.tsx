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
import type { PatientVitalTrendPoint } from '@/sdk';
import { Activity } from 'lucide-react';

interface VitalsTrendLineChartProps {
  data?: PatientVitalTrendPoint[];
}

export function VitalsTrendLineChart({ data = [] }: VitalsTrendLineChartProps): React.JSX.Element {
  const chartData =
    data.length > 0
      ? data
      : [
          { timestamp: '08:00', heartRate: 70, spo2: 98.0, temperature: 36.5 },
          { timestamp: '09:00', heartRate: 74, spo2: 98.5, temperature: 36.6 },
          { timestamp: '10:00', heartRate: 72, spo2: 99.0, temperature: 36.6 },
          { timestamp: '11:00', heartRate: 75, spo2: 98.2, temperature: 36.7 },
          { timestamp: '12:00', heartRate: 71, spo2: 98.6, temperature: 36.5 },
        ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>Physiological Vitals Trend</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time streaming Heart Rate (BPM), SpO₂ (%), and Temperature (°C)
          </p>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
            <Tooltip
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
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="temperature"
              name="Temp (°C)"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f59e0b' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
