import React from 'react';
import type {
  PatientOverviewInfo,
  PatientOverviewDeviceInfo,
  PatientOverviewDigitalTwin,
} from '@/sdk';
import { Watch, ShieldCheck, Activity, BatteryCharging } from 'lucide-react';

interface PatientDeviceBannerProps {
  patientInfo?: PatientOverviewInfo;
  deviceInfo?: PatientOverviewDeviceInfo;
  digitalTwinState?: PatientOverviewDigitalTwin;
  isLiveStreaming?: boolean;
  batteryLevel?: number;
  liveDeviceId?: string;
  lastUpdated?: string;
}

export function PatientDeviceBanner({
  patientInfo,
  deviceInfo,
  digitalTwinState,
  isLiveStreaming = false,
  batteryLevel,
  liveDeviceId,
  lastUpdated,
}: PatientDeviceBannerProps): React.JSX.Element {
  const isOnline = isLiveStreaming || deviceInfo?.status === 'ONLINE';
  const effectiveDeviceId = liveDeviceId || deviceInfo?.deviceId || 'WATCH_HEALTH_AI_PRO_01';
  const effectiveBattery = batteryLevel ?? 94;
  const fullName = patientInfo
    ? `${patientInfo.firstName} ${patientInfo.lastName}`
    : 'Karthikeyan M';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#062426] via-[#083032] to-[#0c474a] text-white border border-emerald-500/25 shadow-2xl rounded-3xl p-6 sm:p-7 transition-all">
      {/* Ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Patient Profile summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-emerald-400/25 to-teal-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 font-black text-xl shadow-inner">
              {fullName[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {fullName}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-[10px] font-extrabold text-emerald-300 tracking-wide uppercase">
                  Connected
                </span>
              </div>
              <p className="text-xs text-emerald-100/75 font-medium mt-0.5">
                Age: {patientInfo?.age || 24} • Gender: {patientInfo?.gender || 'MALE'} • Health
                State:{' '}
                <span className="font-bold text-emerald-300">
                  {digitalTwinState?.healthState || 'OPTIMAL'}
                </span>
                {lastUpdated && (
                  <span className="ml-2 text-[11px] text-emerald-300/80">
                    • Live: {new Date(lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Smartwatch Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Smartwatch Connection Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white shadow-sm">
            <Watch className={`w-4 h-4 ${isOnline ? 'text-emerald-300' : 'text-slate-400'}`} />
            <span>{effectiveDeviceId}</span>
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline
                  ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse'
                  : 'bg-rose-400'
              }`}
            />
          </div>

          {/* Battery Level Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-xs font-bold text-emerald-300 backdrop-blur-md">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>{effectiveBattery}%</span>
          </div>

          {/* Live Telemetry Stream Indicator */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-950/60 border border-teal-500/30 text-xs font-bold text-teal-300 backdrop-blur-md">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Live Stream</span>
          </div>

          {/* Digital Twin Health Score Badge */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold text-white backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Twin: {digitalTwinState?.overallHealthScore ?? 92.5}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
