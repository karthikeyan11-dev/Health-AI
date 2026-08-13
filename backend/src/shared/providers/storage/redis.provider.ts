import Redis, { type RedisOptions } from 'ioredis';
import { Config } from '@config/env.config';
import { logger } from '@config/logger';

/**
 * Production Redis Provider managing connection pooling and client lifecycle via ioredis.
 */
export class RedisProvider {
  private client: Redis;

  constructor() {
    const redisOptions: RedisOptions = {
      host: Config.REDIS_HOST,
      port: Config.REDIS_PORT,
      password: Config.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
      enableReadyCheck: true,
      lazyConnect: true,
    };

    this.client = new Redis(redisOptions);

    this.client.on('connect', (): void => {
      logger.info(
        { host: Config.REDIS_HOST, port: Config.REDIS_PORT },
        'RedisProvider - Connected to Redis server',
      );
    });

    this.client.on('ready', (): void => {
      logger.info('RedisProvider - Redis client is ready to accept commands');
    });

    this.client.on('error', (err: Error): void => {
      logger.error({ err }, 'RedisProvider - Connection error occurred');
    });

    this.client.on('close', (): void => {
      logger.warn('RedisProvider - Redis connection closed');
    });
  }

  /**
   * Returns the underlying ioredis client instance.
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Gracefully disconnects the Redis client.
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.quit();
      logger.info('RedisProvider - Disconnected successfully');
    } catch (error) {
      logger.warn({ err: error }, 'RedisProvider - Error during quit, forcing disconnect');
      this.client.disconnect();
    }
  }
}

export const redisProvider = new RedisProvider();
