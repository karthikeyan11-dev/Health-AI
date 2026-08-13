import {
  AuthenticationApi,
  CardiovascularRiskAssessmentApi,
  DevicesApi,
  DigitalTwinApi,
  EmotionAIChatbotApi,
  EmotionAIServiceApi,
  HealthReportsApi,
  HealthSystemOpsApi,
  NotificationsApi,
  RecommendationEngineApi,
  SensorsApi,
  StressAnalysisApi,
  UsersApi,
} from '@/sdk';
import { apiConfig } from './apiConfig';

export const authApi = new AuthenticationApi(apiConfig);
export const cardiovascularRiskApi = new CardiovascularRiskAssessmentApi(apiConfig);
export const devicesApi = new DevicesApi(apiConfig);
export const digitalTwinApi = new DigitalTwinApi(apiConfig);
export const chatbotApi = new EmotionAIChatbotApi(apiConfig);
export const emotionServiceApi = new EmotionAIServiceApi(apiConfig);
export const reportsApi = new HealthReportsApi(apiConfig);
export const healthSystemOpsApi = new HealthSystemOpsApi(apiConfig);
export const notificationsApi = new NotificationsApi(apiConfig);
export const recommendationsApi = new RecommendationEngineApi(apiConfig);
export const sensorsApi = new SensorsApi(apiConfig);
export const stressAnalysisApi = new StressAnalysisApi(apiConfig);
export const usersApi = new UsersApi(apiConfig);

export * from './apiConfig';
