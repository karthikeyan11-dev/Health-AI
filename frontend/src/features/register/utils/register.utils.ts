import type { RegisterFormValues, RegisterFormErrors } from '../types/register.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateRegisterForm(values: RegisterFormValues): {
  isValid: boolean;
  errors: RegisterFormErrors;
} {
  const errors: RegisterFormErrors = {};

  // Email validation
  if (!values.email.trim()) {
    errors.email = 'Email address is required';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Invalid email address format';
  }

  // Password validation
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  }

  // First name validation
  if (!values.firstName.trim()) {
    errors.firstName = 'First name is required';
  }

  // Last name validation
  if (!values.lastName.trim()) {
    errors.lastName = 'Last name is required';
  }

  // Age validation (required)
  if (!values.age.trim()) {
    errors.age = 'Age is required';
  } else {
    const parsedAge = Number(values.age);
    if (isNaN(parsedAge) || !Number.isInteger(parsedAge)) {
      errors.age = 'Age must be a valid whole number';
    } else if (parsedAge < 1 || parsedAge > 120) {
      errors.age = 'Age must be between 1 and 120';
    }
  }

  // Gender validation (required)
  if (!values.gender) {
    errors.gender = 'Gender selection is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
