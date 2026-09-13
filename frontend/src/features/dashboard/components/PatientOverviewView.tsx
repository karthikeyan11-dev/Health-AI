import React from 'react';
import type { PatientOverviewData } from '@/sdk';
import { PatientDeviceBanner } from './PatientDeviceBanner';
import { VitalsMetricGrid } from './VitalsMetricGrid';
import { VitalsTrendLineChart } from './VitalsTrendLineChart';
import { HealthRiskSummaryDonutChart } from './HealthRiskSummaryDonutChart';
import { RecentActivityList } from './RecentActivityList';
import { PATIENT_OVERVIEW_TEXTS } from '../constants/patient-overview.constants';
import { RefreshCw, AlertTriangle, XCircle } from 'lucide-react';
import type { TelemetryStreamState } from '../utils/useTelemetryStream';

interface PatientOverviewViewProps {
  data: PatientOverviewData | null;
  isLoading: boolean;
  onRefresh: () => void;
  telemetryStream?: TelemetryStreamState;
}

export function PatientOverviewView({
  data,
  isLoading,
  onRefresh,
  telemetryStream,
}: PatientOverviewViewProps): React.JSX.Element {
  const alerts = telemetryStream?.alerts || [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {PATIENT_OVERVIEW_TEXTS.PAGE_TITLE}
          </h1>
          <p className="text-sm text-slate-500 mt-1">{PATIENT_OVERVIEW_TEXTS.PAGE_SUBTITLE}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{PATIENT_OVERVIEW_TEXTS.REFRESH_BUTTON}</span>
          </button>
        </div>
      </div>

      {/* Live Alerts Toast Container */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          {alerts.map((alert, idx) => {
            const isCritical = alert.severity === 'CRITICAL';
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2 duration-300 ${
                  isCritical
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {isCritical ? (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h4 className="text-xs font-extrabold tracking-wide uppercase">
                      {alert.title}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">{alert.message}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold opacity-75 shrink-0">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient & Smartwatch Status Banner */}
      <PatientDeviceBanner
        patientInfo={data?.patientInfo}
        deviceInfo={data?.deviceInfo}
        digitalTwinState={data?.digitalTwinState}
        isLiveStreaming={telemetryStream?.isConnected}
        batteryLevel={telemetryStream?.batteryLevel}
        liveDeviceId={telemetryStream?.deviceId}
        lastUpdated={telemetryStream?.lastUpdated}
      />

      {/* Key Physiological Metrics Grid */}
      <VitalsMetricGrid
        vitals={data?.latestVitals}
        cardioRisk={data?.latestCardiovascularRisk}
        stress={data?.latestStressAssessment}
        liveReadings={telemetryStream?.liveVitals}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <VitalsTrendLineChart data={data?.vitalSignTrend} />
        </div>
        <div>
          <HealthRiskSummaryDonutChart summary={data?.healthRiskSummary} />
        </div>
      </div>

      {/* Recent Activity & Recommendations */}
      <RecentActivityList
        recommendations={data?.recentRecommendations}
        activity={data?.recentActivity}
      />
    </div>
  );
}
