import { io as socketIOClient, type Socket } from 'socket.io-client';
import { storage } from './storage';

let socket: Socket | null = null;

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? (import.meta.env.VITE_API_URL as string).replace('/api/v1', '')
  : 'http://localhost:5000';

export interface TelemetryReadingPayload {
  sensorType: string;
  value: number;
  unit: string;
  timestamp: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface LiveTelemetryPacket {
  userId: string;
  deviceId?: string;
  batteryLevel?: number;
  readings: TelemetryReadingPayload[];
  receivedAt: string;
}

export interface LiveTelemetryAlert {
  userId: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  metric: string;
  value: number;
  timestamp: string;
}

export function getTelemetrySocket(): Socket {
  if (!socket) {
    const token = storage.getToken();
    socket = socketIOClient(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
  return socket;
}

export function disconnectTelemetrySocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
