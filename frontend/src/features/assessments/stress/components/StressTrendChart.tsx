import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import type { StressHistoryItem } from '../types/stress.types';
import { Brain } from 'lucide-react';

interface StressTrendChartProps {
  history: StressHistoryItem[];
}

export const StressTrendChart: React.FC<StressTrendChartProps> = ({ history }) => {
  const chartData =
    history.length > 0
      ? [...history].reverse().map((item) => ({
          timestamp: new Date(item.timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          stressScore: Math.round(item.stressScore),
          stressLevel: item.stressLevel,
          confidence: item.confidence ? Math.round(item.confidence) : 88,
        }))
      : [
          { timestamp: '08:00', stressScore: 15, stressLevel: 'LOW', confidence: 90 },
          { timestamp: '10:00', stressScore: 25, stressLevel: 'LOW', confidence: 88 },
          { timestamp: '12:00', stressScore: 40, stressLevel: 'MODERATE', confidence: 85 },
          { timestamp: '14:00', stressScore: 30, stressLevel: 'LOW', confidence: 89 },
          { timestamp: '16:00', stressScore: 20, stressLevel: 'LOW', confidence: 92 },
        ];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Autonomic Stress Longitudinal Trend
            </h3>
            <p className="text-xs text-slate-500">
              Pattern of autonomic arousal across sequential evaluations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> &lt;25 Relaxed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 25-50 Moderate
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> &gt;75 Severe
          </span>
        </div>
      </div>

      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="stressTrendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} tickLine={false} />
            <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} />
            <ReferenceLine y={25} stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" opacity={0.5} />
            <ReferenceLine y={75} stroke="#f97316" strokeDasharray="3 3" opacity={0.5} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
              }}
              formatter={(value: unknown) => [`${value} / 100`, 'Stress Score']}
            />
            <Area
              type="monotone"
              dataKey="stressScore"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#stressTrendGradient)"
              activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
