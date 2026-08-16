import { z } from 'zod';
import type { RegisterRequest, VerifyOtpRequest, LoginRequest } from '@modules/auth/auth.dto';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
  age: z
    .number({ message: 'Age is required' })
    .min(1, 'Age must be at least 1')
    .max(120, 'Age cannot exceed 120'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'], {
    message: 'Gender is required',
  }),
  role: z.enum(['PATIENT', 'SYSTEM']).optional(),
});

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address format'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
export type VerifyOtpSchemaType = z.infer<typeof verifyOtpSchema>;
export type LoginSchemaType = z.infer<typeof loginSchema>;

/**
 * Validates registration request payload against registerSchema.
 */
export function validateRegisterRequest(
  payload: RegisterRequest | Record<string, string | number | boolean | null | undefined>,
): ReturnType<typeof registerSchema.safeParse> {
  return registerSchema.safeParse(payload);
}

/**
 * Validates verify OTP request payload against verifyOtpSchema.
 */
export function validateVerifyOtpRequest(
  payload: VerifyOtpRequest | Record<string, string | number | boolean | null | undefined>,
): ReturnType<typeof verifyOtpSchema.safeParse> {
  return verifyOtpSchema.safeParse(payload);
}

/**
 * Validates login request payload against loginSchema.
 */
export function validateLoginRequest(
  payload: LoginRequest | Record<string, string | number | boolean | null | undefined>,
): ReturnType<typeof loginSchema.safeParse> {
  return loginSchema.safeParse(payload);
}
