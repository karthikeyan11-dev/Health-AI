import type { EmailProvider } from '../../providers/email/email.provider';
import { brevoEmailProvider } from '../../providers/email/brevo.provider';
import { getOtpVerificationEmailHtml, getWelcomeEmailHtml } from '../../templates/email/html';
import { EmailConstants } from '../../constants/email.constants';
import { logger } from '@config/logger';

/**
 * Service managing email composition and dispatch via injected EmailProvider.
 */
export class EmailService {
  constructor(private readonly emailProvider: EmailProvider = brevoEmailProvider) {}

  /**
   * Sends an OTP verification email to the user.
   */
  public async sendVerificationOtp(email: string, otp: string, name?: string): Promise<void> {
    try {
      logger.info({ email }, 'EmailService.sendVerificationOtp - Composing verification email');

      const html = getOtpVerificationEmailHtml({
        recipientName: name || email.split('@')[0],
        otp,
        expiresInMinutes: 5,
      });

      const text = `Your Health AI verification code is: ${otp}. Valid for 5 minutes.`;

      await this.emailProvider.sendEmail({
        to: email,
        toName: name,
        subject: EmailConstants.SUBJECTS.OTP_VERIFICATION,
        html,
        text,
      });

      logger.info({ email }, 'EmailService.sendVerificationOtp - Email dispatched successfully');
    } catch (error) {
      logger.error(
        { err: error, email },
        'EmailService.sendVerificationOtp - Failed to dispatch verification email',
      );
      throw error;
    }
  }

  /**
   * Sends a welcome onboarding email asynchronously after account creation.
   */
  public async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    try {
      logger.info({ email }, 'EmailService.sendWelcomeEmail - Composing welcome email');

      const html = getWelcomeEmailHtml({
        name: name || email.split('@')[0],
      });

      const text = `Welcome to Health AI! Your account is now active.`;

      await this.emailProvider.sendEmail({
        to: email,
        toName: name,
        subject: EmailConstants.SUBJECTS.WELCOME,
        html,
        text,
      });

      logger.info(
        { email },
        'EmailService.sendWelcomeEmail - Welcome email dispatched successfully',
      );
    } catch (error) {
      logger.error(
        { err: error, email },
        'EmailService.sendWelcomeEmail - Failed to dispatch welcome email',
      );
      // Background email failures are logged without re-throwing to avoid interrupting account flow
    }
  }
}

export const emailService = new EmailService();
