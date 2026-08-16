import type { RegisterFormValues } from '../types/register.types';

export const INITIAL_REGISTER_VALUES: RegisterFormValues = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  age: '',
  gender: 'MALE',
  role: 'PATIENT',
};

export const GENDER_OPTIONS: Array<{ label: string; value: RegisterFormValues['gender'] }> = [
  { label: 'Male', value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other', value: 'OTHER' },
  { label: 'Prefer not to say', value: 'PREFER_NOT_TO_SAY' },
];

export const ROLE_OPTIONS: Array<{ label: string; value: RegisterFormValues['role'] }> = [
  { label: 'Patient', value: 'PATIENT' },
];

export const REGISTER_TEXTS = {
  logo: 'Health AI',
  heroTitle: 'Join Active Users Tracking Real-time Health Data.',
  heroSubtitle:
    'Create your Health AI account today and start tracking vital metrics with advanced sensor AI.',
  badgeTitle: 'Join Active Users',
  badgeSubtitle: 'Real-time health monitoring & AI diagnostics',
  switchPrompt: 'Already have an account?',
  switchSubprompt: 'Login to access your dashboard',
  switchButtonText: 'Login',
  headerTitle: 'Create your Account',
  headerSubtitle: 'Start monitoring your vitals and receiving AI health insights',
  submitButtonText: 'Create Account',
  submitLoadingText: 'Creating Account...',
  alreadyAccountPrompt: 'Already have an account?',
  loginLinkText: 'Login',
  labels: {
    firstName: 'First Name',
    lastName: 'Last Name',
    email: 'Email Address',
    password: 'Password',
    phoneNumber: 'Phone Number (Optional)',
    age: 'Age',
    gender: 'Gender',
    role: 'Account Role',
  },
  placeholders: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: '••••••••',
    phoneNumber: '+1 (555) 000-0000',
    age: '28',
  },
} as const;
