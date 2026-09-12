import React from 'react';
import type {
  DigitalTwinSnapshotData,
  PaginatedSnapshots,
  SnapshotTriggerReason,
} from '../types/digital-twin.types';
import { SnapshotTriggerReasonEnum, TwinHealthStateEnum } from '@/sdk';
import { SectionLoader } from '@/components/common';
import {
  History,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Activity,
  Heart,
  Brain,
  ShieldAlert,
  Sliders,
  RefreshCw,
  FileCheck2,
  Send,
} from 'lucide-react';

interface EvolutionTimelineCardProps {
  snapshots: PaginatedSnapshots | null;
  currentPage: number;
  selectedTrigger?: SnapshotTriggerReason;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onTriggerChange: (trigger?: SnapshotTriggerReason) => void;
  onInspectSnapshot: (snapshot: DigitalTwinSnapshotData) => void;
}

export const EvolutionTimelineCard: React.FC<EvolutionTimelineCardProps> = ({
  snapshots,
  currentPage,
  selectedTrigger,
  isLoading,
  onPageChange,
  onTriggerChange,
  onInspectSnapshot,
}) => {
  const items = snapshots?.items || [];
  const totalPages = snapshots?.totalPages || 1;
  const total = snapshots?.total || 0;

  const getTriggerBadge = (trigger: string) => {
    switch (trigger) {
      case SnapshotTriggerReasonEnum.BaselineCalibration:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-purple-50 text-purple-700 border border-purple-200">
            <Sliders className="w-3 h-3 text-purple-600" />
            Calibration
          </span>
        );
      case SnapshotTriggerReasonEnum.StateTransition:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="w-3 h-3 text-amber-600" />
            Transition
          </span>
        );
      case SnapshotTriggerReasonEnum.TelemetrySync:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw className="w-3 h-3 text-sky-600" />
            Telemetry
          </span>
        );
      case SnapshotTriggerReasonEnum.AssessmentCompleted:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <FileCheck2 className="w-3 h-3 text-emerald-600" />
            Assessment
          </span>
        );
      case SnapshotTriggerReasonEnum.ManualSync:
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Send className="w-3 h-3 text-indigo-600" />
            Manual
          </span>
        );
    }
  };

  const getHealthStateBadge = (state: string) => {
    switch (state) {
      case TwinHealthStateEnum.Optimal:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case TwinHealthStateEnum.Stable:
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case TwinHealthStateEnum.ElevatedStress:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case TwinHealthStateEnum.AtRisk:
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case TwinHealthStateEnum.Critical:
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  const formatSnapshotTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return {
        date: date.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    } catch {
      return { date: dateStr, time: '' };
    }
  };

  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Evolution Ledger & Snapshots</h3>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-bold">
                {total} {total === 1 ? 'record' : 'records'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Immutable historical timeline of patient state transitions, calibrations, and AI syncs
            </p>
          </div>
        </div>

        {/* Trigger Filter Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedTrigger || ''}
              onChange={(e) =>
                onTriggerChange(
                  e.target.value ? (e.target.value as SnapshotTriggerReason) : undefined,
                )
              }
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Triggers</option>
              <option value={SnapshotTriggerReasonEnum.BaselineCalibration}>Calibration</option>
              <option value={SnapshotTriggerReasonEnum.StateTransition}>State Transition</option>
              <option value={SnapshotTriggerReasonEnum.TelemetrySync}>Telemetry Sync</option>
              <option value={SnapshotTriggerReasonEnum.AssessmentCompleted}>Assessment</option>
              <option value={SnapshotTriggerReasonEnum.ManualSync}>Manual Sync</option>
            </select>
          </div>
        </div>
      </div>

      {/* Snapshot Ledger Table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <SectionLoader
            message="Loading evolution snapshots..."
            colorTheme="indigo"
            paddingY="py-16"
          />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 space-y-2">
            <Clock className="w-8 h-8 text-slate-300" />
            <span className="text-sm font-semibold text-slate-700">No snapshots recorded yet</span>
            <span className="text-xs text-slate-400">
              Snapshots are automatically recorded upon state shifts, telemetry syncs, and baseline
              calibrations.
            </span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-5">Version</th>
                <th className="py-3.5 px-5">Recorded Time</th>
                <th className="py-3.5 px-5">Trigger Reason</th>
                <th className="py-3.5 px-5">Health Score & State</th>
                <th className="py-3.5 px-5">Key Vitals</th>
                <th className="py-3.5 px-5">Diagnostic AI</th>
                <th className="py-3.5 px-5 text-right">Time-Travel</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {items.map((snapshot) => {
                const { date, time } = formatSnapshotTime(snapshot.timestamp);
                return (
                  <tr
                    key={snapshot.id}
                    className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                    onClick={() => onInspectSnapshot(snapshot)}
                  >
                    {/* Version */}
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                        v{snapshot.version}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{date}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{time}</div>
                    </td>

                    {/* Trigger Reason */}
                    <td className="py-4 px-5">{getTriggerBadge(snapshot.triggerReason)}</td>

                    {/* Health Score & State */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {Math.round(snapshot.overallHealthScore)}%
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getHealthStateBadge(
                            snapshot.healthState,
                          )}`}
                        >
                          {snapshot.healthState.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>

                    {/* Key Vitals */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="flex items-center gap-1 font-medium" title="Heart Rate">
                          <Heart className="w-3.5 h-3.5 text-rose-500" />
                          {Math.round(snapshot.heartRate ?? 0)}{' '}
                          <span className="text-[10px] text-slate-400">bpm</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium" title="SpO2">
                          <Activity className="w-3.5 h-3.5 text-sky-500" />
                          {Math.round(snapshot.spO2 ?? 0)}{' '}
                          <span className="text-[10px] text-slate-400">%</span>
                        </span>
                      </div>
                    </td>

                    {/* Diagnostic AI */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 text-slate-600">
                        <span className="flex items-center gap-1" title="Stress Score">
                          <Brain className="w-3.5 h-3.5 text-purple-500" />
                          <span className="font-medium text-slate-700">
                            {Math.round(snapshot.stressScore ?? 0)}%
                          </span>
                        </span>
                        <span className="flex items-center gap-1" title="Cardio Risk">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                          <span className="font-medium text-slate-700">
                            {Math.round(snapshot.cardioRiskScore ?? 0)}%
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectSnapshot(snapshot);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Showing Page <span className="font-bold text-slate-800">{currentPage}</span> of{' '}
            <span className="font-bold text-slate-800">{totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold text-slate-700 flex items-center gap-1 transition-all cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
