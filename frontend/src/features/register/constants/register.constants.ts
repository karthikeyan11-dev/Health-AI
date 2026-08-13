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
