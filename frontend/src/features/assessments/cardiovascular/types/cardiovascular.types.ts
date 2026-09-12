import type { RiskAssessmentResponse } from '@/sdk';

export type CardioRiskData = RiskAssessmentResponse['data'] & {
  mapScore?: number;
  ratePressureProduct?: number;
  pulsePressure?: number;
  autonomicStressScore?: number;
  actionId?: number;
  isActionSafe?: boolean;
  heartRate?: number;
  systolicBp?: number;
  diastolicBp?: number;
};

export interface CardioHistoryItem {
  id?: string;
  userId: string;
  riskScore: number;
  riskLevel: 'OPTIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  contributingFactors?: string[];
  topDrivers?: Array<{
    feature: string;
    value: number;
    impact: number;
  }>;
  probabilities?: Record<string, number>;
  confidence?: number;
  explanation?: string;
  recommendations?: string[];
  recommendedIntervention?: string;
  actionId?: number;
  isActionSafe?: boolean;
  mapScore?: number;
  ratePressureProduct?: number;
  pulsePressure?: number;
  autonomicStressScore?: number;
  guidance?: {
    status: string;
    provider: string;
    message: string;
  };
  timestamp: string;
}

export interface CardioFormValues {
  age: number;
  sex: number; // 1 = Male, 0 = Female
  bmi: number;
  smokingStatus: number; // 0 = No, 1 = Yes
  familyHistoryCvd: number; // 0 = No, 1 = Yes
  avgHeartRate: number;
  restingHr: number;
  spo2: number;
  bodyTempC: number;
  bpSystolic: number;
  bpDiastolic: number;
  hrv: number;
  steps: number;
  caloriesBurned: number;
  distanceKm: number;
  sleepHours: number;
  sleepEfficiency: number;
  caloriesConsumed: number;
  waterIntakeL: number;
  activityType: string;
  stressScore: number;
  digitalTwinHealthScore: number;
}
