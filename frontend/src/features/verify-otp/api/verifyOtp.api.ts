import { authApi } from '@/api';
import type { VerifyOtpRequest, SuccessResponse } from '@/sdk';

export async function executeVerifyOtp(payload: VerifyOtpRequest): Promise<SuccessResponse> {
  const response = await authApi.verifyOtp(payload);
  return response.data;
}
