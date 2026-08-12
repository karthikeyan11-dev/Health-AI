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
   * Returns true if email was dispatched, or false if skipped (e.g. missing API key).
   */
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}
