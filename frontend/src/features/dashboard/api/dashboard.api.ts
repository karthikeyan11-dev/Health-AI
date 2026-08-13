import { healthSystemOpsApi } from '@/api';
import type { GatewayInfo } from '../types';
import { DEFAULT_GATEWAY_INFO } from '../constants';

/**
 * Pure API communication methods for the Dashboard feature.
 * Thin wrappers around generated SDK methods only.
 */
export const dashboardApi = {
  /**
   * Fetches backend gateway status metadata using the generated healthSystemOpsApi SDK instance.
   */
  async getGatewayStatus(): Promise<GatewayInfo> {
    try {
      const response = await healthSystemOpsApi.getHealthStatus();
      if (response.data?.success) {
        return {
          ...DEFAULT_GATEWAY_INFO,
          status: 'ONLINE',
          healthData: response.data,
        };
      }
      return DEFAULT_GATEWAY_INFO;
    } catch {
      // Defensive fallback for initial presentation if backend is not yet started
      return DEFAULT_GATEWAY_INFO;
    }
  },
};
