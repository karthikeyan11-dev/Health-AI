import React from 'react';
import type { StressHistoryItem } from '../types/stress.types';
import { STRESS_LEVEL_COLORS } from '../constants/stress.constants';
import { Clock, History } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StressHistoryTableProps {
  history: StressHistoryItem[];
  isLoading: boolean;
}

export const StressHistoryTable: React.FC<StressHistoryTableProps> = ({ history, isLoading }) => {
  return (
    <div className="rounded-3xl bg-white border border-slate-200/80 shadow-sm p-6 sm:p-7 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5 text-slate-700" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Stress Evaluation History
            </h3>
            <p className="text-xs text-slate-500">
              Historical record of 90-second autonomic stress classifications
            </p>
          </div>
        </div>
        <span className="text-xs font-bold text-slate-500">
          {history.length} Record{history.length === 1 ? '' : 's'}
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-slate-400 text-xs animate-pulse">
          Loading stress history records...
        </div>
      ) : history.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          No past stress evaluations found. Click &quot;New Assessment&quot; to test your autonomic
          state.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-3 pl-2">Timestamp</th>
                <th className="pb-3">Stress State</th>
                <th className="pb-3">Score</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Contributing Factors</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {history.map((record, index) => {
                const rowKey = record.id || record.timestamp || String(index);
                const level = (record.stressLevel || 'LOW') as keyof typeof STRESS_LEVEL_COLORS;
                const levelCfg = STRESS_LEVEL_COLORS[level] || STRESS_LEVEL_COLORS.LOW;

                return (
                  <tr key={rowKey} className="hover:bg-slate-50/80 transition-colors">
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
                          levelCfg.badgeBg,
                        )}
                      >
                        {levelCfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold text-slate-900">
                      {Math.round(record.stressScore)} / 100
                    </td>
                    <td className="py-3.5 text-slate-600">
                      {record.confidence ? Math.round(record.confidence) : 88}%
                    </td>
                    <td className="py-3.5 text-slate-600 truncate max-w-xs">
                      {record.contributingFactors?.join(', ') || 'Normal Autonomic Tone'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
