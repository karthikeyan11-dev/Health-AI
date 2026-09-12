import React from 'react';
import { RefreshCw, Sliders, ShieldCheck, Clock, HeartPulse } from 'lucide-react';
import type { DigitalTwinData, TwinHealthState } from '../types/digital-twin.types';

interface DigitalTwinHeaderCardProps {
  twin: DigitalTwinData | null;
  isSyncing: boolean;
  onRefresh: () => void;
  onOpenCalibration: () => void;
}

export const DigitalTwinHeaderCard: React.FC<DigitalTwinHeaderCardProps> = ({
  twin,
  isSyncing,
  onRefresh,
  onOpenCalibration,
}) => {
  const getHealthStateConfig = (state: TwinHealthState = 'OPTIMAL') => {
    switch (state) {
      case 'OPTIMAL':
        return {
          label: 'Optimal Homeostasis',
          badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          ringColor: '#10B981',
          bgGradient: 'from-emerald-900/40 via-[#083032] to-[#041a1b]',
          textColor: 'text-emerald-400',
          description:
            'Physiological vitals, cardiovascular markers, and autonomic balance are in peak harmony.',
        };
      case 'STABLE':
        return {
          label: 'Stable Physiological State',
          badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          ringColor: '#14B8A6',
          bgGradient: 'from-teal-900/40 via-[#083032] to-[#041a1b]',
          textColor: 'text-teal-400',
          description:
            'Baseline metrics are well within safe bounds. Autonomic nervous tone is resilient.',
        };
      case 'ELEVATED_STRESS':
        return {
          label: 'Elevated Sympathetic Tone',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          ringColor: '#F59E0B',
          bgGradient: 'from-amber-950/40 via-[#083032] to-[#041a1b]',
          textColor: 'text-amber-400',
          description:
            'Elevated stress indices or mild vitals elevation observed. Active relaxation recommended.',
        };
      case 'AT_RISK':
        return {
          label: 'At-Risk Physiological Load',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
          ringColor: '#F97316',
          bgGradient: 'from-orange-950/40 via-[#083032] to-[#041a1b]',
          textColor: 'text-orange-400',
          description:
            'Cardiovascular risk markers or sustained vital deviations require clinical monitoring.',
        };
      case 'CRITICAL':
      default:
        return {
          label: 'Critical Alert State',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          ringColor: '#EF4444',
          bgGradient: 'from-rose-950/40 via-[#083032] to-[#041a1b]',
          textColor: 'text-rose-400',
          description:
            'Significant biometric anomalies detected across multiple physiological subsystems.',
        };
    }
  };

  const score = twin ? Math.round(twin.overallHealthScore) : 0;
  const stateConfig = getHealthStateConfig(twin?.healthState);

  // SVG Radial Gauge Calculations
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const formattedSyncTime = twin?.lastSyncTimestamp
    ? new Date(twin.lastSyncTimestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : 'Just now';

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${stateConfig.bgGradient} border border-white/15 p-6 sm:p-8 text-white shadow-xl backdrop-blur-xl`}
    >
      {/* Background Subtle Grid Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Radial Health Score Gauge */}
        <div className="flex items-center gap-6">
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                className="text-white/10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r={radius}
                stroke={stateConfig.ringColor}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black tracking-tight text-white">{score}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                Score / 100
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span
                    className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                    style={{ backgroundColor: stateConfig.ringColor }}
                  />
                  <span
                    className="relative inline-flex rounded-full h-2 w-2"
                    style={{ backgroundColor: stateConfig.ringColor }}
                  />
                </span>
                <span className={stateConfig.textColor}>{stateConfig.label}</span>
              </div>

              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white/10 text-white/80 border border-white/10">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Model Confidence: {twin?.confidence ?? 95}%</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <HeartPulse className="w-7 h-7 text-emerald-400 shrink-0" />
              <span>Patient Digital Twin</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
              {stateConfig.description}
            </p>
          </div>
        </div>

        {/* Right Column: Actions & Freshness */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-3 w-full lg:w-auto shrink-0 border-t lg:border-t-0 border-white/10 pt-4 lg:pt-0">
          <div className="flex items-center gap-1.5 text-xs text-white/70 font-medium">
            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Telemetry Synced: {formattedSyncTime}</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onOpenCalibration}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white text-xs font-bold transition-all shadow-sm hover:scale-[1.02] cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calibrate Baselines</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isSyncing}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 text-xs font-bold transition-all shadow-md hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronizing...' : 'Live Sync'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
