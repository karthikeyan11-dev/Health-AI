import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum StressLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  SEVERE = 'SEVERE',
}

export enum EmotionType {
  ANGRY = 'Angry',
  DISGUST = 'Disgust',
  FEAR = 'Fear',
  HAPPY = 'Happy',
  NEUTRAL = 'Neutral',
  SAD = 'Sad',
  SURPRISE = 'Surprise',
}

export interface IStressAssessment {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  stressScore: number;
  stressLevel: StressLevel;
  contributingFactors: string[];
  confidence?: number;
  heartRate?: number;
  temperature?: number;
  spo2?: number;
  currentEmotion?: EmotionType;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IStressAssessmentDocument extends IStressAssessment, Document {
  id: string;
}

const stressAssessmentSchema = new Schema<IStressAssessmentDocument>(
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
    stressScore: {
      type: Number,
      required: [true, 'Stress score is required'],
      min: [0, 'Stress score cannot be below 0'],
      max: [100, 'Stress score cannot exceed 100'],
    },
    stressLevel: {
      type: String,
      enum: Object.values(StressLevel),
      required: [true, 'Stress level category is required'],
      index: true,
    },
    contributingFactors: {
      type: [String],
      default: [],
      required: true,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be below 0'],
      max: [100, 'Confidence cannot exceed 100'],
      default: undefined,
    },
    heartRate: {
      type: Number,
      default: undefined,
    },
    temperature: {
      type: Number,
      default: undefined,
    },
    spo2: {
      type: Number,
      default: undefined,
    },
    currentEmotion: {
      type: String,
      enum: Object.values(EmotionType),
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

stressAssessmentSchema.index({ userId: 1, timestamp: -1 });

export const StressAssessmentModel: Model<IStressAssessmentDocument> =
  model<IStressAssessmentDocument>(
    'StressAssessment',
    stressAssessmentSchema,
    'stress_assessments',
  );
