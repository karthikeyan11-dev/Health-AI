import React from 'react';
import type {
  PatientOverviewInfo,
  PatientOverviewDeviceInfo,
  PatientOverviewDigitalTwin,
} from '@/sdk';
import { Radio, ShieldCheck, Activity } from 'lucide-react';

interface PatientDeviceBannerProps {
  patientInfo?: PatientOverviewInfo;
  deviceInfo?: PatientOverviewDeviceInfo;
  digitalTwinState?: PatientOverviewDigitalTwin;
}

export function PatientDeviceBanner({
  patientInfo,
  deviceInfo,
  digitalTwinState,
}: PatientDeviceBannerProps): React.JSX.Element {
  const isOnline = deviceInfo?.status === 'ONLINE';
  const fullName = patientInfo
    ? `${patientInfo.firstName} ${patientInfo.lastName}`
    : 'Patient User';

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#083032] to-[#0d4a4d] text-white border border-emerald-500/20 shadow-xl rounded-2xl p-6 sm:p-7">
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left: Patient Profile summary */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-extrabold text-lg shadow-sm">
              {fullName[0]}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                {fullName}
              </h2>
              <p className="text-xs text-emerald-200/80 font-medium">
                Age: {patientInfo?.age || 34} • Gender: {patientInfo?.gender || 'MALE'} • Health
                State: {digitalTwinState?.healthState || 'STABLE'}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Device & Monitoring Pill Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white">
            <Radio
              className={`w-4 h-4 ${isOnline ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`}
            />
            <span>ESP32 Device: {deviceInfo?.deviceId || 'ESP32_DEV_01'}</span>
            <span
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`}
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Digital Twin Score: {digitalTwinState?.overallHealthScore ?? 92.5}/100</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white">
            <Activity className="w-4 h-4 text-teal-300" />
            <span>Live Sensor Streaming</span>
          </div>
        </div>
      </div>
    </div>
  );
}
