import pino, { type Logger } from 'pino';
import { Config } from './env.config';

export const logger: Logger = pino({
  level: Config.LOG_LEVEL || (Config.isProduction ? 'info' : 'debug'),
  transport: Config.isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:yyyy-mm-dd HH:MM:ss.l',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    env: Config.NODE_ENV,
    service: 'health-ai-backend',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
