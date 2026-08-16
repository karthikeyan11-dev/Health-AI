export const OTP_LENGTH = 6;
export const DEFAULT_RESEND_COUNTDOWN = 30;

export const VERIFY_OTP_TEXTS = {
  logo: 'Health AI',
  heroTitle: 'The Smart Platform for AI Health Insights.',
  heroSubtitle:
    'Access your digital twin, real-time sensor analytics, and personalized AI health guidance in one place.',
  badgeTitle: 'Join Active Users',
  badgeSubtitle: 'Real-time health monitoring & AI diagnostics',
  switchPrompt: 'Need to register again?',
  switchSubprompt: 'Go back to registration',
  switchButtonText: 'Register',
  backButtonText: 'Back',
  headerTitle: 'Verify OTP',
  headerSubtitlePrefix: 'Enter the 6-digit code sent to ',
  defaultEmailPlaceholder: 'your account email',
  alertTitle: 'Email Verification',
  alertDescription: "We've sent a 6-digit code to your email. Please enter it below to proceed.",
  submitButtonText: 'Verify OTP',
  submitLoadingText: 'Verifying Code...',
  resendButtonPrefix: 'Resend Code in ',
  resendButtonText: 'Resend Code',
  termsPrefix: 'By continuing, you agree to our ',
  termsLink: 'Terms of Service',
  andText: ' and ',
  privacyLink: 'Privacy Policy',
} as const;
