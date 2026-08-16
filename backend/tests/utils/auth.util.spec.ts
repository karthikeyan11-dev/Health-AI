import {
  saveRegistration,
  getRegistration,
  deleteRegistration,
  toUserRole,
  toSchemaRole,
} from '@shared/utils/auth.util';
import { UserRole } from '@models/user.model';
import { generateOTP, getRegistrationRedisKey } from '@shared/utils/otp.util';
import { AuthConstants } from '@shared/constants/auth.constants';
import type { RedisProvider } from '@shared/providers/storage/redis.provider';

describe('Auth Utilities & OTP Utilities Unit Tests', () => {
  describe('toUserRole & toSchemaRole Utilities', () => {
    it('should correctly convert role strings to UserRole enum', () => {
      expect(toUserRole('SYSTEM')).toBe(UserRole.SYSTEM);
      expect(toUserRole('PATIENT')).toBe(UserRole.PATIENT);
      expect(toUserRole(undefined)).toBe(UserRole.PATIENT);
      expect(toUserRole('UNKNOWN')).toBe(UserRole.PATIENT);
    });

    it('should correctly convert UserRole enum to OpenAPI schema role string', () => {
      expect(toSchemaRole(UserRole.SYSTEM)).toBe('SYSTEM');
      expect(toSchemaRole(UserRole.PATIENT)).toBe('PATIENT');
    });
  });

  describe('OTP Utilities', () => {
    it('should generate 6-digit numeric OTP by default', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
      expect(Number(otp)).toBeLessThanOrEqual(999999);
    });

    it('should generate numeric OTP with custom length', () => {
      const otp4 = generateOTP(6);
      expect(otp4).toHaveLength(6);
      expect(Number(otp4)).toBeGreaterThanOrEqual(1000);
    });

    it('should format Redis key with lowercase identifier', () => {
      const key = getRegistrationRedisKey('Patient@Example.COM');
      expect(key).toBe(`${AuthConstants.REDIS_KEY_PREFIX}patient@example.com`);
    });
  });

  describe('saveRegistration, getRegistration, deleteRegistration', () => {
    let mockClient: {
      setex: jest.Mock;
      get: jest.Mock;
      del: jest.Mock;
    };
    let mockRedisProvider: RedisProvider;

    beforeEach(() => {
      mockClient = {
        setex: jest.fn().mockResolvedValue('OK'),
        get: jest.fn(),
        del: jest.fn().mockResolvedValue(1),
      };

      mockRedisProvider = {
        getClient: jest.fn().mockReturnValue(mockClient),
        disconnect: jest.fn(),
      } as unknown as RedisProvider;
    });

    it('should save registration data with custom TTL in Redis via setex', async () => {
      const dummyData = { email: 'user@healthai.local', otp: '123456' };

      await saveRegistration(mockRedisProvider, 'user@healthai.local', dummyData, 300);

      expect(mockClient.setex).toHaveBeenCalledWith(
        'auth:registration:user@healthai.local',
        300,
        JSON.stringify(dummyData),
      );
    });

    it('should save registration data with default TTL in Redis via setex', async () => {
      const dummyData = { email: 'user@healthai.local', otp: '123456' };

      await saveRegistration(mockRedisProvider, 'user@healthai.local', dummyData);

      expect(mockClient.setex).toHaveBeenCalledWith(
        'auth:registration:user@healthai.local',
        AuthConstants.OTP_EXPIRY_SECONDS,
        JSON.stringify(dummyData),
      );
    });

    it('should retrieve and parse registration data from Redis', async () => {
      const dummyData = { email: 'user@healthai.local', otp: '123456' };
      mockClient.get.mockResolvedValue(JSON.stringify(dummyData));

      const result = await getRegistration<typeof dummyData>(
        mockRedisProvider,
        'user@healthai.local',
      );

      expect(result).toEqual(dummyData);
      expect(mockClient.get).toHaveBeenCalledWith('auth:registration:user@healthai.local');
    });

    it('should return null when registration data is not found in Redis', async () => {
      mockClient.get.mockResolvedValue(null);

      const result = await getRegistration(mockRedisProvider, 'unknown@healthai.local');

      expect(result).toBeNull();
    });

    it('should return null defensively when JSON parsing fails', async () => {
      mockClient.get.mockResolvedValue('invalid-json{');

      const result = await getRegistration(mockRedisProvider, 'corrupted@healthai.local');

      expect(result).toBeNull();
    });

    it('should delete registration data from Redis via del', async () => {
      await deleteRegistration(mockRedisProvider, 'user@healthai.local');

      expect(mockClient.del).toHaveBeenCalledWith('auth:registration:user@healthai.local');
    });

    it('should handle deletion error without throwing exception', async () => {
      mockClient.del.mockRejectedValue(new Error('Redis connection lost'));

      await expect(
        deleteRegistration(mockRedisProvider, 'user@healthai.local'),
      ).resolves.not.toThrow();
    });
  });
});
