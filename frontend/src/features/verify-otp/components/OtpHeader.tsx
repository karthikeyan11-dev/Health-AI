import React from 'react';
import { MailCheck } from 'lucide-react';

export interface OtpHeaderProps {
  email: string;
}

export const OtpHeader: React.FC<OtpHeaderProps> = ({ email }) => {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-subtle border border-primary/20 text-primary shadow-sm mb-1">
        <MailCheck className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        Verify Your <span className="text-gradient-primary">Email</span>
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        We have sent a 6-digit verification code to{' '}
        <span className="font-semibold text-foreground">{email || 'your email'}</span>.
      </p>
    </div>
  );
};
