import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { LoginHeader } from '../components/LoginHeader';
import { LoginForm } from '../components/LoginForm';
import { INITIAL_LOGIN_VALUES } from '../constants/login.constants';
import { validateLoginForm } from '../utils/login.utils';
import { loginApi } from '../api/login.api';
import type { LoginFormValues, LoginFormErrors } from '../types/login.types';
import { storage } from '@/lib/storage';
import { HeartPulse, UserPlus, Activity } from 'lucide-react';

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
        storage.set('health_ai_refresh_token', response.refreshToken);
      }

      navigate('/');
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
        'Login failed. Please check your credentials and try again.';

      if (
        errorObj.response?.status === 401 ||
        backendMessage.toLowerCase().includes('invalid credentials')
      ) {
        setErrors({ general: 'Invalid email address or password.' });
      } else {
        setErrors({ general: backendMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
      {/* LEFT COLUMN: Blue-Purple Gradient Hero Panel (matching reference UI model) */}
      <div className="bg-gradient-primary text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow effect */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top: Logo Badge */}
        <div className="relative z-10">
          <div className="bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full inline-flex items-center gap-2 text-white font-bold text-sm w-fit shadow-sm">
            <HeartPulse className="w-5 h-5 text-white" />
            <span>Health AI</span>
          </div>
        </div>

        {/* Middle: Headline & Subtitle & Metric Badge */}
        <div className="relative z-10 my-8 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            The Smart Platform for AI Health Insights.
          </h2>
          <p className="text-sm text-white/85 leading-relaxed font-medium">
            Access your digital twin, real-time sensor analytics, and personalized AI health
            guidance in one place.
          </p>

          {/* Info pill card matching reference model */}
          <div className="bg-white/15 backdrop-blur-md border border-white/20 p-3.5 rounded-2xl flex items-center gap-3 text-white shadow-sm mt-6">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Join Active Users</p>
              <p className="text-xs text-white/80 leading-tight">
                Real-time health monitoring & AI diagnostics
              </p>
            </div>
          </div>
        </div>

        {/* Bottom: Switch Panel CTA */}
        <div className="relative z-10 space-y-3 pt-4 border-t border-white/15">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-white/90">New to platform?</p>
              <p className="text-[11px] text-white/70">Create an account to get started</p>
            </div>
            <Button
              type="button"
              onClick={() => navigate('/register')}
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-md border-0 px-5 text-sm"
            >
              <span>Register</span>
              <UserPlus className="w-4 h-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Crisp White Form Panel (matching reference UI model) */}
      <div className="bg-white/95 p-8 sm:p-10 flex flex-col justify-center">
        <LoginHeader />
        <LoginForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          verifiedMessage={verifiedMessage}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
