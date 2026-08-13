import { Config } from './env.config';

export interface EmailConfig {
  apiKey: string;
  sender: {
    email: string;
    name: string;
  };
  provider: string;
}

export const emailConfig: EmailConfig = {
  apiKey: Config.BREVO_API_KEY,
  sender: {
    email: Config.EMAIL_SENDER_EMAIL,
    name: Config.EMAIL_SENDER_NAME,
  },
  provider: Config.EMAIL_PROVIDER,
};
