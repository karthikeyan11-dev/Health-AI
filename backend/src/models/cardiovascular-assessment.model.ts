import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { EmotionType } from './stress-assessment.model';

export enum CardiovascularRiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ICardiovascularAssessment {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  riskScore: number;
  riskLevel: CardiovascularRiskLevel;
  contributingFactors?: string[];
  confidence?: number;
  explanation?: string;
  recommendations: string[];
  heartRate: number;
  spo2: number;
  temperature: number;
  currentEmotion?: EmotionType;
  stressScore?: number;
  digitalTwinHealthScore?: number;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICardiovascularAssessmentDocument extends ICardiovascularAssessment, Document {
  id: string;
}

const cardiovascularAssessmentSchema = new Schema<ICardiovascularAssessmentDocument>(
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
    riskScore: {
      type: Number,
      required: [true, 'Risk score is required'],
      min: [0, 'Risk score cannot be below 0'],
      max: [100, 'Risk score cannot exceed 100'],
    },
    riskLevel: {
      type: String,
      enum: Object.values(CardiovascularRiskLevel),
      required: [true, 'Cardiovascular risk level category is required'],
      index: true,
    },
    contributingFactors: {
      type: [String],
      default: [],
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be below 0'],
      max: [100, 'Confidence cannot exceed 100'],
      default: undefined,
    },
    explanation: {
      type: String,
      trim: true,
      default: undefined,
    },
    recommendations: {
      type: [String],
      default: [],
      required: true,
    },
    heartRate: {
      type: Number,
      required: [true, 'Continuous PPG heart rate measurement is required'],
    },
    spo2: {
      type: Number,
      required: [true, 'Continuous blood oxygen SpO2 measurement is required'],
    },
    temperature: {
      type: Number,
      required: [true, 'Continuous body temperature measurement is required'],
    },
    currentEmotion: {
      type: String,
      enum: Object.values(EmotionType),
      default: undefined,
    },
    stressScore: {
      type: Number,
      default: undefined,
    },
    digitalTwinHealthScore: {
      type: Number,
      default: undefined,
    },
    systolicBp: {
      type: Number,
      default: null,
    },
    diastolicBp: {
      type: Number,
      default: null,
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

cardiovascularAssessmentSchema.index({ userId: 1, timestamp: -1 });

export const CardiovascularAssessmentModel: Model<ICardiovascularAssessmentDocument> =
  model<ICardiovascularAssessmentDocument>(
    'CardiovascularAssessment',
    cardiovascularAssessmentSchema,
    'cardiovascular_assessments',
  );
