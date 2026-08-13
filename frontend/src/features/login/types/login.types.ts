import type React from 'react';

export type LoginFormValues = {
  email: string;
  password: string;
};

export type LoginFormErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export type LoginFormProps = {
  values: LoginFormValues;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  verifiedMessage?: string | null;
  onChange: (field: keyof LoginFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};
