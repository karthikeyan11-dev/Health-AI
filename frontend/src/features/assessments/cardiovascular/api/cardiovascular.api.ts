import { cardiovascularRiskApi } from '@/api';
import type { RiskAssessmentRequest } from '@/sdk';
import type { CardioRiskData, CardioHistoryItem } from '../types/cardiovascular.types';

export const cardioApi = {
  async getCurrentRisk(userId: string = ''): Promise<CardioRiskData> {
    const response = await cardiovascularRiskApi.getCurrentCardiovascularRisk(userId);
    return response.data.data;
  },

  async assessRisk(payload: RiskAssessmentRequest): Promise<CardioRiskData> {
    const response = await cardiovascularRiskApi.assessCardiovascularRisk(payload);
    return response.data.data;
  },

  async getRiskHistory(userId: string = '', limit: number = 20): Promise<CardioHistoryItem[]> {
    const response = await cardiovascularRiskApi.getCardiovascularRiskHistory(userId, limit);
    return (response.data.data as unknown as CardioHistoryItem[]) || [];
  },
};
