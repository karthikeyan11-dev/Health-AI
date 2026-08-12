export interface RegisterFormValues {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: 'PATIENT';
}

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues | 'general', string>>;

export interface RegisterState {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  isSubmitting: boolean;
}
