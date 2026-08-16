import React from 'react';
import { RegisterHeroPanel } from './RegisterHeroPanel';
import { RegisterHeader } from './RegisterHeader';
import { RegisterForm } from './RegisterForm';
import type { RegisterFormValues, RegisterFormErrors } from '../types/register.types';

export interface RegisterViewProps {
  values: RegisterFormValues;
  errors: RegisterFormErrors;
  isSubmitting: boolean;
  onChange: (field: keyof RegisterFormValues, value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onNavigateLogin,
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
      {/* LEFT COLUMN: Dark Green Gradient Hero Panel */}
      <RegisterHeroPanel onNavigateLogin={onNavigateLogin} />

      {/* RIGHT COLUMN: Crisp White Form Panel */}
      <div className="bg-white/95 p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
        <RegisterHeader />
        <RegisterForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          onChange={onChange}
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
