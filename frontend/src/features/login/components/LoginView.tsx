import React from 'react';
import { LoginHeroPanel } from './LoginHeroPanel';
import { LoginHeader } from './LoginHeader';
import { LoginForm } from './LoginForm';
import type { LoginFormValues, LoginFormErrors } from '../types/login.types';

export interface LoginViewProps {
  values: LoginFormValues;
  errors: LoginFormErrors;
  isSubmitting: boolean;
  verifiedMessage: string | null;
  onChange: (field: keyof LoginFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  values,
  errors,
  isSubmitting,
  verifiedMessage,
  onChange,
  onSubmit,
  onNavigateRegister,
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[520px]">
      {/* LEFT COLUMN: Dark Green Gradient Hero Panel */}
      <LoginHeroPanel onNavigateRegister={onNavigateRegister} />

      {/* RIGHT COLUMN: Crisp White Form Panel */}
      <div className="bg-white/95 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
        <LoginHeader />
        <LoginForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          verifiedMessage={verifiedMessage}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
