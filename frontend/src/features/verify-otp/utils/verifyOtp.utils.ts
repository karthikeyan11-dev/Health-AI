import { OTP_LENGTH } from '../constants/verifyOtp.constants';

export function validateOtp(otp: string): { isValid: boolean; error?: string } {
  const trimmed = otp.trim();
  if (!trimmed) {
    return { isValid: false, error: 'OTP is required' };
  }
  if (!/^\d+$/.test(trimmed)) {
    return { isValid: false, error: 'OTP must contain only numbers' };
  }
  if (trimmed.length !== OTP_LENGTH) {
    return { isValid: false, error: `OTP must be exactly ${OTP_LENGTH} digits` };
  }
  return { isValid: true };
}
