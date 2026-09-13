import { useState, useEffect, useCallback } from 'react';
import {
  getTelemetrySocket,
  type LiveTelemetryPacket,
  type LiveTelemetryAlert,
  type TelemetryReadingPayload,
} from '@/lib/socket';
import { storage } from '@/lib/storage';

export interface TelemetryStreamState {
  isConnected: boolean;
  deviceId?: string;
  batteryLevel?: number;
  lastUpdated?: string;
  liveVitals: Record<string, TelemetryReadingPayload>;
  alerts: LiveTelemetryAlert[];
}

export function useTelemetryStream(): TelemetryStreamState {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string | undefined>();
  const [batteryLevel, setBatteryLevel] = useState<number | undefined>();
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [liveVitals, setLiveVitals] = useState<Record<string, TelemetryReadingPayload>>({});
  const [alerts, setAlerts] = useState<LiveTelemetryAlert[]>([]);

  const handleTelemetryPacket = useCallback((packet: LiveTelemetryPacket) => {
    if (packet.deviceId) {
      setDeviceId(packet.deviceId);
    }
    if (packet.batteryLevel !== undefined) {
      setBatteryLevel(packet.batteryLevel);
    }
    setLastUpdated(packet.receivedAt);

    setLiveVitals((prev) => {
      const updated = { ...prev };
      for (const reading of packet.readings) {
        updated[reading.sensorType] = reading;
      }
      return updated;
    });
  }, []);

  const handleAlert = useCallback((alert: LiveTelemetryAlert) => {
    setAlerts((prev) => [alert, ...prev.slice(0, 4)]);
  }, []);

  useEffect(() => {
    const socket = getTelemetrySocket();

    function onConnect(): void {
      setIsConnected(true);
      const userId = storage.getUserId();
      if (userId) {
        socket.emit('subscribe:user', userId);
      }
    }

    function onDisconnect(): void {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('telemetry:reading:new', handleTelemetryPacket);
    socket.on('telemetry:alert', handleAlert);

    if (socket.connected) {
      onConnect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('telemetry:reading:new', handleTelemetryPacket);
      socket.off('telemetry:alert', handleAlert);
    };
  }, [handleTelemetryPacket, handleAlert]);

  return {
    isConnected,
    deviceId,
    batteryLevel,
    lastUpdated,
    liveVitals,
    alerts,
  };
}
