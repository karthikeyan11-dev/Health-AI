import type { LoginFormValues, LoginFormErrors } from '../types/login.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates login form inputs and returns field errors.
 */
export function validateLoginForm(values: LoginFormValues): {
  isValid: boolean;
  errors: LoginFormErrors;
} {
  const errors: LoginFormErrors = {};

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Invalid email address format';
  }

  if (!values.password) {
    errors.password = 'Password is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
