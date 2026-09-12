import React, { useEffect, useState, useCallback } from 'react';
import { stressApi } from '../api/stress.api';
import type { StressData, StressHistoryItem } from '../types/stress.types';
import type { StressAssessmentRequest } from '@/sdk';
import { StressAssessmentView } from '../views/StressAssessmentView';

export const StressAssessmentContainer: React.FC = () => {
  const [currentStress, setCurrentStress] = useState<StressData | null>(null);
  const [history, setHistory] = useState<StressHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [stressRes, historyRes] = await Promise.all([
        stressApi.getCurrentStress(''),
        stressApi.getStressHistory('', 20),
      ]);
      setCurrentStress(stressRes);
      setHistory(historyRes);
    } catch {
      setError('Unable to fetch stress assessment data. Please check backend connection.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleAssessmentSubmit = async (payload: StressAssessmentRequest) => {
    try {
      setIsSubmitting(true);
      const newStress = await stressApi.assessStress(payload);
      setCurrentStress(newStress);
      setIsModalOpen(false);
      // Refresh history
      const updatedHistory = await stressApi.getStressHistory('', 20);
      setHistory(updatedHistory);
    } catch {
      alert('Failed to evaluate stress assessment. Please ensure AI hub is running on port 5001.');
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
      <StressAssessmentView
        currentStress={currentStress}
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
