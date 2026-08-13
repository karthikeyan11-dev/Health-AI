import type React from 'react';

export type OtpFormValues = {
  email: string;
  otp: string;
};

export type OtpFormErrors = {
  otp?: string;
  general?: string;
};

export type VerifyOtpState = {
  values: OtpFormValues;
  errors: OtpFormErrors;
  isSubmitting: boolean;
};

export type OtpFormProps = {
  email: string;
  otp: string;
  errors: OtpFormErrors;
  isSubmitting: boolean;
  onOtpChange: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};
