import type { LoginFormValues } from '../types/login.types';

export const INITIAL_LOGIN_VALUES: LoginFormValues = {
  email: '',
  password: '',
};

export const LOGIN_TEXTS = {
  logo: 'Health AI',
  heroTitle: 'The Smart Platform for AI Health Insights.',
  heroSubtitle:
    'Access your digital twin, real-time sensor analytics, and personalized AI health guidance in one place.',
  badgeTitle: 'Join Active Users',
  badgeSubtitle: 'Real-time health monitoring & AI diagnostics',
  switchPrompt: 'New to platform?',
  switchSubprompt: 'Create an account to get started',
  switchButtonText: 'Register',
  headerTitle: 'Welcome Back',
  headerSubtitle: 'Sign in to access your Health AI account',
  submitButtonText: 'Login',
  submitLoadingText: 'Signing In...',
  newToPlatformPrompt: 'New to platform?',
  registerLinkText: 'Register',
  labels: {
    email: 'Email Address',
    password: 'Password',
  },
  placeholders: {
    email: 'john.doe@example.com',
    password: '••••••••',
  },
} as const;
