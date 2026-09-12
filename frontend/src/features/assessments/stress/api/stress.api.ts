import { stressAnalysisApi } from '@/api';
import type { StressAssessmentRequest } from '@/sdk';
import type { StressData, StressHistoryItem } from '../types/stress.types';

export const stressApi = {
  async getCurrentStress(userId: string = ''): Promise<StressData> {
    const response = await stressAnalysisApi.getCurrentStress(userId);
    return response.data.data;
  },

  async assessStress(payload: StressAssessmentRequest): Promise<StressData> {
    const response = await stressAnalysisApi.assessStress(payload);
    return response.data.data;
  },

  async getStressHistory(userId: string = '', limit: number = 20): Promise<StressHistoryItem[]> {
    const response = await stressAnalysisApi.getStressHistory(userId, limit);
    return (response.data.data as unknown as StressHistoryItem[]) || [];
  },
};
