import bcrypt from 'bcryptjs';
import { AuthService } from '../../../src/modules/auth/auth.service';
import type { AuthRepository } from '../../../src/modules/auth/auth.repository';
import type { OtpService } from '../../../src/shared/services/otp/otp.service';
import type { EmailService } from '../../../src/shared/services/email/email.service';
import {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../../src/shared/errors/httpErrors';
import { UserRole } from '../../../src/models/user.model';
import { Gender } from '../../../src/models/patient.model';

jest.mock('bcryptjs');

describe('AuthService Unit Tests', () => {
  let service: AuthService;
  let mockRepo: jest.Mocked<AuthRepository>;
  let mockOtpService: jest.Mocked<OtpService>;
  let mockEmailService: jest.Mocked<EmailService>;

  const mockUserDoc = {
    id: '507f1f77bcf86cd799439011',
    email: 'karthikeyanm2209@gmail.com',
    passwordHash: '$2a$10$hashedpassword',
    firstName: 'Karthikeyan',
    lastName: 'M',
    phoneNumber: '+917339321071',
    age: 24,
    gender: Gender.MALE,
    role: UserRole.PATIENT,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      existsByEmail: jest.fn(),
      createUser: jest.fn(),
      findById: jest.fn(),
      updateLastLogin: jest.fn(),
    } as unknown as jest.Mocked<AuthRepository>;

    mockOtpService = {
      generateOtp: jest.fn().mockReturnValue('123456'),
      storePendingRegistration: jest.fn().mockResolvedValue(undefined),
      verifyRegistrationOtp: jest.fn(),
      deletePendingRegistration: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OtpService>;

    mockEmailService = {
      sendVerificationOtp: jest.fn().mockResolvedValue(undefined),
      sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<EmailService>;

    service = new AuthService(mockRepo, mockOtpService, mockEmailService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should generate OTP, cache pending registration, and email OTP code', async () => {
      mockRepo.existsByEmail.mockResolvedValue(false);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2a$10$hashedpassword');

      const result = await service.register({
        email: '  KarthikeyanM2209@gmail.com ',
        password: 'Karthi@1111',
        firstName: 'Karthikeyan',
        lastName: 'M',
        phoneNumber: '+917339321071',
        age: 24,
        gender: 'MALE',
        role: 'PATIENT',
      });

      expect(result.email).toBe('karthikeyanm2209@gmail.com');
      expect(result.expiresInSeconds).toBe(300);
      expect(mockRepo.existsByEmail).toHaveBeenCalledWith('karthikeyanm2209@gmail.com');
      expect(mockOtpService.storePendingRegistration).toHaveBeenCalled();
      expect(mockEmailService.sendVerificationOtp).toHaveBeenCalledWith(
        'karthikeyanm2209@gmail.com',
        '123456',
        'Karthikeyan',
      );
    });

    it('should throw ConflictError if user with email already exists', async () => {
      mockRepo.existsByEmail.mockResolvedValue(true);

      await expect(
        service.register({
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
          firstName: 'Karthikeyan',
          lastName: 'M',
          age: 24,
          gender: 'MALE',
          role: 'PATIENT',
        }),
      ).rejects.toThrow(ConflictError);
    });

    it('should rethrow error when registration fails during process', async () => {
      mockRepo.existsByEmail.mockRejectedValue(new Error('Database error'));

      await expect(
        service.register({
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
          firstName: 'Karthikeyan',
          lastName: 'M',
          age: 24,
          gender: 'MALE',
          role: 'PATIENT',
        }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and create user document when pending registration is valid', async () => {
      mockOtpService.verifyRegistrationOtp.mockResolvedValue({
        email: 'karthikeyanm2209@gmail.com',
        passwordHash: '$2a$10$hashedpassword',
        firstName: 'Karthikeyan',
        lastName: 'M',
        phoneNumber: '+917339321071',
        age: 24,
        gender: 'MALE',
        role: 'PATIENT',
        hashedOtp: '$2a$10$hashedotp',
        remainingTries: 3,
        createdAt: new Date().toISOString(),
      } as unknown as Awaited<ReturnType<typeof mockOtpService.verifyRegistrationOtp>>);
      mockRepo.existsByEmail.mockResolvedValue(false);
      mockRepo.createUser.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.createUser>>,
      );

      await service.verifyOtp({
        email: '  KarthikeyanM2209@gmail.com ',
        otp: '123456',
      });

      expect(mockRepo.createUser).toHaveBeenCalled();
      expect(mockOtpService.deletePendingRegistration).toHaveBeenCalledWith(
        'karthikeyanm2209@gmail.com',
      );
      expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
        'karthikeyanm2209@gmail.com',
        'Karthikeyan',
      );
    });

    it('should throw BadRequestError if pending registration is null or missing required fields', async () => {
      mockOtpService.verifyRegistrationOtp.mockResolvedValue(
        null as unknown as Awaited<ReturnType<typeof mockOtpService.verifyRegistrationOtp>>,
      );

      await expect(
        service.verifyOtp({
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if verification email mismatches pending registration', async () => {
      mockOtpService.verifyRegistrationOtp.mockResolvedValue({
        email: 'other@gmail.com',
        passwordHash: '$2a$10$hashedpassword',
        firstName: 'Other',
        lastName: 'User',
      } as unknown as Awaited<ReturnType<typeof mockOtpService.verifyRegistrationOtp>>);

      await expect(
        service.verifyOtp({
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw ConflictError and delete pending registration if user was created concurrently', async () => {
      mockOtpService.verifyRegistrationOtp.mockResolvedValue({
        email: 'karthikeyanm2209@gmail.com',
        passwordHash: '$2a$10$hashedpassword',
        firstName: 'Karthikeyan',
        lastName: 'M',
      } as unknown as Awaited<ReturnType<typeof mockOtpService.verifyRegistrationOtp>>);
      mockRepo.existsByEmail.mockResolvedValue(true);

      await expect(
        service.verifyOtp({
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        }),
      ).rejects.toThrow(ConflictError);

      expect(mockOtpService.deletePendingRegistration).toHaveBeenCalledWith(
        'karthikeyanm2209@gmail.com',
      );
    });

    it('should rethrow error when verifyOtp encounters an exception', async () => {
      mockOtpService.verifyRegistrationOtp.mockRejectedValue(new Error('Redis failure'));

      await expect(
        service.verifyOtp({
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        }),
      ).rejects.toThrow('Redis failure');
    });
  });

  describe('login', () => {
    it('should authenticate user and return tokens when credentials are valid', async () => {
      mockRepo.findByEmailWithPassword.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findByEmailWithPassword>>,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockRepo.updateLastLogin.mockResolvedValue(undefined);

      const result = await service.login({
        email: '  KarthikeyanM2209@gmail.com ',
        password: 'Karthi@1111',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockRepo.updateLastLogin).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw UnauthorizedError when user is not found by email', async () => {
      mockRepo.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@gmail.com',
          password: 'Password123',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when user account is disabled', async () => {
      mockRepo.findByEmailWithPassword.mockResolvedValue({
        ...mockUserDoc,
        isActive: false,
      } as unknown as Awaited<ReturnType<typeof mockRepo.findByEmailWithPassword>>);

      await expect(
        service.login({
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError when password comparison fails', async () => {
      mockRepo.findByEmailWithPassword.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findByEmailWithPassword>>,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'karthikeyanm2209@gmail.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should rethrow error when login encounters database exception', async () => {
      mockRepo.findByEmailWithPassword.mockRejectedValue(new Error('DB failure'));

      await expect(
        service.login({
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
        }),
      ).rejects.toThrow('DB failure');
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile object when user is found by ID', async () => {
      mockRepo.findById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findById>>,
      );

      const profile = await service.getUserProfile('507f1f77bcf86cd799439011');

      expect(profile.id).toBe('507f1f77bcf86cd799439011');
      expect(profile.email).toBe('karthikeyanm2209@gmail.com');
      expect(profile.healthStatus).toBe('STABLE');
    });

    it('should format ISO dates when createdAt, updatedAt, lastLoginAt are null/undefined', async () => {
      const userWithoutDates = {
        ...mockUserDoc,
        createdAt: undefined,
        updatedAt: undefined,
        lastLoginAt: undefined,
      };

      mockRepo.findById.mockResolvedValue(
        userWithoutDates as unknown as Awaited<ReturnType<typeof mockRepo.findById>>,
      );

      const profile = await service.getUserProfile('507f1f77bcf86cd799439011');

      expect(profile.createdAt).toBeDefined();
      expect(profile.updatedAt).toBeDefined();
      expect(profile.lastLoginAt).toBeUndefined();
    });

    it('should throw NotFoundError when userId parameter is undefined', async () => {
      await expect(service.getUserProfile(undefined)).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when repo returns null for userId', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getUserProfile('507f1f77bcf86cd799439099')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should rethrow error when getUserProfile encounters exception', async () => {
      mockRepo.findById.mockRejectedValue(new Error('Profile DB error'));

      await expect(service.getUserProfile('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Profile DB error',
      );
    });
  });
});
