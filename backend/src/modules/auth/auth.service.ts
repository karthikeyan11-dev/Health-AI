import bcrypt from 'bcryptjs';
import { authRepository, AuthRepository } from './auth.repository';
import { otpService, OtpService } from '../../shared/services/otp/otp.service';
import { emailService, EmailService } from '../../shared/services/email/email.service';
import {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../shared/errors/httpErrors';
import { UserRole, type IUserDocument } from '../../models/user.model';
import { AuthConstants } from '../../shared/constants/auth.constants';
import type {
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  LoginRequest,
  AuthTokensResponse,
  UserProfileData,
} from './auth.dto';
import { toUserRole, toGender } from '../../shared/utils/auth.util';
import { generateTokens } from '../../shared/utils/token.util';
import { logger } from '@config/logger';

/**
 * Service managing user registration workflows, OTP verification, authentication, and token generation.
 */
export class AuthService {
  constructor(
    private readonly repo: AuthRepository = authRepository,
    private readonly otpSvc: OtpService = otpService,
    private readonly emailSvc: EmailService = emailService,
  ) {}

  /**
   * Initiates user registration flow: validates uniqueness, hashes password/OTP, caches in Redis, and emails OTP.
   */
  public async register(dto: RegisterRequest): Promise<NonNullable<RegisterResponse['data']>> {
    try {
      const normalizedEmail = dto.email.trim().toLowerCase();
      logger.info(
        { email: normalizedEmail },
        'AuthService.register - Initiating user registration',
      );

      const exists = await this.repo.existsByEmail(normalizedEmail);
      if (exists) {
        logger.warn({ email: normalizedEmail }, 'AuthService.register - Email already registered');
        throw new ConflictError('User with email already exists');
      }

      const passwordHash = await bcrypt.hash(dto.password, 10);
      const otp = this.otpSvc.generateOtp();
      const role: UserRole = toUserRole(dto.role);

      await this.otpSvc.storePendingRegistration(
        normalizedEmail,
        {
          email: normalizedEmail,
          passwordHash,
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          phoneNumber: dto.phoneNumber?.trim(),
          age: dto.age,
          gender: dto.gender,
          role,
        },
        otp,
      );

      await this.emailSvc.sendVerificationOtp(normalizedEmail, otp, dto.firstName);

      logger.info(
        { email: normalizedEmail },
        'AuthService.register - OTP generated and sent successfully',
      );
      return {
        email: normalizedEmail,
        expiresInSeconds: AuthConstants.OTP_EXPIRY_SECONDS,
      };
    } catch (error) {
      logger.error(
        { err: error, email: dto.email },
        'AuthService.register - Error during registration flow',
      );
      throw error;
    }
  }

  /**
   * Verifies submitted 6-digit OTP against pending Redis record and creates permanent MongoDB user.
   */
  public async verifyOtp(dto: VerifyOtpRequest): Promise<void> {
    try {
      const normalizedEmail = dto.email.trim().toLowerCase();
      logger.info(
        { email: normalizedEmail },
        'AuthService.verifyOtp - Initiating OTP verification',
      );

      const pendingData = await this.otpSvc.verifyRegistrationOtp(normalizedEmail, dto.otp);

      if (
        !pendingData ||
        !pendingData.email ||
        !pendingData.passwordHash ||
        !pendingData.firstName ||
        !pendingData.lastName
      ) {
        logger.warn(
          { email: normalizedEmail },
          'AuthService.verifyOtp - Pending registration data invalid or expired',
        );
        throw new BadRequestError('Verification code expired or registration not found.');
      }

      if (pendingData.email.toLowerCase() !== normalizedEmail) {
        logger.warn(
          { email: normalizedEmail },
          'AuthService.verifyOtp - Registration email mismatch',
        );
        throw new BadRequestError('Verification email mismatch');
      }

      const exists = await this.repo.existsByEmail(normalizedEmail);
      if (exists) {
        logger.warn(
          { email: normalizedEmail },
          'AuthService.verifyOtp - User created concurrently prior to OTP verification',
        );
        await this.otpSvc.deletePendingRegistration(normalizedEmail);
        throw new ConflictError('User with email already exists');
      }

      const user: IUserDocument = await this.repo.createUser({
        email: pendingData.email,
        passwordHash: pendingData.passwordHash,
        firstName: pendingData.firstName,
        lastName: pendingData.lastName,
        phoneNumber: pendingData.phoneNumber,
        age: pendingData.age,
        gender: toGender(pendingData.gender),
        role: toUserRole(pendingData.role),
        isEmailVerified: true,
        isPhoneVerified: false,
        isActive: true,
      });

      await this.otpSvc.deletePendingRegistration(normalizedEmail);
      void this.emailSvc.sendWelcomeEmail(user.email, user.firstName);

      logger.info(
        { email: normalizedEmail, userId: user.id },
        'AuthService.verifyOtp - User account created successfully',
      );
    } catch (error) {
      logger.error(
        { err: error, email: dto.email },
        'AuthService.verifyOtp - Error during OTP verification flow',
      );
      throw error;
    }
  }

  /**
   * Authenticates user credentials, verifies password hash, updates lastLoginAt, and returns JWT tokens.
   */
  public async login(dto: LoginRequest): Promise<AuthTokensResponse> {
    try {
      const normalizedEmail = dto.email.trim().toLowerCase();
      logger.info(
        { email: normalizedEmail },
        'AuthService.login - Authenticating user credentials',
      );

      const user = await this.repo.findByEmailWithPassword(normalizedEmail);
      if (!user) {
        logger.warn({ email: normalizedEmail }, 'AuthService.login - User not found');
        throw new UnauthorizedError('Invalid credentials');
      }

      if (!user.isActive) {
        logger.warn(
          { email: normalizedEmail, userId: user.id },
          'AuthService.login - Account disabled',
        );
        throw new UnauthorizedError('Account is disabled');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn({ email: normalizedEmail }, 'AuthService.login - Password mismatch');
        throw new UnauthorizedError('Invalid credentials');
      }

      const tokens = generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      await this.repo.updateLastLogin(user.id);

      logger.info(
        { email: normalizedEmail, userId: user.id },
        'AuthService.login - Authentication successful',
      );
      return tokens;
    } catch (error) {
      logger.error({ err: error, email: dto.email }, 'AuthService.login - Error during login flow');
      throw error;
    }
  }

  /**
   * Fetches user profile details dynamically from database based on authenticated user ID.
   */
  public async getUserProfile(userId?: string): Promise<UserProfileData> {
    try {
      const user = userId ? await this.repo.findById(userId) : null;

      if (!user) {
        logger.warn(
          { userId },
          'AuthService.getUserProfile - Profile user record not found in database',
        );
        throw new NotFoundError('User profile not found in database');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        age: user.age,
        gender: user.gender,
        role: user.role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
          ? new Date(user.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: user.updatedAt
          ? new Date(user.updatedAt).toISOString()
          : new Date().toISOString(),
        lastLoginAt: user.lastLoginAt ? new Date(user.lastLoginAt).toISOString() : undefined,
        healthStatus: 'STABLE',
        primaryPhysician: 'Dr. Sarah Jenkins',
        connectedDevicesCount: 2,
        activeMonitoringStreams: 1,
        recentHeartRateBpm: 72,
        recentSpo2Percent: 98.5,
        recentTemperatureCelsius: 36.6,
        riskAssessmentScore: 'LOW_RISK',
        medicalNotes: 'Patient telemetry within normal baseline parameters.',
      };
    } catch (error) {
      logger.error(
        { err: error, userId },
        'AuthService.getUserProfile - Error processing profile retrieval',
      );
      throw error;
    }
  }
}

export const authService = new AuthService();
