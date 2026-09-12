import React, { useState } from 'react';
import type { CardioHistoryItem } from '../types/cardiovascular.types';
import { CARDIO_RISK_COLORS } from '../constants/cardiovascular.constants';
import { ChevronRight, ChevronDown, Clock, History } from 'lucide-react';
import { SectionLoader } from '@/components/common';
import { cn } from '@/lib/utils';

interface RiskHistoryTableProps {
  history: CardioHistoryItem[];
  isLoading: boolean;
}

export const RiskHistoryTable: React.FC<RiskHistoryTableProps> = ({ history, isLoading }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Assessment Logs & Historical Records
            </h3>
            <p className="text-xs text-slate-500">
              Audit trail of all CatBoost cardiovascular predictions
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {history.length} Record{history.length === 1 ? '' : 's'}
        </span>
      </div>

      {isLoading ? (
        <SectionLoader
          message="Loading historical assessment records..."
          colorTheme="rose"
          paddingY="py-12"
        />
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No past assessment records found. Click &quot;New Assessment&quot; to generate an
          assessment.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">Risk Tier</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Primary Intervention</th>
                <th className="pb-3 text-right pr-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((record, index) => {
                const rowKey = record.id || record.timestamp || String(index);
                const tier = (record.riskLevel || 'LOW') as keyof typeof CARDIO_RISK_COLORS;
                const tierCfg = CARDIO_RISK_COLORS[tier] || CARDIO_RISK_COLORS.LOW;
                const isExpanded = expandedId === rowKey;

                return (
                  <React.Fragment key={rowKey}>
                    <tr
                      onClick={() => toggleExpand(rowKey)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 pl-2 font-semibold text-slate-800 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(record.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            'text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border',
                            tierCfg.badgeBg,
                          )}
                        >
                          {tierCfg.label}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900">
                        {Math.round(record.riskScore)} / 100
                      </td>
                      <td className="py-3.5 text-slate-600">
                        {record.confidence ? Math.round(record.confidence) : 90}%
                      </td>
                      <td className="py-3.5 text-slate-600 truncate max-w-xs">
                        {record.recommendedIntervention ||
                          record.recommendations?.[0] ||
                          'Routine Maintenance'}
                      </td>
                      <td className="py-3.5 text-right pr-2">
                        <button
                          type="button"
                          className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="bg-slate-50/60">
                        <td colSpan={6} className="p-4">
                          <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-inner">
                            {/* Guidance Message */}
                            {record.guidance && (
                              <div className="text-xs text-slate-700">
                                <span className="font-bold text-slate-900 block mb-1">
                                  Physician AI Message ({record.guidance.provider}):
                                </span>
                                <p className="italic bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                                  &quot;{record.guidance.message}&quot;
                                </p>
                              </div>
                            )}

                            {/* Top Drivers in History Item */}
                            {record.topDrivers && record.topDrivers.length > 0 && (
                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-900 block text-[11px]">
                                  Identified Biomarker Influences:
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                  {record.topDrivers.map((d, i) => (
                                    <div
                                      key={i}
                                      className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] flex justify-between"
                                    >
                                      <span className="font-semibold text-slate-700">
                                        {d.feature.replace(/_/g, ' ')}
                                      </span>
                                      <span
                                        className={cn(
                                          'font-bold',
                                          d.impact > 0 ? 'text-rose-600' : 'text-emerald-600',
                                        )}
                                      >
                                        {d.impact > 0
                                          ? `+${d.impact.toFixed(2)}`
                                          : d.impact.toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Prescribed Recommendations */}
                            {record.recommendations && record.recommendations.length > 0 && (
                              <div>
                                <span className="font-bold text-slate-900 block text-[11px] mb-1">
                                  Recommendations:
                                </span>
                                <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
                                  {record.recommendations.map((rec, rIdx) => (
                                    <li key={rIdx}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
