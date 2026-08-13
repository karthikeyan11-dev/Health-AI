import crypto from 'crypto';
import { AuthConstants } from '../constants/auth.constants';

/**
 * Generates a cryptographically secure numeric OTP of the specified length.
 */
export function generateOTP(length = AuthConstants.OTP_LENGTH): string {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return crypto.randomInt(min, max + 1).toString();
}

/**
 * Returns formatted Redis key for registration temporary data.
 */
export function getRegistrationRedisKey(identifier: string): string {
  return `${AuthConstants.REDIS_KEY_PREFIX}${identifier.trim().toLowerCase()}`;
}
