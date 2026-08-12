import React from 'react';
import { RegisterContainer } from '@/features/register';
import { Card, CardContent } from '@/components/ui';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/60 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background Subtle Gradient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Centered Glassmorphic Card */}
      <Card className="w-full max-w-xl bg-white/90 backdrop-blur-xl border border-white/80 shadow-card-hover relative z-10 my-8">
        <CardContent className="p-6 sm:p-10">
          <RegisterContainer />
        </CardContent>
      </Card>
    </div>
  );
};
