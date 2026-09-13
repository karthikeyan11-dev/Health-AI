import React from 'react';
import type { StressData } from '../types/stress.types';
import { STRESS_LEVEL_COLORS } from '../constants/stress.constants';
import { Brain, Sparkles, Activity, ShieldCheck, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentStressCardProps {
  data: StressData | null;
  onOpenNewAssessment: () => void;
}

export const CurrentStressCard: React.FC<CurrentStressCardProps> = ({
  data,
  onOpenNewAssessment,
}) => {
  const level = (data?.stressLevel || 'LOW') as keyof typeof STRESS_LEVEL_COLORS;
  const config = STRESS_LEVEL_COLORS[level] || STRESS_LEVEL_COLORS.LOW;
  const score = data?.stressScore !== undefined ? Math.round(data.stressScore) : 0;
  const confidence = data?.confidence !== undefined ? Math.round(data.confidence) : 88;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Background Glow */}
      <div
        className={cn(
          'absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20',
          config.bg,
        )}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Autonomic Stress Index
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Sparkles className="w-3 h-3" /> SVM RBF Classifier
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              90-second statistical feature window (HR mean/min/max, SpO₂, body temp)
            </p>
          </div>
        </div>

        <button
          onClick={onOpenNewAssessment}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>New Assessment</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2 relative z-10">
        {/* Left: Big Score & State */}
        <div className="md:col-span-5 flex flex-col justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stress Score
            </span>
            <span
              className={cn('text-xs font-extrabold px-3 py-1 rounded-full border', config.badgeBg)}
            >
              {config.label}
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-lg font-bold text-slate-400">/ 100</span>
          </div>

          {/* Meter */}
          <div className="space-y-1.5">
            <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex p-0.5">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-700 bg-gradient-to-r',
                  config.gradient,
                )}
                style={{ width: `${Math.min(Math.max(score, 5), 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span>0 (Relaxed)</span>
              <span>50 (Moderate)</span>
              <span>100 (Severe)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white border border-slate-200/60 text-xs">
            <span className="font-bold text-slate-800 block">{config.state}</span>
            <p className="text-[11px] text-slate-500 mt-0.5">{config.description}</p>
          </div>
        </div>

        {/* Right: Confidence & Contributing Factors */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Inference Confidence</p>
                <p className="text-[11px] text-slate-500">Feature variance agreement</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">{confidence}%</span>
              <p className="text-[10px] font-semibold text-emerald-600">Active Pipeline</p>
            </div>
          </div>

          {/* Autonomic State Factors */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Contributing Autonomic Indicators
            </span>
            {data?.contributingFactors && data.contributingFactors.length > 0 ? (
              <div className="space-y-2">
                {data.contributingFactors.map((factor, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-white border border-slate-200/60 text-xs font-semibold text-slate-700 flex items-center gap-2"
                  >
                    <Smile className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{factor}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Optimal autonomic tone. Sympathetic and parasympathetic pathways are well balanced.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
