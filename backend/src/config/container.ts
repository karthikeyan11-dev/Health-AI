import { createContainer, asClass, asValue, InjectionMode } from 'awilix';
import { redisProvider } from '@shared/providers/storage/redis.provider';
import { brevoEmailProvider } from '@shared/providers/email/brevo.provider';
import { EmailService } from '@shared/services/email/email.service';

export const container = createContainer({
  injectionMode: InjectionMode.CLASSIC,
});

container.register({
  redisProvider: asValue(redisProvider),
  emailProvider: asValue(brevoEmailProvider),
  emailService: asClass(EmailService).singleton(),
});
