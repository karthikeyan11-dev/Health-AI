import { Schema, model, type Document, type Model, Types } from 'mongoose';

import { SensorType } from './sensor-reading.model';

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
  UNREGISTERED = 'UNREGISTERED',
}

export enum DeviceType {
  SMARTWATCH = 'SMARTWATCH',
  ESP32_MULTI_SENSOR = 'ESP32_MULTI_SENSOR',
  SMART_BP_CUFF = 'SMART_BP_CUFF',
  BLE_PULSE_OXIMETER = 'BLE_PULSE_OXIMETER',
  FITNESS_BAND = 'FITNESS_BAND',
  SMART_RING = 'SMART_RING',
  OTHER = 'OTHER',
}

export enum ConnectionProtocol {
  BLE = 'BLE',
  WIFI = 'WIFI',
  COMPANION_APP = 'COMPANION_APP',
  WEBSOCKET = 'WEBSOCKET',
  MQTT = 'MQTT',
}

export interface IDevice {
  deviceId: string;
  name?: string;
  macAddress: string;
  deviceType: DeviceType | string;
  supportedSensors: SensorType[];
  batteryLevel?: number;
  connectionProtocol?: ConnectionProtocol | string;
  syncFrequencySeconds?: number;
  firmwareVersion: string;
  status: DeviceStatus;
  userId?: Types.ObjectId;
  patientId?: Types.ObjectId;
  isActive: boolean;
  lastSeenAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDeviceDocument extends IDevice, Document {
  id: string;
}

const deviceSchema = new Schema<IDeviceDocument>(
  {
    deviceId: {
      type: String,
      required: [true, 'Device identifier is required'],
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: undefined,
    },
    macAddress: {
      type: String,
      required: [true, 'Hardware MAC address is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    deviceType: {
      type: String,
      required: true,
      default: DeviceType.SMARTWATCH,
      trim: true,
    },
    supportedSensors: {
      type: [String],
      enum: Object.values(SensorType),
      default: [
        SensorType.HEART_RATE,
        SensorType.RESTING_HEART_RATE,
        SensorType.SPO2,
        SensorType.TEMPERATURE,
        SensorType.HRV,
        SensorType.STEPS,
        SensorType.CALORIES_BURNED,
        SensorType.SLEEP_HOURS,
      ],
    },
    batteryLevel: {
      type: Number,
      min: [0, 'Battery level cannot be negative'],
      max: [100, 'Battery level cannot exceed 100'],
      default: 100,
    },
    connectionProtocol: {
      type: String,
      enum: Object.values(ConnectionProtocol),
      default: ConnectionProtocol.BLE,
    },
    syncFrequencySeconds: {
      type: Number,
      min: [1, 'Sync frequency must be at least 1 second'],
      default: 5,
    },
    firmwareVersion: {
      type: String,
      required: true,
      default: 'v1.0.0',
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(DeviceStatus),
      default: DeviceStatus.UNREGISTERED,
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: undefined,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
      index: true,
    },
    lastSeenAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (
        _doc,
        ret: Record<string, string | number | boolean | object | Date | null | undefined>,
      ): Record<string, string | number | boolean | object | Date | null | undefined> => {
        delete ret.__v;
        return ret;
      },
    },
  },
);

export const DeviceModel: Model<IDeviceDocument> = model<IDeviceDocument>(
  'Device',
  deviceSchema,
  'devices',
);
