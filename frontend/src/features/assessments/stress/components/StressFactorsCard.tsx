import React from 'react';
import type { StressData } from '../types/stress.types';
import { HeartPulse, Activity, Thermometer } from 'lucide-react';

interface StressFactorsCardProps {
  data: StressData | null;
}

export const StressFactorsCard: React.FC<StressFactorsCardProps> = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Cardiac Reactivity Card */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" /> Cardiac Reactivity
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            HR Variance
          </span>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Window Analysis</p>
          <p className="text-xs text-slate-500 mt-1">
            Dynamic standard deviation of 90-second heart rate telemetry window.
          </p>
        </div>
      </div>

      {/* Oxygen & Tissue Saturation */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-cyan-600" /> Peripheral SpO₂
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
            Respiration
          </span>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Tissue Oxygenation</p>
          <p className="text-xs text-slate-500 mt-1">
            Respiratory rhythm stability correlated with autonomic arousal.
          </p>
        </div>
      </div>

      {/* Thermoregulatory Tone */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-amber-500" /> Vasomotor Response
          </span>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Temp Curve
          </span>
        </div>
        <div>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Thermoregulation</p>
          <p className="text-xs text-slate-500 mt-1">
            Peripheral skin perfusion monitored for acute sympathetic vasoconstriction.
          </p>
        </div>
      </div>
    </div>
  );
};
