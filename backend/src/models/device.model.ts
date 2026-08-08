import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum DeviceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  ERROR = 'ERROR',
  UNREGISTERED = 'UNREGISTERED',
}

export interface IDevice {
  deviceId: string;
  macAddress: string;
  deviceType: string;
  firmwareVersion: string;
  status: DeviceStatus;
  userId?: Types.ObjectId;
  patientId?: Types.ObjectId;
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
      default: 'ESP32-MULTI-SENSOR',
      trim: true,
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
    lastSeenAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
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
