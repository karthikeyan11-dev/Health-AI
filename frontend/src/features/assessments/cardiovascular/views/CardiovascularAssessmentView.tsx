import React from 'react';
import type { CardioRiskData, CardioHistoryItem } from '../types/cardiovascular.types';
import type { RiskAssessmentRequest } from '@/sdk';
import { CurrentRiskCard } from '../components/CurrentRiskCard';
import { ShapDriversCard } from '../components/ShapDriversCard';
import { PpoGuidanceCard } from '../components/PpoGuidanceCard';
import { RiskHistoryChart } from '../components/RiskHistoryChart';
import { RiskHistoryTable } from '../components/RiskHistoryTable';
import { NewCardioAssessmentModal } from '../components/NewCardioAssessmentModal';
import { RefreshCw, HeartPulse } from 'lucide-react';

interface CardiovascularAssessmentViewProps {
  currentRisk: CardioRiskData | null;
  history: CardioHistoryItem[];
  isLoading: boolean;
  isSubmitting: boolean;
  isModalOpen: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onRefresh: () => void;
  onSubmitAssessment: (payload: RiskAssessmentRequest) => Promise<void>;
  defaultVitals?: {
    age?: number;
    sex?: number;
    heartRate?: number;
    spo2?: number;
    temperature?: number;
  };
}

export const CardiovascularAssessmentView: React.FC<CardiovascularAssessmentViewProps> = ({
  currentRisk,
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
            <HeartPulse className="w-7 h-7 text-rose-500" />
            <span>Cardiovascular Health & Risk Assessment</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time CatBoost 26-feature classification, SHAP biomarker explainability, and PPO RL
            guidance
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

      {/* Section 1: Current Risk Profile & Gauge */}
      <CurrentRiskCard data={currentRisk} onOpenNewAssessment={onOpenModal} />

      {/* Section 2: SHAP Feature Drivers & Explainability */}
      <ShapDriversCard
        topDrivers={currentRisk?.topDrivers}
        contributingFactors={currentRisk?.contributingFactors}
      />

      {/* Section 3: PPO RL Interventions & AI Guidance */}
      <PpoGuidanceCard
        recommendedIntervention={currentRisk?.recommendedIntervention}
        recommendations={currentRisk?.recommendations}
        guidance={currentRisk?.guidance}
      />

      {/* Section 4: Longitudinal History Trend Chart */}
      <RiskHistoryChart history={history} />

      {/* Section 5: Historical Assessment Audit Log Table */}
      <RiskHistoryTable history={history} isLoading={isLoading} />

      {/* Assessment Modal for Manual Entry / Parameter Fine-Tuning */}
      <NewCardioAssessmentModal
        isOpen={isModalOpen}
        onClose={onCloseModal}
        onSubmit={onSubmitAssessment}
        isSubmitting={isSubmitting}
        defaultVitals={defaultVitals}
      />
    </div>
  );
};
