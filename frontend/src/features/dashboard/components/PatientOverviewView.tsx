import React from 'react';
import type { PatientOverviewData } from '@/sdk';
import { PatientDeviceBanner } from './PatientDeviceBanner';
import { VitalsMetricGrid } from './VitalsMetricGrid';
import { VitalsTrendLineChart } from './VitalsTrendLineChart';
import { HealthRiskSummaryDonutChart } from './HealthRiskSummaryDonutChart';
import { RecentActivityList } from './RecentActivityList';
import { PATIENT_OVERVIEW_TEXTS } from '../constants/patient-overview.constants';
import { RefreshCw } from 'lucide-react';

interface PatientOverviewViewProps {
  data: PatientOverviewData | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export function PatientOverviewView({
  data,
  isLoading,
  onRefresh,
}: PatientOverviewViewProps): React.JSX.Element {
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

      {/* Patient & Device Status Banner */}
      <PatientDeviceBanner
        patientInfo={data?.patientInfo}
        deviceInfo={data?.deviceInfo}
        digitalTwinState={data?.digitalTwinState}
      />

      {/* Key Physiological Metrics Grid */}
      <VitalsMetricGrid
        vitals={data?.latestVitals}
        cardioRisk={data?.latestCardiovascularRisk}
        stress={data?.latestStressAssessment}
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
