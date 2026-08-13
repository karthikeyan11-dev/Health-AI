import type { components } from '@shared/types';

export type RegisterRequest = components['schemas']['RegisterRequest'];
export type RegisterResponse = components['schemas']['RegisterResponse'];
export type VerifyOtpRequest = components['schemas']['VerifyOtpRequest'];
export type VerifyOtpResponse = components['schemas']['SuccessResponse'];
export type PendingRegistrationData = components['schemas']['PendingRegistrationData'];
export type StoredOtpRecord = components['schemas']['StoredOtpRecord'];
export type LoginRequest = components['schemas']['LoginRequest'];
export type AuthTokensResponse = components['schemas']['AuthTokensResponse'];
export type UserResponse = components['schemas']['UserResponse'];
export type User = components['schemas']['User'];
export type ErrorResponse = components['schemas']['ErrorResponse'];
