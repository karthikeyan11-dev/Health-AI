import { authApi } from '@/api';
import type { LoginRequest, AuthTokensResponse } from '@/sdk';

/**
 * Pure API communication methods for the Login feature.
 * Thin wrappers around generated SDK methods grouped within a single API object.
 */
export const loginApi = {
  /**
   * Executes login user API call via OpenAPI generated SDK.
   */
  async loginUser(payload: LoginRequest): Promise<AuthTokensResponse> {
    const response = await authApi.loginUser(payload);
    return response.data;
  },
};
