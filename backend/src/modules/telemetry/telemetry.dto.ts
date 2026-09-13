import { SensorType } from '../../models/sensor-reading.model';

export interface TelemetryReadingItem {
  sensorType: SensorType;
  value: number;
  unit?: string;
  timestamp?: string | Date;
  confidence?: number;
  metadata?: Record<string, unknown>;
}

export interface IngestTelemetryInput {
  deviceId?: string;
  userId?: string;
  batteryLevel?: number;
  readings: TelemetryReadingItem[];
}

export interface IngestTelemetryResult {
  ingestedCount: number;
  deviceId?: string;
  batteryLevel?: number;
  timestamp: string;
  alertsTriggered: number;
}

export interface LatestSensorItem {
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  confidence?: number;
}

export interface LatestTelemetrySummary {
  userId: string;
  device?: {
    deviceId: string;
    name?: string;
    status: string;
    batteryLevel?: number;
    lastSeenAt?: string;
  } | null;
  readings: Record<string, LatestSensorItem>;
  lastUpdated: string;
}

export const SENSOR_DEFAULT_UNITS: Record<SensorType, string> = {
  [SensorType.HEART_RATE]: 'bpm',
  [SensorType.RESTING_HEART_RATE]: 'bpm',
  [SensorType.SPO2]: '%',
  [SensorType.TEMPERATURE]: '°C',
  [SensorType.BLOOD_PRESSURE_SYSTOLIC]: 'mmHg',
  [SensorType.BLOOD_PRESSURE_DIASTOLIC]: 'mmHg',
  [SensorType.HRV]: 'ms',
  [SensorType.STEPS]: 'steps',
  [SensorType.CALORIES_BURNED]: 'kcal',
  [SensorType.DISTANCE]: 'km',
  [SensorType.SLEEP_HOURS]: 'hours',
  [SensorType.SLEEP_EFFICIENCY]: 'ratio',
  [SensorType.RESPIRATORY_RATE]: 'breaths/min',
  [SensorType.EMOTION]: 'label',
};

export const SENSOR_PHYSIOLOGICAL_LIMITS: Record<
  SensorType,
  { min: number; max: number; alertHigh?: number; alertLow?: number }
> = {
  [SensorType.HEART_RATE]: { min: 25, max: 250, alertLow: 40, alertHigh: 150 },
  [SensorType.RESTING_HEART_RATE]: { min: 30, max: 150, alertLow: 45, alertHigh: 100 },
  [SensorType.SPO2]: { min: 50, max: 100, alertLow: 90 },
  [SensorType.TEMPERATURE]: { min: 30.0, max: 45.0, alertLow: 35.0, alertHigh: 39.5 },
  [SensorType.BLOOD_PRESSURE_SYSTOLIC]: { min: 50, max: 260, alertLow: 85, alertHigh: 180 },
  [SensorType.BLOOD_PRESSURE_DIASTOLIC]: { min: 30, max: 160, alertLow: 50, alertHigh: 110 },
  [SensorType.HRV]: { min: 5, max: 300, alertLow: 15 },
  [SensorType.STEPS]: { min: 0, max: 200000 },
  [SensorType.CALORIES_BURNED]: { min: 0, max: 25000 },
  [SensorType.DISTANCE]: { min: 0, max: 500 },
  [SensorType.SLEEP_HOURS]: { min: 0, max: 24, alertLow: 4.0 },
  [SensorType.SLEEP_EFFICIENCY]: { min: 0, max: 1.0, alertLow: 0.5 },
  [SensorType.RESPIRATORY_RATE]: { min: 4, max: 60, alertLow: 8, alertHigh: 30 },
  [SensorType.EMOTION]: { min: 0, max: 10 },
};
