import type { RedisProvider } from '../providers/storage/redis.provider';
import { AuthConstants } from '../constants/auth.constants';
import { getRegistrationRedisKey } from './otp.util';
import { UserRole } from '../../models/user.model';
import { Gender } from '../../models/patient.model';
import { logger } from '@config/logger';

/**
 * Converts string gender to Gender enum.
 */
export function toGender(gender?: string): Gender | undefined {
  if (gender === 'MALE') {
    return Gender.MALE;
  }
  if (gender === 'FEMALE') {
    return Gender.FEMALE;
  }
  if (gender === 'OTHER') {
    return Gender.OTHER;
  }
  if (gender === 'PREFER_NOT_TO_SAY') {
    return Gender.PREFER_NOT_TO_SAY;
  }
  return undefined;
}

/**
 * Converts string role (from OpenAPI schema or input) to UserRole enum.
 */
export function toUserRole(role?: string): UserRole {
  if (role === 'CLINICIAN') {
    return UserRole.CLINICIAN;
  }
  if (role === 'ADMIN') {
    return UserRole.ADMIN;
  }
  if (role === 'SYSTEM') {
    return UserRole.SYSTEM;
  }
  return UserRole.PATIENT;
}

/**
 * Converts UserRole enum to OpenAPI schema role string.
 */
export function toSchemaRole(role: UserRole): 'PATIENT' | 'CLINICIAN' | 'ADMIN' | 'SYSTEM' {
  if (role === UserRole.CLINICIAN) {
    return 'CLINICIAN';
  }
  if (role === UserRole.ADMIN) {
    return 'ADMIN';
  }
  if (role === UserRole.SYSTEM) {
    return 'SYSTEM';
  }
  return 'PATIENT';
}

/**
 * Saves temporary registration payload to Redis with TTL.
 */
export async function saveRegistration<T>(
  redisProvider: RedisProvider,
  identifier: string,
  data: T,
  ttlSeconds = AuthConstants.OTP_EXPIRY_SECONDS,
): Promise<void> {
  const key = getRegistrationRedisKey(identifier);
  const client = redisProvider.getClient();
  const serialized = JSON.stringify(data);

  await client.setex(key, ttlSeconds, serialized);
  logger.info({ identifier, ttlSeconds }, 'saveRegistration - Registration data cached in Redis');
}

/**
 * Retrieves and parses pending registration data from Redis.
 */
export async function getRegistration<T>(
  redisProvider: RedisProvider,
  identifier: string,
): Promise<T | null> {
  const key = getRegistrationRedisKey(identifier);
  const client = redisProvider.getClient();
  const rawData = await client.get(key);

  if (!rawData) {
    return null;
  }

  try {
    const parsedData: T = JSON.parse(rawData);
    return parsedData;
  } catch (error) {
    logger.error(
      { err: error, key },
      'getRegistration - Failed to parse registration JSON from Redis',
    );
    return null;
  }
}

/**
 * Deletes temporary registration record from Redis.
 */
export async function deleteRegistration(
  redisProvider: RedisProvider,
  identifier: string,
): Promise<void> {
  const key = getRegistrationRedisKey(identifier);
  const client = redisProvider.getClient();

  try {
    await client.del(key);
    logger.info({ identifier }, 'deleteRegistration - Registration record deleted from Redis');
  } catch (error) {
    logger.error(
      { err: error, identifier },
      'deleteRegistration - Error deleting registration record from Redis',
    );
  }
}
