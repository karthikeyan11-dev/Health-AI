import { logger } from '@config/logger';
import type { EmailProvider, SendEmailOptions } from './email.provider';

/**
 * Mock Email Provider for local development, unit testing, and sandbox environments.
 */
export class MockEmailProvider implements EmailProvider {
  private sentEmails: SendEmailOptions[] = [];

  public async sendEmail(options: SendEmailOptions): Promise<boolean> {
    const messageId = `mock_msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.sentEmails.push(options);

    logger.info(
      {
        messageId,
        recipient: options.to,
        subject: options.subject,
      },
      'MockEmailProvider.sendEmail - Mock email recorded successfully',
    );
    return true;
  }

  public getSentEmails(): readonly SendEmailOptions[] {
    return this.sentEmails;
  }

  public clearSentEmails(): void {
    this.sentEmails = [];
  }
}
