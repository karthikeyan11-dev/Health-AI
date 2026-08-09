import { redisProvider, RedisProvider } from '../../providers/storage/redis.provider';
import { BadRequestError } from '../../errors/httpErrors';
import type { PendingRegistrationData } from '../../types/auth/registration.types';
import { AuthConstants } from '../../constants/auth.constants';
import { generateOTP, getRegistrationRedisKey } from '../../utils/otp.util';
import { logger } from '@config/logger';

/**
 * Service managing temporary OTP verification state and pending registration payloads in Redis.
 */
export class OtpService {
  private readonly redis: RedisProvider;
  private readonly defaultTtlSeconds: number;

  constructor(redis?: RedisProvider, defaultTtlSeconds?: number) {
    this.redis = redis ?? redisProvider;
    this.defaultTtlSeconds = defaultTtlSeconds ?? AuthConstants.OTP_EXPIRY_SECONDS;
  }

  /**
   * Generates a cryptographically secure numeric OTP.
   */
  public generateOtp(digits = AuthConstants.OTP_LENGTH): string {
    return generateOTP(digits);
  }

  /**
   * Generates formatted Redis key for pending registration data.
   */
  private buildKey(identifier: string): string {
    return getRegistrationRedisKey(identifier);
  }

  /**
   * Temporarily stores pending registration data + OTP in Redis with expiry TTL.
   */
  public async storePendingRegistration(
    identifier: string,
    registrationData: Omit<PendingRegistrationData, 'otp' | 'attempts' | 'createdAt'>,
    otp: string,
    ttlSeconds?: number,
  ): Promise<void> {
    const key = this.buildKey(identifier);
    const ttl = ttlSeconds ?? this.defaultTtlSeconds;

    const payload: PendingRegistrationData = {
      ...registrationData,
      otp,
      attempts: 0,
      createdAt: new Date().toISOString(),
    };

    logger.info(
      { identifier: identifier.toLowerCase(), ttl },
      'OtpService.storePendingRegistration - Storing registration data in Redis',
    );

    const client = this.redis.getClient();
    await client.setex(key, ttl, JSON.stringify(payload));
  }

  /**
   * Retrieves raw pending registration data from Redis without verifying OTP.
   */
  public async getPendingRegistration(identifier: string): Promise<PendingRegistrationData | null> {
    const key = this.buildKey(identifier);
    const client = this.redis.getClient();
    const rawData = await client.get(key);

    if (!rawData) {
      return null;
    }

    try {
      return JSON.parse(rawData) as PendingRegistrationData;
    } catch (error) {
      logger.error(
        { err: error, key },
        'OtpService.getPendingRegistration - Error parsing registration record',
      );
      return null;
    }
  }

  /**
   * Verifies the submitted OTP against stored registration data in Redis.
   * Throws typed BadRequestError if expired, mismatched, or max attempts exceeded.
   */
  public async verifyRegistrationOtp(
    identifier: string,
    submittedOtp: string,
  ): Promise<PendingRegistrationData> {
    const key = this.buildKey(identifier);
    const record = await this.getPendingRegistration(identifier);

    if (!record) {
      logger.warn(
        { identifier },
        'OtpService.verifyRegistrationOtp - Pending registration not found or expired',
      );
      throw new BadRequestError('Verification code expired or registration not found.');
    }

    if (record.attempts >= AuthConstants.MAX_OTP_ATTEMPTS) {
      logger.warn(
        { identifier, attempts: record.attempts },
        'OtpService.verifyRegistrationOtp - Max OTP attempts exceeded. Deleting record',
      );
      await this.deletePendingRegistration(identifier);
      throw new BadRequestError('Maximum verification attempts exceeded. Please register again.');
    }

    if (record.otp !== submittedOtp.trim()) {
      record.attempts += 1;
      const client = this.redis.getClient();
      const remainingTtl = await client.ttl(key);
      const safeTtl = remainingTtl > 0 ? remainingTtl : this.defaultTtlSeconds;

      await client.setex(key, safeTtl, JSON.stringify(record));

      logger.warn(
        { identifier, attempts: record.attempts, maxAllowed: AuthConstants.MAX_OTP_ATTEMPTS },
        'OtpService.verifyRegistrationOtp - Invalid OTP entered',
      );

      throw new BadRequestError(
        `Invalid verification code. ${AuthConstants.MAX_OTP_ATTEMPTS - record.attempts} attempts remaining.`,
      );
    }

    logger.info({ identifier }, 'OtpService.verifyRegistrationOtp - OTP verified successfully');
    return record;
  }

  /**
   * Deletes pending registration data from Redis after successful account creation.
   */
  public async deletePendingRegistration(identifier: string): Promise<boolean> {
    const key = this.buildKey(identifier);
    const client = this.redis.getClient();

    try {
      const result = await client.del(key);
      logger.info(
        { identifier },
        'OtpService.deletePendingRegistration - Removing registration record from Redis',
      );
      return result > 0;
    } catch (error) {
      logger.error(
        { err: error, identifier },
        'OtpService.deletePendingRegistration - Failed to delete key from Redis',
      );
      return false;
    }
  }
}

export const otpService = new OtpService();
