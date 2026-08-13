import React from 'react';
import {
  AuthDecorativeElements,
  type AuthDecorationVariant,
} from '@/components/auth-decorative-elements';

export type AuthLayoutProps = {
  children: React.ReactNode;
  decorationVariant?: AuthDecorationVariant;
};

/**
 * Shared AuthLayout for the authentication screens.
 */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, decorationVariant }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background p-4 sm:p-6 lg:p-8">
      {decorationVariant ? <AuthDecorativeElements variant={decorationVariant} /> : null}

      {/* Extremely subtle overlay to maintain crisp background visibility */}
      <div className="pointer-events-none absolute inset-0 bg-white/45 backdrop-blur-[1px]" />

      {/* Centered Content Container with smooth fade-in page transition */}
      <div className="relative z-10 my-6 flex w-full animate-fade-in items-center justify-center sm:my-8">
        {children}
      </div>
    </div>
  );
};
