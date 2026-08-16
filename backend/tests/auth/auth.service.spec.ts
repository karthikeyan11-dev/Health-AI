import bcrypt from 'bcryptjs';
import { AuthService } from '../../src/modules/auth/auth.service';
import type { AuthRepository } from '../../src/modules/auth/auth.repository';
import type { OtpService } from '../../src/shared/services/otp/otp.service';
import type { EmailService } from '../../src/shared/services/email/email.service';
import {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
} from '../../src/shared/errors/httpErrors';
import { UserRole, type IUserDocument } from '../../src/models/user.model';
import { AuthConstants } from '../../src/shared/constants/auth.constants';

describe('AuthService Unit Tests', () => {
  let authService: AuthService;
  let mockRepo: jest.Mocked<AuthRepository>;
  let mockOtpSvc: jest.Mocked<OtpService>;
  let mockEmailSvc: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      existsByEmail: jest.fn(),
      createUser: jest.fn(),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<AuthRepository>;

    mockOtpSvc = {
      generateOtp: jest.fn().mockReturnValue('123456'),
      storePendingRegistration: jest.fn().mockResolvedValue(undefined),
      getPendingRegistration: jest.fn(),
      verifyRegistrationOtp: jest.fn(),
      deletePendingRegistration: jest.fn().mockResolvedValue(true),
    } as unknown as jest.Mocked<OtpService>;

    mockEmailSvc = {
      sendVerificationOtp: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailService>;

    authService = new AuthService(mockRepo, mockOtpSvc, mockEmailSvc);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw ConflictError if user email already exists', async () => {
      mockRepo.existsByEmail.mockResolvedValue(true);

      await expect(
        authService.register({
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockRepo.existsByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockOtpSvc.storePendingRegistration).not.toHaveBeenCalled();
    });

    it('should register successfully with default PATIENT role', async () => {
      mockRepo.existsByEmail.mockResolvedValue(false);
      const hashSpy = jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw' as never);

      const result = await authService.register({
        email: ' Test@Example.com ',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE',
      });

      expect(result).toEqual({
        email: 'test@example.com',
        expiresInSeconds: AuthConstants.OTP_EXPIRY_SECONDS,
      });

      expect(hashSpy).toHaveBeenCalledWith('password123', 10);
      expect(mockOtpSvc.generateOtp).toHaveBeenCalled();
      expect(mockOtpSvc.storePendingRegistration).toHaveBeenCalledWith(
        'test@example.com',
        {
          email: 'test@example.com',
          passwordHash: 'hashed_pw',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: undefined,
          age: 34,
          gender: 'MALE',
          role: UserRole.PATIENT,
        },
        '123456',
      );
      expect(mockEmailSvc.sendVerificationOtp).toHaveBeenCalledWith(
        'test@example.com',
        '123456',
        'John',
      );
    });

    it('should register successfully with custom SYSTEM role and phoneNumber', async () => {
      mockRepo.existsByEmail.mockResolvedValue(false);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_pw' as never);

      const result = await authService.register({
        email: 'system@example.com',
        password: 'password123',
        firstName: 'System',
        lastName: 'Service',
        phoneNumber: '+1234567890',
        age: 40,
        gender: 'FEMALE',
        role: 'SYSTEM',
      });

      expect(result.email).toBe('system@example.com');
      expect(mockOtpSvc.storePendingRegistration).toHaveBeenCalledWith(
        'system@example.com',
        {
          email: 'system@example.com',
          passwordHash: 'hashed_pw',
          firstName: 'System',
          lastName: 'Service',
          phoneNumber: '+1234567890',
          age: 40,
          gender: 'FEMALE',
          role: UserRole.SYSTEM,
        },
        '123456',
      );
    });

    it('should rethrow error when repository fails during register', async () => {
      mockRepo.existsByEmail.mockRejectedValue(new Error('Repository exists error'));

      await expect(
        authService.register({
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
        }),
      ).rejects.toThrow('Repository exists error');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and create permanent user in MongoDB with dates', async () => {
      const pendingData = {
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        age: 34,
        gender: 'MALE' as const,
        role: UserRole.PATIENT,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      const createdUser = {
        id: 'user_123',
        ...pendingData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(pendingData);
      mockRepo.existsByEmail.mockResolvedValue(false);
      mockRepo.createUser.mockResolvedValue(createdUser as unknown as IUserDocument);

      await authService.verifyOtp({
        email: ' User@Example.com ',
        otp: '123456',
      });

      expect(mockOtpSvc.verifyRegistrationOtp).toHaveBeenCalledWith('user@example.com', '123456');
      expect(mockRepo.createUser).toHaveBeenCalledWith({
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        age: 34,
        gender: 'MALE',
        role: UserRole.PATIENT,
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: true,
      });
      expect(mockOtpSvc.deletePendingRegistration).toHaveBeenCalledWith('user@example.com');
      expect(mockEmailSvc.sendWelcomeEmail).toHaveBeenCalledWith('user@example.com', 'John');
    });

    it('should verify OTP and create SYSTEM user', async () => {
      const pendingSystem = {
        email: 'system@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'Sys',
        lastName: 'Admin',
        age: 40,
        gender: 'MALE' as const,
        role: UserRole.SYSTEM,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      const createdSystem = {
        id: 'sys_123',
        ...pendingSystem,
        role: UserRole.SYSTEM,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(pendingSystem);
      mockRepo.existsByEmail.mockResolvedValue(false);
      mockRepo.createUser.mockResolvedValue(createdSystem as unknown as IUserDocument);

      await expect(
        authService.verifyOtp({
          email: 'system@example.com',
          otp: '123456',
        }),
      ).resolves.not.toThrow();
    });

    it('should verify OTP and create permanent user when dates are undefined', async () => {
      const pendingData = {
        email: 'user2@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'Bob',
        lastName: 'Jones',
        age: 30,
        gender: 'MALE' as const,
        role: UserRole.PATIENT,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      const createdUser = {
        id: 'user_456',
        ...pendingData,
        isActive: true,
        createdAt: undefined,
        updatedAt: undefined,
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(pendingData);
      mockRepo.existsByEmail.mockResolvedValue(false);
      mockRepo.createUser.mockResolvedValue(createdUser as unknown as IUserDocument);

      await expect(
        authService.verifyOtp({
          email: 'user2@example.com',
          otp: '123456',
        }),
      ).resolves.not.toThrow();
    });

    it('should throw BadRequestError if pending registration record is incomplete or corrupted', async () => {
      const incompleteData = {
        email: 'user@example.com',
        passwordHash: '',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE' as const,
        role: UserRole.PATIENT,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(incompleteData);

      await expect(
        authService.verifyOtp({
          email: 'user@example.com',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if verification email mismatches pending registration email', async () => {
      const mismatchedData = {
        email: 'other@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE' as const,
        role: UserRole.PATIENT,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(mismatchedData);

      await expect(
        authService.verifyOtp({
          email: 'user@example.com',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError if user was created between registration and OTP verification', async () => {
      const pendingData = {
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
        firstName: 'John',
        lastName: 'Doe',
        age: 34,
        gender: 'MALE' as const,
        role: UserRole.PATIENT,
        hashedOtp: 'hashed_otp',
        remainingTries: 5,
        createdAt: new Date().toISOString(),
      };

      mockOtpSvc.verifyRegistrationOtp.mockResolvedValue(pendingData);
      mockRepo.existsByEmail.mockResolvedValue(true);

      await expect(
        authService.verifyOtp({
          email: 'user@example.com',
          otp: '123456',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockOtpSvc.deletePendingRegistration).toHaveBeenCalledWith('user@example.com');
      expect(mockRepo.createUser).not.toHaveBeenCalled();
    });

    it('should rethrow error when OTP service fails during verifyOtp', async () => {
      mockOtpSvc.verifyRegistrationOtp.mockRejectedValue(new Error('Redis exception'));

      await expect(
        authService.verifyOtp({
          email: 'user@example.com',
          otp: '123456',
        }),
      ).rejects.toThrow('Redis exception');
    });
  });

  describe('login', () => {
    it('should authenticate user successfully and return tokens', async () => {
      const user = {
        id: 'user_123',
        email: 'user@example.com',
        passwordHash: 'hashed_password',
        role: UserRole.PATIENT,
        isActive: true,
      };

      mockRepo.findByEmailWithPassword.mockResolvedValue(user as unknown as IUserDocument);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.login({
        email: ' User@Example.com ',
        password: 'P@ssw0rd123!',
      });

      expect(mockRepo.findByEmailWithPassword).toHaveBeenCalledWith('user@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('P@ssw0rd123!', 'hashed_password');
      expect(mockRepo.updateLastLogin).toHaveBeenCalledWith('user_123');
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.tokenType).toBe('Bearer');
      expect(result.expiresIn).toBe(3600);
    });

    it('should throw UnauthorizedError if user is not found', async () => {
      mockRepo.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'P@ssw0rd123!',
        }),
      ).rejects.toThrow(UnauthorizedError);

      expect(mockRepo.findByEmailWithPassword).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should throw UnauthorizedError if account is inactive', async () => {
      const user = {
        id: 'user_123',
        email: 'disabled@example.com',
        passwordHash: 'hashed_password',
        role: UserRole.PATIENT,
        isActive: false,
      };

      mockRepo.findByEmailWithPassword.mockResolvedValue(user as unknown as IUserDocument);

      await expect(
        authService.login({
          email: 'disabled@example.com',
          password: 'P@ssw0rd123!',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError if password comparison fails', async () => {
      const user = {
        id: 'user_123',
        email: 'user@example.com',
        passwordHash: 'hashed_password',
        role: UserRole.PATIENT,
        isActive: true,
      };

      mockRepo.findByEmailWithPassword.mockResolvedValue(user as unknown as IUserDocument);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'WrongPassword!',
        }),
      ).rejects.toThrow(UnauthorizedError);

      expect(mockRepo.updateLastLogin).not.toHaveBeenCalled();
    });

    it('should rethrow error when repository fails during login', async () => {
      mockRepo.findByEmailWithPassword.mockRejectedValue(new Error('DB failure'));

      await expect(
        authService.login({
          email: 'user@example.com',
          password: 'P@ssw0rd123!',
        }),
      ).rejects.toThrow('DB failure');
    });
  });
});
