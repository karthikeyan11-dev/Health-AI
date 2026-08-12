import React from 'react';
import { HeartPulse } from 'lucide-react';

export const RegisterHeader: React.FC = () => {
  return (
    <div className="flex flex-col items-center text-center space-y-2 mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-subtle border border-primary/20 text-primary shadow-sm mb-1">
        <HeartPulse className="w-7 h-7 text-primary" />
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
        Create Your <span className="text-gradient-primary">Health AI</span> Account
      </h1>
      <p className="text-sm text-muted-foreground max-w-sm">
        Join our intelligent healthcare platform to monitor, manage, and optimize your health
        profile.
      </p>
    </div>
  );
};
