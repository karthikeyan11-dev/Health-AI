import React, { useEffect, useState, useCallback } from 'react';
import { cardioApi } from '../api/cardiovascular.api';
import type { CardioRiskData, CardioHistoryItem } from '../types/cardiovascular.types';
import type { RiskAssessmentRequest } from '@/sdk';
import { CardiovascularAssessmentView } from '../views/CardiovascularAssessmentView';

export const CardiovascularAssessmentContainer: React.FC = () => {
  const [currentRisk, setCurrentRisk] = useState<CardioRiskData | null>(null);
  const [history, setHistory] = useState<CardioHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [riskRes, historyRes] = await Promise.all([
        cardioApi.getCurrentRisk(''),
        cardioApi.getRiskHistory('', 20),
      ]);
      setCurrentRisk(riskRes);
      setHistory(historyRes);
    } catch {
      setError('Unable to fetch cardiovascular assessment data. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssessmentSubmit = async (payload: RiskAssessmentRequest) => {
    try {
      setIsSubmitting(true);
      const newRisk = await cardioApi.assessRisk(payload);
      setCurrentRisk(newRisk);
      setIsModalOpen(false);
      // Refresh history audit log
      const updatedHistory = await cardioApi.getRiskHistory('', 20);
      setHistory(updatedHistory);
    } catch {
      alert(
        'Failed to evaluate cardiovascular assessment. Please ensure AI hub is running on port 5001.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
          {error}
        </div>
      )}
      <CardiovascularAssessmentView
        currentRisk={currentRisk}
        history={history}
        isLoading={isLoading}
        isSubmitting={isSubmitting}
        isModalOpen={isModalOpen}
        onOpenModal={() => setIsModalOpen(true)}
        onCloseModal={() => setIsModalOpen(false)}
        onRefresh={() => void fetchData()}
        onSubmitAssessment={handleAssessmentSubmit}
      />
    </div>
  );
};
