import React from 'react';
import type { CardioRiskData } from '../types/cardiovascular.types';
import { FEATURE_HUMAN_NAMES } from '../constants/cardiovascular.constants';
import { TrendingUp, TrendingDown, Info, Sliders } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShapDriversCardProps {
  topDrivers?: CardioRiskData['topDrivers'];
  contributingFactors?: string[];
}

export const ShapDriversCard: React.FC<ShapDriversCardProps> = ({
  topDrivers,
  contributingFactors,
}) => {
  const drivers = topDrivers && topDrivers.length > 0 ? topDrivers : [];

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Sliders className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Physiological Risk Drivers (SHAP Explainability)
            </h3>
            <p className="text-xs text-slate-500">
              Primary physiological biomarkers influencing the AI risk score
            </p>
          </div>
        </div>
      </div>

      {drivers.length > 0 ? (
        <div className="space-y-3">
          {drivers.map((driver, idx) => {
            const meta = FEATURE_HUMAN_NAMES[driver.feature] || {
              label: driver.feature.replace(/_/g, ' '),
              unit: '',
              description: 'Physiological parameter',
            };
            const isElevating = driver.impact > 0;
            const impactMagnitude = Math.abs(driver.impact);
            const impactPercent = Math.min(Math.round(impactMagnitude * 200), 100);

            return (
              <div
                key={driver.feature + idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 hover:bg-slate-50 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{meta.label}</span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      ({driver.value} {meta.unit})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isElevating ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
                        <TrendingUp className="w-3 h-3 text-rose-500" />+{driver.impact.toFixed(3)}{' '}
                        (Increases Risk)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                        <TrendingDown className="w-3 h-3 text-emerald-500" />
                        {driver.impact.toFixed(3)} (Protective)
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar visualizing impact weight */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isElevating
                        ? 'bg-gradient-to-r from-orange-400 to-rose-500'
                        : 'bg-gradient-to-r from-teal-400 to-emerald-500',
                    )}
                    style={{ width: `${Math.max(impactPercent, 10)}%` }}
                  />
                </div>

                <p className="text-[11px] text-slate-500">{meta.description}</p>
              </div>
            );
          })}
        </div>
      ) : contributingFactors && contributingFactors.length > 0 ? (
        <div className="space-y-2">
          {contributingFactors.map((factor, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 flex items-center gap-2"
            >
              <Info className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 text-center text-slate-500 text-xs font-medium">
          No significant individual risk factors identified. Physiological biomarkers remain
          balanced.
        </div>
      )}
    </div>
  );
};
