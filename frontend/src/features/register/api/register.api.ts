import { authApi } from '@/api';
import type { RegisterRequest, RegisterResponse } from '@/sdk';

export async function executeRegisterUser(payload: RegisterRequest): Promise<RegisterResponse> {
  const response = await authApi.registerUser(payload);
  return response.data;
}
