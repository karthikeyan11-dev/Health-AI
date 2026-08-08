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
  isAcknowledged: boolean;
  acknowledgedAt?: Date | null;
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

recommendationSchema.index({ userId: 1, isAcknowledged: 1, priority: -1 });

export const RecommendationModel: Model<IRecommendationDocument> = model<IRecommendationDocument>(
  'Recommendation',
  recommendationSchema,
  'recommendations',
);
