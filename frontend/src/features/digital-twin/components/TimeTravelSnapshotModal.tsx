import React from 'react';
import type { DigitalTwinData, DigitalTwinSnapshotData } from '../types/digital-twin.types';
import { SnapshotTriggerReasonEnum, TwinHealthStateEnum } from '@/sdk';
import {
  X,
  History,
  Activity,
  Heart,
  Brain,
  ShieldAlert,
  Thermometer,
  Smile,
  Sliders,
  RefreshCw,
  FileCheck2,
  Send,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Fingerprint,
} from 'lucide-react';

interface TimeTravelSnapshotModalProps {
  snapshot: DigitalTwinSnapshotData | null;
  currentTwin: DigitalTwinData | null;
  onClose: () => void;
}

export const TimeTravelSnapshotModal: React.FC<TimeTravelSnapshotModalProps> = ({
  snapshot,
  currentTwin,
  onClose,
}) => {
  if (!snapshot) return null;

  const scoreDelta = currentTwin
    ? Math.round(currentTwin.overallHealthScore) - Math.round(snapshot.overallHealthScore)
    : 0;

  const getTriggerDescription = (trigger: string) => {
    switch (trigger) {
      case SnapshotTriggerReasonEnum.BaselineCalibration:
        return {
          title: 'Physiological Baseline Calibration',
          desc: 'Triggered when the patient or clinician manually re-calibrated hemodynamic baselines (resting heart rate, temperature, SpO2).',
          icon: <Sliders className="w-5 h-5 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-200 text-purple-900',
        };
      case SnapshotTriggerReasonEnum.StateTransition:
        return {
          title: 'Autonomous State Transition',
          desc: 'Triggered when the Digital Twin detected a physiological category shift (e.g. from OPTIMAL to ELEVATED_STRESS or AT_RISK).',
          icon: <ShieldAlert className="w-5 h-5 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-200 text-amber-900',
        };
      case SnapshotTriggerReasonEnum.TelemetrySync:
        return {
          title: 'Longitudinal Telemetry Evolution',
          desc: 'Triggered during periodic telemetry aggregation when biometric vitals exhibited significant deltas beyond cooldown intervals.',
          icon: <RefreshCw className="w-5 h-5 text-sky-600" />,
          bg: 'bg-sky-50 border-sky-200 text-sky-900',
        };
      case SnapshotTriggerReasonEnum.AssessmentCompleted:
        return {
          title: 'Diagnostic Assessment Completed',
          desc: 'Triggered upon completion of a new AI cardiovascular risk or autonomic stress evaluation.',
          icon: <FileCheck2 className="w-5 h-5 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
        };
      case SnapshotTriggerReasonEnum.ManualSync:
      default:
        return {
          title: 'Manual State Snapshot',
          desc: 'Triggered via on-demand patient sync or clinician diagnostic evaluation.',
          icon: <Send className="w-5 h-5 text-indigo-600" />,
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
        };
    }
  };

  const triggerInfo = getTriggerDescription(snapshot.triggerReason);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Snapshot Time-Travel</h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  Version #{snapshot.version}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                {new Date(snapshot.timestamp).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'medium',
                })}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Trigger Banner */}
          <div className={`p-4 rounded-2xl border ${triggerInfo.bg} flex items-start gap-3.5`}>
            <div className="mt-0.5">{triggerInfo.icon}</div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider">{triggerInfo.title}</h4>
              <p className="text-xs opacity-90">{triggerInfo.desc}</p>
            </div>
          </div>

          {/* Health Score Comparative Delta */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Overall Health Score Evolution
              </span>
              <div className="flex items-center gap-1.5 font-bold text-xs">
                {scoreDelta > 0 ? (
                  <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <TrendingUp className="w-3.5 h-3.5" /> +{scoreDelta}% Improvement
                  </span>
                ) : scoreDelta < 0 ? (
                  <span className="flex items-center gap-1 text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    <TrendingDown className="w-3.5 h-3.5" /> {scoreDelta}% Shift
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    <Minus className="w-3.5 h-3.5" /> Stable
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  At Snapshot (v{snapshot.version})
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
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
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Current Live State (v{currentTwin?.version ?? 1})
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {currentTwin ? Math.round(currentTwin.overallHealthScore) : 0}%
                  </span>
                  {currentTwin && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getHealthStateBadge(
                        currentTwin.healthState,
                      )}`}
                    >
                      {currentTwin.healthState.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Vitals & AI Metrics Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Biometrics & Diagnostic Signals
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Heart Rate */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span className="text-xs font-semibold text-slate-600">Heart Rate</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {Math.round(snapshot.heartRate ?? 0)} bpm
                  </span>
                  {currentTwin && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      {Math.round(currentTwin.baselineHeartRate ?? 72)} bpm
                    </span>
                  )}
                </div>
              </div>

              {/* SpO2 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-sky-500" />
                  <span className="text-xs font-semibold text-slate-600">Oxygen Saturation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {Math.round(snapshot.spO2 ?? 0)}%
                  </span>
                  {currentTwin && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      {Math.round(currentTwin.baselineSpO2 ?? 98)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">Body Temp</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 text-xs">
                    {(snapshot.temperature ?? 36.5).toFixed(1)}°C
                  </span>
                  {currentTwin && (
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <ArrowRight className="w-3 h-3 text-slate-300" />
                      {(currentTwin.baselineTemperature ?? 36.5).toFixed(1)}°C
                    </span>
                  )}
                </div>
              </div>

              {/* Dominant Emotion */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Smile className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-slate-600">Emotion State</span>
                </div>
                <span className="font-bold text-xs text-slate-800 uppercase">
                  {snapshot.dominantEmotion}
                </span>
              </div>

              {/* Stress Score */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-semibold text-slate-600">Autonomic Stress</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {Math.round(snapshot.stressScore ?? 0)}%
                </span>
              </div>

              {/* Cardio Risk */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-semibold text-slate-600">Cardio Risk</span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-xs">
                  {Math.round(snapshot.cardioRiskScore ?? 0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Forensic Immutability Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/60 space-y-2">
            <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <Fingerprint className="w-3.5 h-3.5 text-indigo-500" />
              <span>Immutable Ledger Verification</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-500">
              <div>
                <span className="text-slate-400">Snapshot ID: </span>
                <span className="text-slate-700">{snapshot.id}</span>
              </div>
              <div>
                <span className="text-slate-400">Digital Twin ID: </span>
                <span className="text-slate-700">{snapshot.digitalTwinId}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Close Time-Travel
          </button>
        </div>
      </div>
    </div>
  );
};
