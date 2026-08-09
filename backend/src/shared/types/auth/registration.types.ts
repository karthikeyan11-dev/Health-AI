/**
 * Pending registration record stored temporarily in Redis until OTP verification succeeds.
 */
export interface PendingRegistrationData {
  email: string;
  passwordHash: string;
  name: string;
  role: 'PATIENT' | 'CLINICIAN' | 'ADMINISTRATOR';
  otp: string;
  attempts: number;
  createdAt: string;
}

export interface StoredOtpRecord {
  otp: string;
  email: string;
  attempts: number;
  createdAt: string;
}
