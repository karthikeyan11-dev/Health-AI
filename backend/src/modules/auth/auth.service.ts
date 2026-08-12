import bcrypt from 'bcryptjs';
import { authRepository, AuthRepository } from './auth.repository';
import { otpService, OtpService } from '../../shared/services/otp/otp.service';
import { emailService, EmailService } from '../../shared/services/email/email.service';
import { ConflictError, BadRequestError } from '../../shared/errors/httpErrors';
import { UserRole, type IUserDocument } from '../../models/user.model';
import { AuthConstants } from '../../shared/constants/auth.constants';
import type { RegisterRequest, RegisterResponse, VerifyOtpRequest } from './auth.dto';

import { toUserRole, toGender } from '../../shared/utils/auth.util';

/**
 * Service managing user registration workflows, OTP verification, and account creation.
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
    const normalizedEmail = dto.email.trim().toLowerCase();

    const exists = await this.repo.existsByEmail(normalizedEmail);
    if (exists) {
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

    return {
      email: normalizedEmail,
      expiresInSeconds: AuthConstants.OTP_EXPIRY_SECONDS,
    };
  }

  /**
   * Verifies submitted 6-digit OTP against pending Redis record and creates permanent MongoDB user.
   */
  public async verifyOtp(dto: VerifyOtpRequest): Promise<void> {
    const normalizedEmail = dto.email.trim().toLowerCase();

    const pendingData = await this.otpSvc.verifyRegistrationOtp(normalizedEmail, dto.otp);

    if (
      !pendingData ||
      !pendingData.email ||
      !pendingData.passwordHash ||
      !pendingData.firstName ||
      !pendingData.lastName
    ) {
      throw new BadRequestError('Verification code expired or registration not found.');
    }

    if (pendingData.email.toLowerCase() !== normalizedEmail) {
      throw new BadRequestError('Verification email mismatch');
    }

    const exists = await this.repo.existsByEmail(normalizedEmail);
    if (exists) {
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
  }
}

export const authService = new AuthService();
