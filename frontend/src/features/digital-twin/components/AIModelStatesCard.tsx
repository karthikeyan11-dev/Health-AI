import React from 'react';
import { Heart, Brain, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import type { DigitalTwinData } from '../types/digital-twin.types';

interface AIModelStatesCardProps {
  twin: DigitalTwinData | null;
}

export const AIModelStatesCard: React.FC<AIModelStatesCardProps> = ({ twin }) => {
  const cardioScore = twin ? Math.round(twin.currentCardioRiskScore ?? 0) : 0;
  const stressScore = twin ? Math.round(twin.currentStressScore ?? 0) : 0;

  const getCardioRiskBadge = (score: number) => {
    if (score < 20) {
      return {
        label: 'Low Risk',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barColor: 'bg-emerald-500',
      };
    }
    if (score < 40) {
      return {
        label: 'Moderate Risk',
        class: 'bg-teal-50 text-teal-700 border-teal-200',
        barColor: 'bg-teal-500',
      };
    }
    if (score < 60) {
      return {
        label: 'Elevated Risk',
        class: 'bg-amber-50 text-amber-700 border-amber-200',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'High Risk',
      class: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
    };
  };

  const getStressBadge = (score: number) => {
    if (score < 30) {
      return {
        label: 'Relaxed / Optimal',
        class: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        barColor: 'bg-emerald-500',
      };
    }
    if (score < 55) {
      return {
        label: 'Mild Tension',
        class: 'bg-teal-50 text-teal-700 border-teal-200',
        barColor: 'bg-teal-500',
      };
    }
    if (score < 75) {
      return {
        label: 'Elevated Stress',
        class: 'bg-amber-50 text-amber-700 border-amber-200',
        barColor: 'bg-amber-500',
      };
    }
    return {
      label: 'Severe Acute Stress',
      class: 'bg-rose-50 text-rose-700 border-rose-200',
      barColor: 'bg-rose-500',
    };
  };

  const cardioConfig = getCardioRiskBadge(cardioScore);
  const stressConfig = getStressBadge(stressScore);

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">AI-Derived Diagnostic Subsystems</h2>
            <p className="text-xs text-slate-500">
              Continuously aggregated machine learning inference feeds
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3 h-3" />
            Active ML Pipeline
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cardiovascular Risk Model State */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-rose-50/30 border border-rose-100/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cardiovascular Risk State</h3>
                  <p className="text-[11px] text-slate-500">ML Hemodynamic & 10-Yr CVD Model</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${cardioConfig.class}`}
              >
                {cardioConfig.label}
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">Risk Assessment Index</span>
                <span className="font-bold text-slate-900">{cardioScore} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${cardioConfig.barColor} transition-all duration-1000 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, cardioScore))}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {cardioScore < 20
                ? 'Cardiovascular risk markers indicate healthy vascular dynamics with optimal arterial compliance.'
                : cardioScore < 50
                  ? 'Moderate cardiovascular profile detected. Routine preventive lifestyle adjustments advised.'
                  : 'Elevated cardiovascular risk profile detected. Clinical consultation recommended.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-rose-100 text-xs">
            <span className="text-slate-500">Weight in composite score: 35%</span>
            <NavLink
              to="/assessments/cardiovascular"
              className="inline-flex items-center gap-1 font-bold text-rose-600 hover:text-rose-700 transition-colors"
            >
              <span>View Full Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>

        {/* Stress & Autonomic State Model */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-indigo-100/80 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Autonomic Stress State</h3>
                  <p className="text-[11px] text-slate-500">HRV & Multimodal Stress Classifier</p>
                </div>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${stressConfig.class}`}
              >
                {stressConfig.label}
              </span>
            </div>

            {/* Score Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600">Autonomic Strain Index</span>
                <span className="font-bold text-slate-900">{stressScore} / 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${stressConfig.barColor} transition-all duration-1000 rounded-full`}
                  style={{ width: `${Math.min(100, Math.max(0, stressScore))}%` }}
                />
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              {stressScore < 30
                ? 'Parasympathetic vagal brake is engaged, indicating resilient recovery and low autonomic stress.'
                : stressScore < 60
                  ? 'Moderate sympathetic arousal detected. Adequate sleep and hydration recommended.'
                  : 'High sympathetic strain detected. Stress mitigation and breathwork exercises advised.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-indigo-100 text-xs">
            <span className="text-slate-500">Weight in composite score: 25%</span>
            <NavLink
              to="/assessments/stress"
              className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <span>View Full Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};
