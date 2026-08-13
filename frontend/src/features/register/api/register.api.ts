import { authApi } from '@/api';
import type { RegisterRequest, RegisterResponse } from '@/sdk';

/**
 * Pure API communication methods for the Register feature.
 * Thin wrappers around generated SDK methods grouped within a single API object.
 */
export const registerApi = {
  /**
   * Registers a new user via OpenAPI generated SDK.
   */
  async registerUser(payload: RegisterRequest): Promise<RegisterResponse> {
    const response = await authApi.registerUser(payload);
    return response.data;
  },
};
