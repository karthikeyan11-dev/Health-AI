import React from 'react';
import { LoginContainer } from '@/features/login';
import { Card } from '@/components/ui';
import { AuthLayout } from '@/app/layouts';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout>
      <Card className="w-full max-w-4xl bg-white/95 backdrop-blur-xl border border-white/80 shadow-2xl animated-glow-border rounded-3xl overflow-hidden p-0">
        <LoginContainer />
      </Card>
    </AuthLayout>
  );
};
