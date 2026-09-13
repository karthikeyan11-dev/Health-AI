import http from 'node:http';
import app from './app';
import { Config, connectDatabase, disconnectDatabase, initSocketServer, logger } from './config';

async function bootstrap(): Promise<void> {
  try {
    // 1. Connect to MongoDB automatically on startup
    await connectDatabase();

    // 2. Create HTTP and Socket.IO Server
    const httpServer = http.createServer(app);
    initSocketServer(httpServer);

    const server = httpServer.listen(Config.PORT, (): void => {
      logger.info(
        {
          port: Config.PORT,
          env: Config.NODE_ENV,
          url: `http://localhost:${Config.PORT}`,
        },
        `🚀 Health AI Gateway Server running on port ${Config.PORT}`,
      );
    });

    // 3. Graceful shutdown handler
    const gracefulShutdown = async (signal: string): Promise<void> => {
      logger.info(`Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.fatal({ err: error }, 'Application failed to start');
    process.exit(1);
  }
}

void bootstrap();
