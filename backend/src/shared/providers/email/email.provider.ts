/**
 * Options for sending transactional emails.
 */
export interface SendEmailOptions {
  to: string | string[];
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  senderEmail?: string;
  senderName?: string;
}

/**
 * Generic email provider contract interface.
 */
export interface EmailProvider {
  /**
   * Dispatches an email using the underlying email delivery engine.
   */
  sendEmail(options: SendEmailOptions): Promise<void>;
}
