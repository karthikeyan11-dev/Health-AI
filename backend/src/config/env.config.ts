import { cleanEnv, str, port, num } from 'envalid';
import dotenv from 'dotenv';

dotenv.config();

if (process.env.JEST_WORKER_ID !== undefined) {
  process.env.NODE_ENV = 'test';
}

export const Config = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'], default: 'development' }),
  PORT: port({ default: 5000 }),
  MONGODB_URI: str({ desc: 'MongoDB connection string' }),

  SUPER_ADMIN_EMAIL: str({ desc: 'Default system super administrator email' }),
  SUPER_ADMIN_PASSWORD: str({ desc: 'Default system super administrator password' }),
  JWT_SECRET: str({ desc: 'JWT signing secret key for access tokens' }),
  JWT_EXPIRES_IN: str({ default: '1h', desc: 'JWT access token lifespan' }),
  JWT_REFRESH_SECRET: str({
    default: 'super_secret_health_ai_refresh_key_2026_production_grade',
    desc: 'JWT refresh token secret key',
  }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d', desc: 'JWT refresh token lifespan' }),
  BCRYPT_SALT_ROUNDS: num({ default: 10, desc: 'Cost factor for password hashing' }),

  AI_SERVICE_URL: str({
    default: 'http://localhost:5001',
    desc: 'Python emotion detection AI microservice URL',
  }),
  REDIS_HOST: str({ default: 'localhost', desc: 'Redis hostname' }),
  REDIS_PORT: port({ default: 6379, desc: 'Redis port' }),
  LOG_LEVEL: str({
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'debug',
    desc: 'Pino structured logging level',
  }),
});
