import { Server as SocketIOServer, type Socket } from 'socket.io';
import type { Server as HTTPServer } from 'node:http';
import jwt from 'jsonwebtoken';
import { Config } from './env.config';
import { logger } from './logger';

let io: SocketIOServer | null = null;

export interface AuthenticatedSocket extends Socket {
  data: {
    userId?: string;
    email?: string;
    role?: string;
  };
}

export interface TelemetryPacketPayload {
  userId: string;
  deviceId?: string;
  batteryLevel?: number;
  readings: Array<{
    sensorType: string;
    value: number;
    unit?: string;
    timestamp?: string | Date;
    confidence?: number;
    metadata?: Record<string, unknown>;
  }>;
  receivedAt: string;
}

export interface TelemetryAlertPayload {
  userId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  metric: string;
  value: number;
  timestamp: string;
}

/**
 * Initializes and binds the Socket.IO server to the HTTP server instance.
 */
export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: Config.CORS_ORIGIN === '*' ? '*' : Config.CORS_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingInterval: 25000,
    pingTimeout: 20000,
  });

  // Authentication Middleware for WebSocket Connections
  io.use((socket: Socket, next) => {
    try {
      const authHeader = socket.handshake.headers.authorization;
      const token =
        socket.handshake.auth?.token ||
        (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

      if (!token) {
        // Allow unauthenticated connection or reject if strict
        logger.debug({ socketId: socket.id }, 'Socket connected without token');
        return next();
      }

      const decoded = jwt.verify(token, Config.JWT_SECRET) as {
        id?: string;
        sub?: string;
        userId?: string;
        email?: string;
        role?: string;
      };

      const userId = decoded.id || decoded.sub || decoded.userId;
      if (userId) {
        socket.data.userId = userId;
        socket.data.email = decoded.email;
        socket.data.role = decoded.role;
      }

      return next();
    } catch (err) {
      logger.warn({ err, socketId: socket.id }, 'Socket authentication error');
      return next(); // Continue without authenticated user data
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data?.userId;
    if (userId) {
      const userRoom = `user:${userId}`;
      void socket.join(userRoom);
      logger.info(
        { socketId: socket.id, userId, room: userRoom },
        'Client connected to private telemetry stream',
      );
    } else {
      logger.info({ socketId: socket.id }, 'Client connected to public telemetry socket');
    }

    // Explicit room subscription event
    socket.on('subscribe:user', (targetUserId: string) => {
      if (targetUserId) {
        const room = `user:${targetUserId}`;
        void socket.join(room);
        logger.debug({ socketId: socket.id, room }, 'Socket explicitly joined user room');
      }
    });

    socket.on('disconnect', (reason: string) => {
      logger.debug({ socketId: socket.id, userId, reason }, 'Socket disconnected');
    });
  });

  logger.info('⚡ Socket.IO Real-Time Telemetry Hub initialized successfully');
  return io;
}

/**
 * Returns the active Socket.IO server instance.
 */
export function getIO(): SocketIOServer | null {
  return io;
}

/**
 * Sets the active Socket.IO instance (useful for testing).
 */
export function setIO(customIO: SocketIOServer | null): void {
  io = customIO;
}

/**
 * Emits an event to all sockets joined in a user's private channel.
 */
export function emitToUser(userId: string, event: string, data: unknown): boolean {
  if (!io) {
    return false;
  }
  const room = `user:${userId}`;
  io.to(room).emit(event, data);
  return true;
}

/**
 * Broadcasts a new batch of telemetry readings to the user's real-time stream.
 */
export function broadcastTelemetry(userId: string, payload: TelemetryPacketPayload): boolean {
  return emitToUser(userId, 'telemetry:reading:new', payload);
}

/**
 * Broadcasts a high-priority physiological alert to the user.
 */
export function broadcastAlert(userId: string, alert: TelemetryAlertPayload): boolean {
  return emitToUser(userId, 'telemetry:alert', alert);
}
