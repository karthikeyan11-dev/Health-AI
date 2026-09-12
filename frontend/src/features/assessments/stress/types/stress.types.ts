import type { StressAssessmentResponse, EmotionEnum } from '@/sdk';

export type StressData = StressAssessmentResponse['data'];

export interface StressHistoryItem {
  id?: string;
  userId: string;
  stressScore: number;
  stressLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  contributingFactors?: string[];
  confidence?: number;
  timestamp: string;
}

export interface StressFormValues {
  heartRate: number;
  spo2: number;
  temperature: number;
  currentEmotion: EmotionEnum;
}
