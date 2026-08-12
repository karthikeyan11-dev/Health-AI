export interface OtpFormValues {
  email: string;
  otp: string;
}

export interface OtpFormErrors {
  otp?: string;
  general?: string;
}

export interface VerifyOtpState {
  values: OtpFormValues;
  errors: OtpFormErrors;
  isSubmitting: boolean;
}
