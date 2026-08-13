import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { RegisterHeader } from '../components/RegisterHeader';
import { RegisterForm } from '../components/RegisterForm';
import { INITIAL_REGISTER_VALUES } from '../constants/register.constants';
import { validateRegisterForm } from '../utils/register.utils';
import { registerApi } from '../api/register.api';
import type { RegisterFormValues, RegisterFormErrors } from '../types/register.types';
import { HeartPulse, LogIn, Activity } from 'lucide-react';

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
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
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
            Join Active Users Tracking Real-time Health Data.
          </h2>
          <p className="text-sm text-white/85 leading-relaxed font-medium">
            Create your Health AI account today and start tracking vital metrics with advanced
            sensor AI.
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
              <p className="text-xs font-semibold text-white/90">Already have an account?</p>
              <p className="text-[11px] text-white/70">Login to access your dashboard</p>
            </div>
            <Button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-white text-primary hover:bg-white/90 font-bold shadow-md border-0 px-5 text-sm"
            >
              <span>Login</span>
              <LogIn className="w-4 h-4 shrink-0" />
            </Button>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Crisp White Form Panel (matching reference UI model) */}
      <div className="bg-white/95 p-8 sm:p-10 flex flex-col justify-center">
        <RegisterHeader />
        <RegisterForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};
