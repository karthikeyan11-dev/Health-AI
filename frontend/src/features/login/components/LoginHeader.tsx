import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui';

export const LoginHeader: React.FC = () => {
  return (
    <CardHeader className="space-y-1.5 text-left p-0 mb-6">
      <CardTitle className="text-2xl font-extrabold text-foreground tracking-tight">
        Welcome Back
      </CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        Enter your credentials to continue
      </CardDescription>
    </CardHeader>
  );
};
