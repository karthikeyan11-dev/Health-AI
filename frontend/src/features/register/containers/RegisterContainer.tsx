import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterView } from '../components/RegisterView';
import { INITIAL_REGISTER_VALUES } from '../constants/register.constants';
import { validateRegisterForm } from '../utils/register.utils';
import { registerApi } from '../api/register.api';
import type { RegisterFormValues, RegisterFormErrors } from '../types/register.types';
import { extractErrorMessage } from '@/utils/error.util';

export const RegisterContainer: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<RegisterFormValues>(INITIAL_REGISTER_VALUES);
  const [errors, setErrors] = useState<RegisterFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof RegisterFormValues, value: string) => {
    setValues((prev: RegisterFormValues) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: RegisterFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateRegisterForm(values);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      await registerApi.registerUser({
        email: normalizedEmail,
        password: values.password,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phoneNumber: values.phoneNumber.trim() || undefined,
        age: Number(values.age),
        gender: values.gender,
        role: values.role,
      });

      navigate(`/verify-otp?email=${encodeURIComponent(normalizedEmail)}`, {
        state: { email: normalizedEmail },
      });
    } catch (err: unknown) {
      const friendlyMessage = extractErrorMessage(
        err,
        'Registration failed. Please check your details and try again.',
      );
      if (friendlyMessage.toLowerCase().includes('already exists')) {
        setErrors({ email: 'An account with this email address already exists.' });
      } else {
        setErrors({ general: friendlyMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterView
      values={values}
      errors={errors}
      isSubmitting={isSubmitting}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onNavigateLogin={() => navigate('/login')}
    />
  );
};
