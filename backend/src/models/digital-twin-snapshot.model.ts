import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { EmotionType, TwinHealthState } from './digital-twin.model';

export enum SnapshotTriggerReason {
  TELEMETRY_SYNC = 'TELEMETRY_SYNC',
  STATE_TRANSITION = 'STATE_TRANSITION',
  BASELINE_CALIBRATION = 'BASELINE_CALIBRATION',
  ASSESSMENT_COMPLETED = 'ASSESSMENT_COMPLETED',
  MANUAL_SYNC = 'MANUAL_SYNC',
}

export interface IDigitalTwinSnapshot {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  digitalTwinId: Types.ObjectId;
  overallHealthScore: number;
  healthState: TwinHealthState;
  heartRate?: number;
  spO2?: number;
  temperature?: number;
  dominantEmotion: EmotionType;
  stressScore: number;
  cardioRiskScore: number;
  confidence?: number;
  triggerReason: SnapshotTriggerReason;
  version: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDigitalTwinSnapshotDocument extends IDigitalTwinSnapshot, Document {
  id: string;
}

const digitalTwinSnapshotSchema = new Schema<IDigitalTwinSnapshotDocument>(
  {
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
    digitalTwinId: {
      type: Schema.Types.ObjectId,
      ref: 'DigitalTwin',
      required: [true, 'Digital Twin reference ID is required'],
      index: true,
    },
    overallHealthScore: {
      type: Number,
      required: true,
      min: [0, 'Overall health score cannot be below 0'],
      max: [100, 'Overall health score cannot exceed 100'],
    },
    healthState: {
      type: String,
      enum: Object.values(TwinHealthState),
      required: true,
      index: true,
    },
    heartRate: {
      type: Number,
      default: undefined,
    },
    spO2: {
      type: Number,
      default: undefined,
    },
    temperature: {
      type: Number,
      default: undefined,
    },
    dominantEmotion: {
      type: String,
      enum: Object.values(EmotionType),
      default: EmotionType.NEUTRAL,
      required: true,
    },
    stressScore: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Stress score cannot be below 0'],
      max: [100, 'Stress score cannot exceed 100'],
    },
    cardioRiskScore: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Cardiovascular risk score cannot be below 0'],
      max: [100, 'Cardiovascular risk score cannot exceed 100'],
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be below 0'],
      max: [100, 'Confidence cannot exceed 100'],
      default: undefined,
    },
    triggerReason: {
      type: String,
      enum: Object.values(SnapshotTriggerReason),
      required: true,
      default: SnapshotTriggerReason.TELEMETRY_SYNC,
      index: true,
    },
    version: {
      type: Number,
      required: true,
      min: [1, 'Version must be at least 1'],
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

// Compound indexes for high-performance chronological querying and time-travel reconstruction
digitalTwinSnapshotSchema.index({ userId: 1, timestamp: -1 });
digitalTwinSnapshotSchema.index({ userId: 1, version: -1 });
digitalTwinSnapshotSchema.index({ userId: 1, triggerReason: 1 });

export const DigitalTwinSnapshotModel: Model<IDigitalTwinSnapshotDocument> =
  model<IDigitalTwinSnapshotDocument>(
    'DigitalTwinSnapshot',
    digitalTwinSnapshotSchema,
    'digital_twin_snapshots',
  );
