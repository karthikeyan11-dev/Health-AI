import React, { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { OtpHeader } from '../components/OtpHeader';
import { OtpForm } from '../components/OtpForm';
import { validateOtp } from '../utils/verifyOtp.utils';
import { executeVerifyOtp } from '../api/verifyOtp.api';
import type { OtpFormErrors } from '../types/verifyOtp.types';

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
      await executeVerifyOtp({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      // On successful OTP verification, navigate to login
      navigate('/login', {
        state: { verified: true, message: 'User created successfully. Please log in.' },
      });
    } catch (err: unknown) {
      const errorObj = err as {
        response?: {
          data?: {
            error?: { message?: string };
            message?: string;
          };
        };
        message?: string;
      };

      const backendMessage =
        errorObj.response?.data?.error?.message ||
        errorObj.response?.data?.message ||
        errorObj.message ||
        'OTP verification failed. Please try again.';

      // Specific error mapping based on backend error message contract
      if (
        backendMessage.toLowerCase().includes('otp is invalid') ||
        backendMessage.toLowerCase().includes('invalid otp')
      ) {
        setErrors({ otp: 'OTP is Invalid' });
      } else if (
        backendMessage.toLowerCase().includes('tried so many times') ||
        backendMessage.toLowerCase().includes('expired') ||
        backendMessage.toLowerCase().includes('not found')
      ) {
        setErrors({ general: backendMessage });
      } else {
        setErrors({ general: backendMessage });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <OtpHeader email={email} />
      <OtpForm
        email={email}
        otp={otp}
        errors={errors}
        isSubmitting={isSubmitting}
        onOtpChange={handleOtpChange}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
