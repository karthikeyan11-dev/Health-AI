import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui';

export const RegisterHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1.5 text-left p-0 mb-6">
      <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
        Create Account
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        Fill in your details to get started
      </CardDescription>
    </CardHeader>
  );
};
