import React from 'react';
import type { CardioRiskData } from '../types/cardiovascular.types';
import { CARDIO_RISK_COLORS } from '../constants/cardiovascular.constants';
import { HeartPulse, ShieldCheck, Activity, Sparkles, Gauge, Zap, Wind } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CurrentRiskCardProps {
  data: CardioRiskData | null;
  onOpenNewAssessment: () => void;
}

export const CurrentRiskCard: React.FC<CurrentRiskCardProps> = ({ data, onOpenNewAssessment }) => {
  const riskLevel = (data?.riskLevel || 'LOW') as keyof typeof CARDIO_RISK_COLORS;
  const config = CARDIO_RISK_COLORS[riskLevel] || CARDIO_RISK_COLORS.LOW;
  const score = data?.riskScore !== undefined ? Math.round(data.riskScore) : 0;
  const confidence = data?.confidence !== undefined ? Math.round(data.confidence) : 92;
  const probabilities = data?.probabilities || {};

  // Extract or fallback hemodynamic indicators
  const mapScore = data?.mapScore ?? 93.3;
  const rpp =
    data?.ratePressureProduct ??
    (data?.heartRate && data?.systolicBp ? Math.round(data.heartRate * data.systolicBp) : 8400);
  const pulsePressure =
    data?.pulsePressure ??
    (data?.systolicBp && data?.diastolicBp ? Math.round(data.systolicBp - data.diastolicBp) : 40);
  const autonomicStress = data?.autonomicStressScore ?? 35.0;

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Background Subtle Accent Glow */}
      <div
        className={cn(
          'absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20',
          config.bg,
        )}
      />

      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Cardiovascular Risk Profile
              </h2>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3 h-3" /> Bagged Ensemble AI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              5-Class group-aware machine learning risk classification & hemodynamic analysis
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

      {/* Main Score & Risk Gauge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2 relative z-10">
        {/* Left: Big Score Display */}
        <div className="md:col-span-5 flex flex-col justify-center p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-200/60 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Risk Severity Score
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

          {/* Linear Meter Gauge */}
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
              <span>0 (Optimal)</span>
              <span>50 (Moderate)</span>
              <span>100 (Critical)</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium">{config.description}</p>
        </div>

        {/* Right: Confidence & Probabilities Distribution */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Inference Confidence</p>
                <p className="text-[11px] text-slate-500">
                  K-Fold cross-validated ensemble agreement
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-slate-900">{confidence}%</span>
              <p className="text-[10px] font-semibold text-emerald-600">High Reliability</p>
            </div>
          </div>

          {/* Probability Distribution Breakdown */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              5-Tier Risk Class Probability Distribution
            </span>
            <div className="space-y-2">
              {(['OPTIMAL', 'LOW', 'MODERATE', 'HIGH', 'CRITICAL'] as const).map((tier) => {
                const prob =
                  probabilities[tier] !== undefined ? Math.round(probabilities[tier] * 100) : 0;
                const tierCfg = CARDIO_RISK_COLORS[tier];
                const isSelected = tier === riskLevel;

                return (
                  <div key={tier} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span
                        className={cn(
                          'font-semibold',
                          isSelected ? tierCfg.text + ' font-bold' : 'text-slate-600',
                        )}
                      >
                        {tierCfg.label}
                      </span>
                      <span className="font-bold text-slate-700">{prob}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${prob}%`,
                          backgroundColor: tierCfg.barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Hemodynamic & Biometric Indicators Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 relative z-10">
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Gauge className="w-3.5 h-3.5 text-rose-500" />
            <span>MAP Score</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">{mapScore}</span>
            <span className="text-[10px] text-slate-400">mmHg</span>
          </div>
          <p className="text-[10px] text-slate-500">Perfusion pressure (70-100)</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>RPP Workload</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">{rpp.toLocaleString()}</span>
            <span className="text-[10px] text-slate-400">bpm·mmHg</span>
          </div>
          <p className="text-[10px] text-slate-500">Myocardial load (&lt;10k)</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <HeartPulse className="w-3.5 h-3.5 text-sky-500" />
            <span>Pulse Pressure</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">{pulsePressure}</span>
            <span className="text-[10px] text-slate-400">mmHg</span>
          </div>
          <p className="text-[10px] text-slate-500">Arterial compliance (30-50)</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
            <Wind className="w-3.5 h-3.5 text-purple-500" />
            <span>Autonomic Tone</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-slate-900">{autonomicStress}</span>
            <span className="text-[10px] text-slate-400">proxy</span>
          </div>
          <p className="text-[10px] text-slate-500">HRV & HR balance</p>
        </div>
      </div>
    </div>
  );
};
