import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { redisProvider } from '@shared/providers/storage/redis.provider';
import { brevoEmailProvider } from '@shared/providers/email/brevo.provider';
import { EmailService } from '@shared/services/email/email.service';
import { OtpService } from '@shared/services/otp/otp.service';
import { AuthRepository } from '../modules/auth/auth.repository';
import { AuthService } from '../modules/auth/auth.service';
import { AuthController } from '../modules/auth/auth.controller';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  redisProvider: asValue(redisProvider),
  emailProvider: asValue(brevoEmailProvider),
  emailService: asClass(EmailService).singleton(),
  otpService: asClass(OtpService).singleton(),
  authRepository: asClass(AuthRepository).singleton(),
  authService: asClass(AuthService).singleton(),
  authController: asClass(AuthController).singleton(),
});
