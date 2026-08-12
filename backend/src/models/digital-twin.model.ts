import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { EmotionType } from './stress-assessment.model';

export enum TwinHealthState {
  OPTIMAL = 'OPTIMAL',
  STABLE = 'STABLE',
  ELEVATED_STRESS = 'ELEVATED_STRESS',
  AT_RISK = 'AT_RISK',
  CRITICAL = 'CRITICAL',
}

export interface IDigitalTwin {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  overallHealthScore: number;
  healthState: TwinHealthState;
  baselineHeartRate: number;
  baselineTemperature: number;
  baselineSpO2: number;
  dominantEmotion: EmotionType;
  currentStressScore: number;
  currentCardioRiskScore: number;
  confidence?: number;
  lastSyncTimestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IDigitalTwinDocument extends IDigitalTwin, Document {
  id: string;
}

const digitalTwinSchema = new Schema<IDigitalTwinDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
      unique: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      unique: true,
      sparse: true,
      index: true,
      default: undefined,
    },
    overallHealthScore: {
      type: Number,
      required: true,
      default: 100,
      min: [0, 'Overall health score cannot be below 0'],
      max: [100, 'Overall health score cannot exceed 100'],
    },
    healthState: {
      type: String,
      enum: Object.values(TwinHealthState),
      default: TwinHealthState.OPTIMAL,
      required: true,
      index: true,
    },
    baselineHeartRate: {
      type: Number,
      required: true,
      default: 72.0,
    },
    baselineTemperature: {
      type: Number,
      required: true,
      default: 36.5,
    },
    baselineSpO2: {
      type: Number,
      required: true,
      default: 98.0,
    },
    dominantEmotion: {
      type: String,
      enum: Object.values(EmotionType),
      default: EmotionType.NEUTRAL,
      required: true,
    },
    currentStressScore: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Stress score cannot be below 0'],
      max: [100, 'Stress score cannot exceed 100'],
    },
    currentCardioRiskScore: {
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
    lastSyncTimestamp: {
      type: Date,
      required: true,
      default: Date.now,
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

export const DigitalTwinModel: Model<IDigitalTwinDocument> = model<IDigitalTwinDocument>(
  'DigitalTwin',
  digitalTwinSchema,
  'digital_twins',
);
