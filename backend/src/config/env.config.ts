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
  JWT_REFRESH_SECRET: str({ desc: 'JWT refresh token secret key' }),
  JWT_REFRESH_EXPIRES_IN: str({ default: '7d', desc: 'JWT refresh token lifespan' }),
  BCRYPT_SALT_ROUNDS: num({ default: 10, desc: 'Cost factor for password hashing' }),

  AI_SERVICE_URL: str({
    default: 'http://localhost:5001',
    desc: 'Unified Health AI Microservice URL (Cardio, Digital Twin, Stress)',
  }),
  AI_SERVICE_TIMEOUT_MS: num({
    default: 15000,
    desc: 'HTTP request timeout for AI Microservice in milliseconds',
  }),
  CORS_ORIGIN: str({
    default: '*',
    desc: 'Allowed CORS origins (comma-separated list or * for all)',
  }),

  // Redis Configuration
  REDIS_HOST: str({ default: 'localhost', desc: 'Redis hostname' }),
  REDIS_PORT: port({ default: 6379, desc: 'Redis port' }),
  REDIS_PASSWORD: str({ default: '', desc: 'Redis authentication password' }),

  // Email Provider Configuration
  EMAIL_PROVIDER: str({
    choices: ['brevo', 'mock'],
    default: 'brevo',
    desc: 'Email provider implementation',
  }),
  EMAIL_SENDER_EMAIL: str({
    default: 'noreply@healthai.local',
    desc: 'Default system email sender address',
  }),
  EMAIL_SENDER_NAME: str({
    default: 'Health AI Platform',
    desc: 'Default system email sender display name',
  }),
  BREVO_API_KEY: str({
    default: '',
    desc: 'Brevo transactional email API key',
  }),

  // Registration & OTP Configuration
  REGISTRATION_OTP_EXPIRY_SECONDS: num({
    default: 300,
    desc: 'Registration OTP expiry TTL in seconds (default 5 minutes)',
  }),

  LOG_LEVEL: str({
    choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'],
    default: 'debug',
    desc: 'Pino structured logging level',
  }),
});
