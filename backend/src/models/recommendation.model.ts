import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum RecommendationCategory {
  LIFESTYLE = 'LIFESTYLE',
  EXERCISE = 'EXERCISE',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
  STRESS_RELIEF = 'STRESS_RELIEF',
  CLINICAL_ALERT = 'CLINICAL_ALERT',
}

export enum RecommendationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface IRecommendation {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  title: string;
  description: string;
  category: RecommendationCategory;
  priority: RecommendationPriority;
  source?: string;
  relatedAssessmentId?: Types.ObjectId;
  relatedAssessmentType?: string;
  isAcknowledged: boolean;
  acknowledgedAt?: Date | null;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecommendationDocument extends IRecommendation, Document {
  id: string;
}

const recommendationSchema = new Schema<IRecommendationDocument>(
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
    title: {
      type: String,
      required: [true, 'Recommendation title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Recommendation description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: Object.values(RecommendationCategory),
      required: [true, 'Recommendation category is required'],
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(RecommendationPriority),
      default: RecommendationPriority.MEDIUM,
      required: true,
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: undefined,
    },
    relatedAssessmentId: {
      type: Schema.Types.ObjectId,
      default: undefined,
    },
    relatedAssessmentType: {
      type: String,
      trim: true,
      default: undefined,
    },
    isAcknowledged: {
      type: Boolean,
      default: false,
      required: true,
      index: true,
    },
    acknowledgedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
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

recommendationSchema.index({ userId: 1, isAcknowledged: 1, priority: -1 });

export const RecommendationModel: Model<IRecommendationDocument> = model<IRecommendationDocument>(
  'Recommendation',
  recommendationSchema,
  'recommendations',
);
