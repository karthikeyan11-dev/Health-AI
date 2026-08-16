import React, { useState, useEffect, useCallback } from 'react';
import { PatientOverviewView } from '../components/PatientOverviewView';
import { patientOverviewApi } from '../api/patient-overview.api';
import type { PatientOverviewData } from '@/sdk';
import { Loader2 } from 'lucide-react';
import { PATIENT_OVERVIEW_TEXTS } from '../constants/patient-overview.constants';
import { ErrorCard } from '@/components/ui';
import { extractErrorMessage } from '@/utils/error.util';

export function DashboardContainer(): React.JSX.Element {
  const [data, setData] = useState<PatientOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const overviewData = await patientOverviewApi.getPatientOverview();
      setData(overviewData);
    } catch (err) {
      setError(extractErrorMessage(err, PATIENT_OVERVIEW_TEXTS.ERROR_SUBTITLE));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  if (isLoading && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-3">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
        <p className="text-sm font-medium text-slate-500">{PATIENT_OVERVIEW_TEXTS.LOADING_TEXT}</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto py-6">
        <ErrorCard
          title={PATIENT_OVERVIEW_TEXTS.ERROR_TITLE}
          message={error}
          onRetry={() => void fetchOverview()}
          retryText={PATIENT_OVERVIEW_TEXTS.RETRY_BUTTON}
        />
      </div>
    );
  }

  return <PatientOverviewView data={data} isLoading={isLoading} onRefresh={fetchOverview} />;
}
