import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles, Play, RefreshCw, Activity, Brain, AlertCircle } from 'lucide-react';
import { digitalTwinServiceApi } from '../api/digital-twin.api';
import type { TrajectorySimulationData } from '../types/digital-twin.types';
import { SectionLoader } from '@/components/common';
import { CARDIO_RISK_COLORS } from '@/features/assessments/cardiovascular/constants/cardiovascular.constants';
import { cn } from '@/lib/utils';

interface TemporalTrajectoryForecastCardProps {
  userId: string;
}

export const TemporalTrajectoryForecastCard: React.FC<TemporalTrajectoryForecastCardProps> = ({
  userId,
}) => {
  const [data, setData] = useState<TrajectorySimulationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await digitalTwinServiceApi.simulateTrajectory(userId, 30);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to simulate trajectory';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = (data?.trajectory || []).map((t) => ({
    day: `D${t.day}`,
    dayNum: t.day,
    riskScore: t.risk_score,
    riskLevel: t.risk_level,
    confidence: t.confidence,
    bpSystolic: t.vitals_snapshot.bp_systolic,
    bpDiastolic: t.vitals_snapshot.bp_diastolic,
    restingHr: t.vitals_snapshot.resting_hr,
  }));

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                30-Day Digital Twin Trajectory Simulation
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                <Sparkles className="w-3 h-3" /> PyTorch GRU-Attention
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deep sequence-to-sequence recurrent neural network forecasting day-by-day
              physiological state drift
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulate}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              <span>{data ? 'Re-simulate 30 Days' : 'Simulate 30-Day Forecast'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <SectionLoader
          message="Running PyTorch GRU-Attention 30-Day Sequence Simulation..."
          colorTheme="emerald"
          paddingY="py-16"
        />
      )}

      {!isLoading && !data && (
        <div className="p-10 rounded-2xl bg-slate-50/70 border border-dashed border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <Brain className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              Forecast Future Physiological Trajectory
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Click &quot;Simulate 30-Day Forecast&quot; to execute the PyTorch GRU-Attention model
              on the patient&apos;s latest biometric profile and projected lifestyle inputs.
            </p>
          </div>
        </div>
      )}

      {!isLoading && data && (
        <div className="space-y-6">
          {/* Summary Stat Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Mean 30-Day Risk Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900">{data.mean_risk_score}</span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Projected 30-Day Trend
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'text-xs font-extrabold px-3 py-1 rounded-full border',
                    data.risk_trend === 'IMPROVING'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : data.risk_trend === 'INCREASING_RISK'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-teal-50 text-teal-700 border-teal-200',
                  )}
                >
                  {data.risk_trend.replace('_', ' ')}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Temporal Horizon
              </span>
              <div className="flex items-baseline gap-1 text-slate-900 font-black text-2xl">
                <span>{data.forecast_days}</span>
                <span className="text-xs font-semibold text-slate-400">Consecutive Days</span>
              </div>
            </div>
          </div>

          {/* 30-Day Trajectory Chart */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Predicted Risk Severity Trajectory (Days 1 to 30)
            </span>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const pt = payload[0].payload;
                      const tier = (pt.riskLevel || 'LOW') as keyof typeof CARDIO_RISK_COLORS;
                      const cfg = CARDIO_RISK_COLORS[tier] || CARDIO_RISK_COLORS.LOW;

                      return (
                        <div className="bg-slate-900 text-white text-xs rounded-2xl p-3.5 shadow-xl border border-slate-800 space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                            <span className="font-bold text-slate-300">
                              Day {pt.dayNum} Forecast
                            </span>
                            <span
                              className={cn(
                                'text-[10px] font-extrabold px-2 py-0.5 rounded-full border',
                                cfg.badgeBg,
                              )}
                            >
                              {cfg.label}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Risk Score:</span>
                              <span className="font-extrabold text-white">
                                {pt.riskScore} / 100
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Confidence:</span>
                              <span className="font-bold text-emerald-400">{pt.confidence}%</span>
                            </div>
                            {pt.bpSystolic && pt.bpDiastolic && (
                              <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800">
                                <span className="text-slate-400">BP:</span>
                                <span className="text-slate-200">
                                  {pt.bpSystolic}/{pt.bpDiastolic} mmHg
                                </span>
                              </div>
                            )}
                            {pt.restingHr && (
                              <div className="flex justify-between text-[11px]">
                                <span className="text-slate-400">Resting HR:</span>
                                <span className="text-slate-200">{pt.restingHr} BPM</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="riskScore"
                    stroke="#059669"
                    strokeWidth={3}
                    dot={{ fill: '#059669', r: 3 }}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
