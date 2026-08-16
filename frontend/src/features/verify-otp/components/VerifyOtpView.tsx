import React from 'react';
import { OtpHeroPanel } from './OtpHeroPanel';
import { OtpForm } from './OtpForm';
import type { OtpFormErrors } from '../types/verifyOtp.types';

export interface VerifyOtpViewProps {
  email: string;
  otp: string;
  errors: OtpFormErrors;
  isSubmitting: boolean;
  onOtpChange: (otp: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onBack: () => void;
  onNavigateRegister: () => void;
}

export const VerifyOtpView: React.FC<VerifyOtpViewProps> = ({
  email,
  otp,
  errors,
  isSubmitting,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
  onNavigateRegister,
}) => {
  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-2 min-h-[540px]">
      {/* LEFT COLUMN: Dark Green Gradient Hero Panel */}
      <OtpHeroPanel onNavigateRegister={onNavigateRegister} />

      {/* RIGHT COLUMN: White Form Panel */}
      <div className="bg-white/95 p-8 sm:p-12 lg:p-14 flex flex-col justify-between">
        <OtpForm
          email={email}
          otp={otp}
          errors={errors}
          isSubmitting={isSubmitting}
          onOtpChange={onOtpChange}
          onSubmit={onSubmit}
          onResend={onResend}
          onBack={onBack}
        />
      </div>
    </div>
  );
};
