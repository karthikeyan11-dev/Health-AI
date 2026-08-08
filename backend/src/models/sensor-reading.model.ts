import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum SensorType {
  HEART_RATE = 'HEART_RATE',
  TEMPERATURE = 'TEMPERATURE',
  SPO2 = 'SPO2',
  EMOTION = 'EMOTION',
}

export interface ISensorReading {
  deviceId: string;
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISensorReadingDocument extends ISensorReading, Document {
  id: string;
}

const sensorReadingSchema = new Schema<ISensorReadingDocument>(
  {
    deviceId: {
      type: String,
      required: [true, 'Device identifier is required'],
      trim: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
      default: undefined,
    },
    sensorType: {
      type: String,
      enum: Object.values(SensorType),
      required: [true, 'Sensor type is required'],
      index: true,
    },
    value: {
      type: Number,
      required: [true, 'Sensor measurement value is required'],
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      trim: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
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

// Compound indexes for rapid time-series vital history and latest snapshot queries
sensorReadingSchema.index({ userId: 1, timestamp: -1 });
sensorReadingSchema.index({ userId: 1, sensorType: 1, timestamp: -1 });
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

export const SensorReadingModel: Model<ISensorReadingDocument> = model<ISensorReadingDocument>(
  'SensorReading',
  sensorReadingSchema,
  'sensor_readings',
);
