import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Label } from '@/components/ui';
import type { OtpFormProps } from '../types/verifyOtp.types';
import { Loader2, CheckCircle2 } from 'lucide-react';

export const OtpForm: React.FC<OtpFormProps> = ({
  otp,
  errors,
  isSubmitting,
  onOtpChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* General Error Alert (e.g. Tried so many times...) */}
      {errors.general && (
        <div className="p-3.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium text-center">
          {errors.general}
        </div>
      )}

      {/* OTP Field */}
      <div className="space-y-2">
        <Label htmlFor="otp" required className="justify-center text-center font-semibold">
          Verification Code
        </Label>
        <Input
          id="otp"
          name="otp"
          type="text"
          maxLength={6}
          placeholder="••••••"
          value={otp}
          onChange={(e) => onOtpChange(e.target.value)}
          disabled={isSubmitting}
          error={!!errors.otp}
          className="text-center text-2xl tracking-[0.5em] font-mono h-12"
          autoFocus
        />
        {/* Field-level OTP error directly below OTP input */}
        {errors.otp && (
          <p className="text-xs text-destructive font-medium text-center mt-1.5">{errors.otp}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="default"
        size="lg"
        className="w-full mt-6 bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary font-semibold"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Verifying Code...
          </>
        ) : (
          <>
            Verify Account
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>

      {/* Back to register */}
      <div className="text-center pt-2">
        <p className="text-sm text-muted-foreground">
          Entered wrong email?{' '}
          <Link to="/register" className="font-semibold text-primary hover:underline">
            Register again
          </Link>
        </p>
      </div>
    </form>
  );
};
