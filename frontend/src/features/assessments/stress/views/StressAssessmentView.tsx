import React from 'react';
import type { StressData, StressHistoryItem } from '../types/stress.types';
import type { StressAssessmentRequest } from '@/sdk';
import { CurrentStressCard } from '../components/CurrentStressCard';
import { StressFactorsCard } from '../components/StressFactorsCard';
import { StressTrendChart } from '../components/StressTrendChart';
import { StressHistoryTable } from '../components/StressHistoryTable';
import { NewStressAssessmentModal } from '../components/NewStressAssessmentModal';
import { RefreshCw, Brain } from 'lucide-react';

interface StressAssessmentViewProps {
  currentStress: StressData | null;
  history: StressHistoryItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onRefresh: () => void;
  onSubmitAssessment: (payload: StressAssessmentRequest) => Promise<void>;
  defaultVitals?: {
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  };
}

export const StressAssessmentView: React.FC<StressAssessmentViewProps> = ({
  currentStress,
  history,
  isLoading,
  isSubmitting,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onRefresh,
  onSubmitAssessment,
  defaultVitals,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Brain className="w-7 h-7 text-indigo-600" />
            <span>Autonomic Stress Analysis</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Machine-learned sympathetic & parasympathetic nervous system classification from 90s
            telemetry windows
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Section 1: Current Stress Level & Gauge */}
      <CurrentStressCard data={currentStress} onOpenNewAssessment={onOpenModal} />

      {/* Section 2: Physiological Reactivity Breakdown */}
      <StressFactorsCard data={currentStress} />

      {/* Section 3: Longitudinal Trend Line */}
      <StressTrendChart history={history} />

      {/* Section 4: History Table */}
      <StressHistoryTable history={history} isLoading={isLoading} />

      {/* Assessment Modal */}
      <NewStressAssessmentModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSubmit={onSubmitAssessment}
        isSubmitting={isSubmitting}
        defaultVitals={defaultVitals}
      />
    </div>
  );
};
