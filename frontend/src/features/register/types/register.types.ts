export type RegisterFormValues = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  age: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | 'PREFER_NOT_TO_SAY';
  role: 'PATIENT';
};

export type RegisterFormErrors = Partial<Record<keyof RegisterFormValues | 'general', string>>;

export type RegisterState = {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  isSubmitting: boolean;
};

export type RegisterFormProps = {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  isSubmitting: boolean;
  onChange: (field: keyof RegisterFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};
