import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui';
import type { OtpFormProps } from '../types/verifyOtp.types';
import { VERIFY_OTP_TEXTS, DEFAULT_RESEND_COUNTDOWN } from '../constants/verifyOtp.constants';
import { Loader2, CheckCircle2, ArrowLeft, Mail, RefreshCw } from 'lucide-react';

export const OtpForm: React.FC<OtpFormProps> = ({
  email,
  otp,
  errors,
  isSubmitting,
  onOtpChange,
  onSubmit,
  onResend,
  onBack,
}) => {
  // 6-digit individual box input state & refs
  const digits = Array.from({ length: 6 }, (_, i) => otp[i] || '');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for Resend Code
  const [secondsLeft, setSecondsLeft] = useState<number>(DEFAULT_RESEND_COUNTDOWN);
  const [canResend, setCanResend] = useState<boolean>(false);

  useEffect(() => {
    if (secondsLeft <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResendClick = () => {
    if (!canResend) return;
    setSecondsLeft(DEFAULT_RESEND_COUNTDOWN);
    setCanResend(false);
    if (onResend) {
      onResend();
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const lastChar = value.slice(-1);
    if (lastChar && !/^\d$/.test(lastChar)) return;

    const newDigits = [...digits];
    newDigits[index] = lastChar;
    const combined = newDigits.join('').slice(0, 6);
    onOtpChange(combined);

    // Auto-advance focus to next input
    if (lastChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      onOtpChange(pastedData);
      const nextIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const formattedTimer = `0:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

  return (
    <div className="w-full flex flex-col justify-between h-full">
      {/* Top Section: Back Button & Header */}
      <div>
        {/* Back Button */}
        {onBack && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-full px-3.5 py-1.5 text-xs font-medium border-border hover:bg-secondary/70 flex items-center gap-1.5 mb-6 shadow-2xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{VERIFY_OTP_TEXTS.backButtonText}</span>
          </Button>
        )}

        {/* Header Title & Subtitle */}
        <div className="space-y-1 text-left mb-5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {VERIFY_OTP_TEXTS.headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            {VERIFY_OTP_TEXTS.headerSubtitlePrefix}
            <span className="font-bold text-foreground">
              {email || VERIFY_OTP_TEXTS.defaultEmailPlaceholder}
            </span>
          </p>
        </div>

        {/* Email Verification Alert Box */}
        <div className="bg-muted/40 border border-border/70 rounded-2xl p-4 flex items-start gap-3.5 mb-6 text-left shadow-2xs">
          <div className="w-9 h-9 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
            <Mail className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-foreground">
              {VERIFY_OTP_TEXTS.alertTitle}
            </h4>
            <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
              {VERIFY_OTP_TEXTS.alertDescription}
            </p>
          </div>
        </div>

        {/* General Error Alert */}
        {errors.general && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold text-center mb-4">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {/* 6 Square Digit Input Boxes */}
          <div>
            <div className="grid grid-cols-6 gap-2 sm:gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digits[i] || ''}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  disabled={isSubmitting}
                  className={`w-full h-12 sm:h-14 text-center text-lg sm:text-xl font-bold rounded-xl border bg-white shadow-2xs focus:outline-none transition-all ${
                    errors.otp
                      ? 'border-destructive ring-2 ring-destructive/20 text-destructive'
                      : 'border-border/80 focus:border-primary focus:ring-2 focus:ring-primary/20 text-foreground'
                  }`}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Field-level OTP error */}
            {errors.otp && (
              <p className="text-xs text-destructive font-semibold text-center mt-2">
                {errors.otp}
              </p>
            )}
          </div>

          {/* Action Button: Verify OTP */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="w-full h-12 bg-gradient-primary hover:bg-gradient-primary-hover shadow-primary font-bold text-sm rounded-xl text-white"
            disabled={isSubmitting || otp.length < 6}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {VERIFY_OTP_TEXTS.submitLoadingText}
              </>
            ) : (
              <>
                {VERIFY_OTP_TEXTS.submitButtonText}
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          {/* Resend Code Option */}
          <div className="flex items-center justify-center pt-1">
            {canResend ? (
              <button
                type="button"
                onClick={handleResendClick}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{VERIFY_OTP_TEXTS.resendButtonText}</span>
              </button>
            ) : (
              <Button
                type="button"
                variant="secondary"
                size="default"
                disabled
                className="w-full h-11 bg-accent/60 text-accent-foreground font-semibold text-xs rounded-xl opacity-90 cursor-not-allowed"
              >
                {VERIFY_OTP_TEXTS.resendButtonPrefix}
                {formattedTimer}
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Bottom Footer Note */}
      <div className="pt-6 mt-6 border-t border-border/40 text-center">
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          {VERIFY_OTP_TEXTS.termsPrefix}
          <a href="#" className="font-semibold text-foreground hover:underline">
            {VERIFY_OTP_TEXTS.termsLink}
          </a>
          {VERIFY_OTP_TEXTS.andText}
          <a href="#" className="font-semibold text-foreground hover:underline">
            {VERIFY_OTP_TEXTS.privacyLink}
          </a>
          .
        </p>
      </div>
    </div>
  );
};
