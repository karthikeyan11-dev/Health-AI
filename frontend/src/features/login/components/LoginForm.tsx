import React from 'react';
import { Button, Input, Label } from '@/components/ui';
import { LOGIN_TEXTS } from '../constants/login.constants';
import type { LoginFormProps } from '../types/login.types';
import { Loader2, LogIn, CheckCircle2 } from 'lucide-react';

export const LoginForm: React.FC<LoginFormProps> = ({
  values,
  errors,
  isSubmitting,
  verifiedMessage,
  onChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Verified Account Success Alert */}
      {verifiedMessage && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{verifiedMessage}</span>
        </div>
      )}

      {/* General Error Alert */}
      {errors.general && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium">
          {errors.general}
        </div>
      )}

      {/* Email Address Field */}
      <div className="space-y-1.5">
        <Label htmlFor="loginEmail" required>
          {LOGIN_TEXTS.labels.email}
        </Label>
        <Input
          id="loginEmail"
          name="email"
          type="email"
          placeholder={LOGIN_TEXTS.placeholders.email}
          value={values.email}
          onChange={(e) => onChange('email', e.target.value)}
          disabled={isSubmitting}
          error={!!errors.email}
        />
        {errors.email && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <Label htmlFor="loginPassword" required>
          {LOGIN_TEXTS.labels.password}
        </Label>
        <Input
          id="loginPassword"
          name="password"
          type="password"
          placeholder={LOGIN_TEXTS.placeholders.password}
          value={values.password}
          onChange={(e) => onChange('password', e.target.value)}
          disabled={isSubmitting}
          error={!!errors.password}
        />
        {errors.password && (
          <p className="text-xs text-destructive font-medium mt-1">{errors.password}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full mt-6 bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary font-semibold text-white"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            {LOGIN_TEXTS.submitLoadingText}
          </>
        ) : (
          <>
            {LOGIN_TEXTS.submitButtonText}
            <LogIn className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Terms & Privacy Footer Notice matching reference UI model */}
      <p className="text-center text-[11px] text-muted-foreground pt-3 leading-relaxed">
        By continuing, you agree to our{' '}
        <span className="font-semibold text-foreground underline hover:text-primary cursor-pointer">
          Terms of Service
        </span>{' '}
        and{' '}
        <span className="font-semibold text-foreground underline hover:text-primary cursor-pointer">
          Privacy Policy
        </span>
        .
      </p>
    </form>
  );
};
