import React from 'react';
import type { CardioRiskData } from '../types/cardiovascular.types';
import { Bot, CheckCircle2, Stethoscope, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PpoGuidanceCardProps {
  recommendedIntervention?: string;
  recommendations?: string[];
  guidance?: CardioRiskData['guidance'];
}

export const PpoGuidanceCard: React.FC<PpoGuidanceCardProps> = ({
  recommendedIntervention,
  recommendations,
  guidance,
}) => {
  const providerLabel =
    guidance?.provider === 'gemini'
      ? 'Gemini 3.7 Medical LLM'
      : guidance?.provider === 'groq'
        ? 'Groq Llama-3 Fast LLM'
        : 'Clinical Health Protocol';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* PPO RL Intervention Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#083032] to-[#0d4648] text-white p-6 sm:p-7 space-y-5 shadow-sm border border-emerald-500/20 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight text-white">
                PPO Reinforcement Learning Action
              </h3>
              <p className="text-xs text-white/70">
                Markov Decision Process (MDP) optimized clinical plan
              </p>
            </div>
          </div>
          <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30">
            RL Policy
          </span>
        </div>

        {/* Primary Recommended Intervention Banner */}
        <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            Primary Recommended Intervention
          </span>
          <p className="text-lg font-extrabold text-white">
            {recommendedIntervention || 'Maintain Current Routine & Continue Hydration'}
          </p>
        </div>

        {/* Actionable Steps */}
        {recommendations && recommendations.length > 0 && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 block">
              Prescribed Action Steps
            </span>
            <div className="space-y-2">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 text-xs text-white/90 bg-white/5 p-2.5 rounded-xl border border-white/10"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* AI Physician Personalized Guidance Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Personalized AI Health Guidance
                </h3>
                <p className="text-xs text-slate-500">
                  Synthesized guidance from physiological markers
                </p>
              </div>
            </div>

            <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              <Sparkles className="w-3 h-3" /> {providerLabel}
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/40 via-slate-50 to-white border border-purple-100 text-slate-800 space-y-2">
            <p className="text-xs leading-relaxed font-medium">
              {guidance?.message ||
                'Your cardiovascular indicators reflect steady autonomic regulation. Ensure consistent hydration and uninterrupted sleep cycles to maintain optimal baseline recovery.'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Engine: {guidance?.provider || 'Gemini 3.7'}</span>
          <span
            className={cn(
              'font-semibold',
              guidance?.status === 'success' ? 'text-emerald-600' : 'text-amber-600',
            )}
          >
            Status: {guidance?.status || 'Active'}
          </span>
        </div>
      </div>
    </div>
  );
};
