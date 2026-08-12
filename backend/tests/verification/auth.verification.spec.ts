import {
  validateRegisterRequest,
  validateVerifyOtpRequest,
  registerSchema,
  verifyOtpSchema,
} from '../../src/shared/verification/auth.verification';

describe('Auth Verification Unit Tests', () => {
  describe('validateRegisterRequest', () => {
    it('should pass validation for valid registration request', () => {
      const validPayload = {
        email: 'user@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE',
        role: 'PATIENT',
      };

      const result = validateRegisterRequest(validPayload);
      expect(result.success).toBe(true);
    });

    it('should fail validation for invalid email format', () => {
      const invalidPayload = {
        email: 'not-an-email',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE',
      };

      const result = validateRegisterRequest(invalidPayload);
      expect(result.success).toBe(false);
    });

    it('should fail validation when password is too short', () => {
      const shortPasswordPayload = {
        email: 'user@example.com',
        password: '123',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE',
      };

      const result = validateRegisterRequest(shortPasswordPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('validateVerifyOtpRequest', () => {
    it('should pass validation for valid 6-digit OTP request', () => {
      const validPayload = {
        email: 'user@example.com',
        otp: '123456',
      };

      const result = validateVerifyOtpRequest(validPayload);
      expect(result.success).toBe(true);
    });

    it('should fail validation when OTP is not 6 digits', () => {
      const invalidPayload = {
        email: 'user@example.com',
        otp: '123',
      };

      const result = validateVerifyOtpRequest(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe('schemas exports', () => {
    it('should export registerSchema and verifyOtpSchema', () => {
      expect(registerSchema).toBeDefined();
      expect(verifyOtpSchema).toBeDefined();
    });
  });
});
