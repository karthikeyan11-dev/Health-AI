import { authApi } from '@/api';
import type { VerifyOtpRequest, SuccessResponse } from '@/sdk';

/**
 * Pure API communication methods for the Verify OTP feature.
 * Thin wrappers around generated SDK methods grouped within a single API object.
 */
export const verifyOtpApi = {
  /**
   * Verifies submitted registration OTP code via OpenAPI generated SDK.
   */
  async verifyOtp(payload: VerifyOtpRequest): Promise<SuccessResponse> {
    const response = await authApi.verifyOtp(payload);
    return response.data;
  },
};
