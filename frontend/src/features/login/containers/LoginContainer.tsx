import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginView } from '../components/LoginView';
import { INITIAL_LOGIN_VALUES } from '../constants/login.constants';
import { validateLoginForm } from '../utils/login.utils';
import { loginApi } from '../api/login.api';
import type { LoginFormValues, LoginFormErrors } from '../types/login.types';
import { storage } from '@/lib/storage';
import { extractErrorMessage } from '@/utils/error.util';

export const LoginContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { verified?: boolean; message?: string } | null;

  const [values, setValues] = useState<LoginFormValues>(INITIAL_LOGIN_VALUES);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const verifiedMessage = state?.verified
    ? state.message || 'User created successfully. Please log in.'
    : null;

  const handleChange = (field: keyof LoginFormValues, value: string) => {
    setValues((prev: LoginFormValues) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: LoginFormErrors) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { isValid, errors: validationErrors } = validateLoginForm(values);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const normalizedEmail = values.email.trim().toLowerCase();

      const response = await loginApi.loginUser({
        email: normalizedEmail,
        password: values.password,
      });

      if (response.accessToken) {
        storage.setToken(response.accessToken);
      }
      if (response.refreshToken) {
        storage.setRefreshToken(response.refreshToken);
      }

      navigate('/');
    } catch (err: unknown) {
      const friendlyMessage = extractErrorMessage(
        err,
        'Login failed. Please check your credentials and try again.',
      );
      setErrors({ general: friendlyMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginView
      values={values}
      errors={errors}
      isSubmitting={isSubmitting}
      verifiedMessage={verifiedMessage}
      onChange={handleChange}
      onSubmit={handleSubmit}
      onNavigateRegister={() => navigate('/register')}
    />
  );
};
