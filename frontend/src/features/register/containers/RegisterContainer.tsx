import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterHeader } from '../components/RegisterHeader';
import { RegisterForm } from '../components/RegisterForm';
import { INITIAL_REGISTER_VALUES } from '../constants/register.constants';
import { validateRegisterForm } from '../utils/register.utils';
import { executeRegisterUser } from '../api/register.api';
import type { RegisterFormValues, RegisterFormErrors } from '../types/register.types';

export const RegisterContainer: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_REGISTER_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setValues((prev: RegisterFormValues) => ({ ...prev, [field]: value }));
    // Clear field-specific error when user types
    if (errors[field]) {
      setErrors((prev: RegisterFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Perform client validation
    const { isValid, errors: validationErrors } = validateRegisterForm(values);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      await executeRegisterUser({
        email: normalizedEmail,
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim() || undefined,
        age: Number(values.age),
        gender: values.gender,
        role: values.role,
      });

      // Navigate to /verify-otp with email in query param and navigation state
      navigate(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}`, {
        state: { email: normalizedEmail },
      });
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          status?: number;
          data?: {
            error?: { message?: string };
            message?: string;
          };
        };
        message?: string;
      };

      const backendMessage =
        errorObj.response?.data?.error?.message ||
        errorObj.response?.data?.message ||
        errorObj.message ||
        'Registration failed. Please check your details and try again.';

      // Specific error mapping: if email exists, place directly under email field
      if (
        backendMessage.toLowerCase().includes('already exists') ||
        errorObj.response?.status === 409
      ) {
        setErrors({ email: 'User with email already exists' });
      } else {
        setErrors({ general: backendMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <RegisterHeader />
      <RegisterForm
        values={values}
        errors={errors}
        isSubmitting={isSubmitting}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
