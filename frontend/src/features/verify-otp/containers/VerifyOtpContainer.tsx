import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { VerifyOtpView } from '../components/VerifyOtpView';
import { validateOtp } from '../utils/verifyOtp.utils';
import { verifyOtpApi } from '../api/verifyOtp.api';
import type { OtpFormErrors } from '../types/verifyOtp.types';
import { extractErrorMessage } from '@/utils/error.util';

export const VerifyOtpContainer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Extract email from query parameter or navigation state
  const emailFromQuery = searchParams.get('email') || '';
  const emailFromState = (location.state as { email?: string } | null)?.email || '';
  const email = emailFromQuery || emailFromState;

  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<OtpFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtpChange = (value: string) => {
    // Only allow digits up to 6 characters
    const cleaned = value.replace(/\D/g, '').slice(0, 6);
    setOtp(cleaned);
    if (errors.otp || errors.general) {
      setErrors({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setErrors({ general: 'Missing registration email. Please register again.' });
      return;
    }

    const { isValid, error: validationError } = validateOtp(otp);
    if (!isValid) {
      setErrors({ otp: validationError });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await verifyOtpApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // On successful OTP verification, navigate to login
      navigate('/login', {
        state: { verified: true, message: 'User created successfully. Please log in.' },
      });
    } catch (err: unknown) {
      const friendlyMessage = extractErrorMessage(
        err,
        'OTP verification failed. Please check the code and try again.',
      );
      if (friendlyMessage.toLowerCase().includes('invalid')) {
        setErrors({ otp: 'The verification code entered is invalid or expired.' });
      } else {
        setErrors({ general: friendlyMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    // Trigger resend endpoint if available
  };

  return (
    <VerifyOtpView
      email={email}
      otp={otp}
      errors={errors}
      isSubmitting={isSubmitting}
      onOtpChange={handleOtpChange}
      onSubmit={handleSubmit}
      onResend={handleResend}
      onBack={() => navigate('/register')}
      onNavigateRegister={() => navigate('/register')}
    />
  );
};
