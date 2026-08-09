export const AuthConstants = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_SECONDS: 300, // 5 minutes
  MAX_OTP_ATTEMPTS: 5,
  REDIS_KEY_PREFIX: 'auth:registration:',
} as const;
