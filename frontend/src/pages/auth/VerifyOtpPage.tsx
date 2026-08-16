import React from 'react';
import { VerifyOtpContainer } from '@/features/verify-otp';
import { Card } from '@/components/ui';
import { AuthLayout } from '@/app/layouts';

export const VerifyOtpPage: React.FC = () => {
  return (
    <AuthLayout>
      <Card className="w-full max-w-6xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl animated-glow-border rounded-3xl overflow-hidden p-0">
        <VerifyOtpContainer />
      </Card>
    </AuthLayout>
  );
};
