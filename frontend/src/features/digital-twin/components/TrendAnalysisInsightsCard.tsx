import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Heart,
  Brain,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type { HealthTrendAnalysisData, TrendTrajectory } from '../types/digital-twin.types';

interface TrendAnalysisInsightsCardProps {
  trends: HealthTrendAnalysisData | null;
}

export const TrendAnalysisInsightsCard: React.FC<TrendAnalysisInsightsCardProps> = ({ trends }) => {
  const getTrajectoryConfig = (trajectory: TrendTrajectory = 'STABLE') => {
    switch (trajectory) {
      case 'INCREASING':
        return {
          label: 'Increasing / Upward',
          icon: <TrendingUp className="w-4 h-4 text-amber-500" />,
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'DECREASING':
        return {
          label: 'Decreasing / Downward',
          icon: <TrendingDown className="w-4 h-4 text-emerald-500" />,
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'VOLATILE':
        return {
          label: 'High Fluctuation',
          icon: <AlertTriangle className="w-4 h-4 text-rose-500" />,
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      case 'STABLE':
      default:
        return {
          label: 'Stable Homeostasis',
          icon: <Minus className="w-4 h-4 text-teal-500" />,
          badgeClass: 'bg-teal-50 text-teal-700 border-teal-200',
        };
    }
  };

  const hrTrajectory = getTrajectoryConfig(trends?.heartRateTrend);
  const stressTrajectory = getTrajectoryConfig(trends?.stressTrend);
  const cardioTrajectory = getTrajectoryConfig(trends?.cardioRiskTrend);

  const insights = trends?.insights || [];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Health Trajectory & Clinical Insights
            </h2>
            <p className="text-xs text-slate-500">
              Evidence-based synthesized guidance for current period ({trends?.period || '7_DAYS'})
            </p>
          </div>
        </div>
      </div>

      {/* Trajectory Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Heart Rate Trajectory */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-semibold">
            <Activity className="w-4 h-4 text-rose-500" />
            <span>Heart Rate Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${hrTrajectory.badgeClass}`}
            >
              {hrTrajectory.icon}
              <span>{hrTrajectory.label}</span>
            </span>
          </div>
        </div>

        {/* Stress Trajectory */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-semibold">
            <Brain className="w-4 h-4 text-indigo-500" />
            <span>Stress Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${stressTrajectory.badgeClass}`}
            >
              {stressTrajectory.icon}
              <span>{stressTrajectory.label}</span>
            </span>
          </div>
        </div>

        {/* Cardio Risk Trajectory */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200/60 p-4">
          <div className="flex items-center gap-2 mb-2 text-slate-500 text-xs font-semibold">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Cardiovascular Trajectory</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${cardioTrajectory.badgeClass}`}
            >
              {cardioTrajectory.icon}
              <span>{cardioTrajectory.label}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Insights List */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-200/70 p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Synthesized Clinical Observations</span>
        </div>

        <ul className="space-y-2.5">
          {insights.map((insight, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{insight}</span>
            </li>
          ))}
          {insights.length === 0 && (
            <li className="text-xs text-slate-400">
              No specific anomalies detected. Digital Twin telemetry indicates steady baseline
              performance.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
