import { BrevoClient } from '@getbrevo/brevo';
import { emailConfig } from '@config/email.config';
import { logger } from '@config/logger';
import type { EmailProvider, SendEmailOptions } from './email.provider';

/**
 * Brevo Transactional Email Provider implementation utilizing @getbrevo/brevo client.
 */
export class BrevoEmailProvider implements EmailProvider {
  private readonly client: BrevoClient;

  constructor() {
    this.client = new BrevoClient({
      apiKey: emailConfig.apiKey || 'placeholder_api_key',
    });
  }

  /**
   * Dispatches transactional email via BrevoClient.
   */
  public async sendEmail(options: SendEmailOptions): Promise<boolean> {
    if (!emailConfig.apiKey) {
      logger.warn(
        { recipient: options.to, subject: options.subject },
        'BrevoEmailProvider.sendEmail - BREVO_API_KEY is missing. Email dispatch skipped in current environment.',
      );
      return false;
    }

    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const payload = {
        subject: options.subject,
        htmlContent: options.html,
        ...(options.text ? { textContent: options.text } : {}),
        sender: {
          name: options.senderName || emailConfig.sender.name,
          email: options.senderEmail || emailConfig.sender.email,
        },
        to: recipients.map((email) => ({
          email,
          name: options.toName || email,
        })),
      };

      const response = await this.client.transactionalEmails.sendTransacEmail(payload);

      logger.info(
        {
          messageId: response.messageId,
          recipients,
          subject: options.subject,
        },
        'BrevoEmailProvider.sendEmail - Transactional email dispatched successfully via Brevo',
      );
      return true;
    } catch (error) {
      logger.error(
        {
          err: error,
          recipient: options.to,
          subject: options.subject,
        },
        'BrevoEmailProvider.sendEmail - Failed to dispatch email via Brevo API',
      );
      throw error;
    }
  }
}

export const brevoEmailProvider = new BrevoEmailProvider();
