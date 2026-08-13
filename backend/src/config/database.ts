import mongoose from 'mongoose';
import { Config } from './env.config';
import { logger } from './logger';

export async function connectDatabase(): Promise<typeof mongoose> {
  try {
    const connection = await mongoose.connect(Config.MONGODB_URI, {
      autoIndex: true,
      serverSelectionTimeoutMS: 5000,
    });

    logger.info(
      {
        host: connection.connection.host,
        port: connection.connection.port,
        dbName: connection.connection.name,
      },
      'Database connected successfully',
    );

    return connection;
  } catch (error) {
    logger.error({ err: error }, 'Failed to connect to MongoDB');
    throw error;
  }
}

export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info('Database disconnected successfully');
  } catch (error) {
    logger.error({ err: error }, 'Error disconnecting from MongoDB');
    throw error;
  }
}

mongoose.connection.on('disconnected', (): void => {
  logger.warn('MongoDB connection lost. Reconnecting...');
});

mongoose.connection.on('error', (err): void => {
  logger.error({ err }, 'MongoDB runtime connection error');
});
