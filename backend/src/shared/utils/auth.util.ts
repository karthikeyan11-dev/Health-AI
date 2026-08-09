import type { RedisProvider } from '../providers/storage/redis.provider';
import { AuthConstants } from '../constants/auth.constants';
import { getRegistrationRedisKey } from './otp.util';
import { logger } from '@config/logger';

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
    return JSON.parse(rawData) as T;
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
