import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum SensorType {
  HEART_RATE = 'HEART_RATE',
  RESTING_HEART_RATE = 'RESTING_HEART_RATE',
  SPO2 = 'SPO2',
  TEMPERATURE = 'TEMPERATURE',
  BLOOD_PRESSURE_SYSTOLIC = 'BLOOD_PRESSURE_SYSTOLIC',
  BLOOD_PRESSURE_DIASTOLIC = 'BLOOD_PRESSURE_DIASTOLIC',
  HRV = 'HRV',
  STEPS = 'STEPS',
  CALORIES_BURNED = 'CALORIES_BURNED',
  DISTANCE = 'DISTANCE',
  SLEEP_HOURS = 'SLEEP_HOURS',
  SLEEP_EFFICIENCY = 'SLEEP_EFFICIENCY',
  RESPIRATORY_RATE = 'RESPIRATORY_RATE',
  EMOTION = 'EMOTION',
}

export interface ISensorReading {
  deviceId: string;
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  sensorType: SensorType;
  value: number;
  unit: string;
  confidence?: number;
  metadata?: Record<string, unknown>;
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
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be negative'],
      max: [100, 'Confidence cannot exceed 100'],
      default: undefined,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
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

// Compound indexes for rapid time-series vital history and latest snapshot queries
sensorReadingSchema.index({ userId: 1, timestamp: -1 });
sensorReadingSchema.index({ userId: 1, sensorType: 1, timestamp: -1 });
sensorReadingSchema.index({ deviceId: 1, timestamp: -1 });

export const SensorReadingModel: Model<ISensorReadingDocument> = model<ISensorReadingDocument>(
  'SensorReading',
  sensorReadingSchema,
  'sensor_readings',
);
