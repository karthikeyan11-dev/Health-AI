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
import { Activity } from 'lucide-react';
import type { HealthHistoryPoint, TrendPeriod } from '../types/digital-twin.types';

interface HealthScoreTrendChartProps {
  history: HealthHistoryPoint[];
  period: TrendPeriod;
  onPeriodChange: (period: TrendPeriod) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: HealthHistoryPoint;
  }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    const dateFormatted = new Date(data.timestamp).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    });

    return (
      <div className="rounded-xl bg-slate-900/95 text-white p-3 shadow-xl border border-white/10 text-xs backdrop-blur-md space-y-1">
        <div className="flex items-center justify-between gap-3 text-slate-400 font-medium">
          <span>{dateFormatted}</span>
          <span className="px-1.5 py-0.5 rounded bg-white/10 text-white font-bold text-[10px]">
            {data.healthState}
          </span>
        </div>
        <div className="text-emerald-400 font-black text-base">Score: {data.healthScore} / 100</div>
        {data.avgHeartRate !== undefined && (
          <div className="text-slate-300 text-[11px]">Heart Rate: {data.avgHeartRate} bpm</div>
        )}
        {data.avgSpO2 !== undefined && (
          <div className="text-slate-300 text-[11px]">SpO₂: {data.avgSpO2}%</div>
        )}
      </div>
    );
  }
  return null;
};

export const HealthScoreTrendChart: React.FC<HealthScoreTrendChartProps> = ({
  history,
  period,
  onPeriodChange,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Composite Health Score Trajectory
            </h2>
            <p className="text-xs text-slate-500">
              Longitudinal digital twin state stability curve
            </p>
          </div>
        </div>

        {/* Period Selector Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
          {(['7_DAYS', '30_DAYS', '90_DAYS'] as TrendPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {p === '7_DAYS' ? '7 Days' : p === '30_DAYS' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="healthScoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis
                dataKey="formattedDate"
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                tick={{ fill: '#64748B', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748B', fontSize: 11 }}
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={85} stroke="#10B981" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={70} stroke="#14B8A6" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={55} stroke="#F59E0B" strokeDasharray="3 3" opacity={0.5} />
              <ReferenceLine y={40} stroke="#EF4444" strokeDasharray="3 3" opacity={0.5} />
              <Area
                type="monotone"
                dataKey="healthScore"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#healthScoreGradient)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No historical health score data available for selected period.
          </div>
        )}
      </div>

      {/* Status Zone Legend */}
      <div className="flex items-center justify-between flex-wrap gap-2 pt-4 mt-2 border-t border-slate-100 text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Optimal (85-100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span>Stable (70-84)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Elevated Stress (55-69)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
          <span>At Risk (40-54)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span>Critical (&lt;40)</span>
        </div>
      </div>
    </div>
  );
};
