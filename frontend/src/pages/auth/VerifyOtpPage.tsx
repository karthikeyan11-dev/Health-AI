import React from 'react';
import { VerifyOtpContainer } from '@/features/verify-otp';
import { Card, CardContent } from '@/components/ui';
import { AuthLayout } from '@/app/layouts';

export const VerifyOtpPage: React.FC = () => {
  return (
    <AuthLayout decorationVariant="verify-otp">
      <Card className="w-full max-w-md rounded-3xl auth-gradient-border-card">
        <CardContent className="p-6 sm:p-8">
          <VerifyOtpContainer />
        </CardContent>
      </Card>
    </AuthLayout>
  );
};
