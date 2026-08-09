export const EmailConstants = {
  SUBJECTS: {
    OTP_VERIFICATION: 'Health AI - Verify Your Account with One-Time Password',
    WELCOME: 'Welcome to Health AI - Intelligent Healthcare Platform',
    PASSWORD_RESET: 'Health AI - Password Reset Request',
  },
  MESSAGES: {
    OTP_EXPIRY_NOTICE: (minutes: number): string =>
      `This verification code is valid for ${minutes} minutes.`,
    SECURITY_DISCLAIMER:
      'If you did not request this email, please ignore it or contact our support team.',
  },
} as const;
