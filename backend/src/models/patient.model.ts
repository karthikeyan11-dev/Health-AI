import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

export enum ActivityLevel {
  SEDENTARY = 'SEDENTARY',
  LIGHTLY_ACTIVE = 'LIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export interface IEmergencyContact {
  name?: string;
  relationship?: string;
  phoneNumber?: string;
}

export interface IPatient {
  userId: Types.ObjectId;
  dateOfBirth?: Date;
  gender?: Gender;
  bloodType?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  smokingStatus?: number;
  familyHistoryCvd?: number;
  activityLevel?: ActivityLevel;
  dailyStepGoal?: number;
  targetSleepHours?: number;
  emergencyContact?: IEmergencyContact;
  medicalHistorySummary?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPatientDocument extends IPatient, Document {
  id: string;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
  },
  { _id: false },
);

const patientSchema = new Schema<IPatientDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference ID is required'],
      unique: true,
      index: true,
    },
    dateOfBirth: {
      type: Date,
      default: undefined,
    },
    gender: {
      type: String,
      enum: Object.values(Gender),
      default: undefined,
    },
    bloodType: {
      type: String,
      trim: true,
      default: undefined,
    },
    heightCm: {
      type: Number,
      min: [30, 'Height must be at least 30 cm'],
      max: [300, 'Height cannot exceed 300 cm'],
      default: undefined,
    },
    weightKg: {
      type: Number,
      min: [1, 'Weight must be at least 1 kg'],
      max: [500, 'Weight cannot exceed 500 kg'],
      default: undefined,
    },
    bmi: {
      type: Number,
      min: [5, 'BMI must be at least 5'],
      max: [100, 'BMI cannot exceed 100'],
      default: undefined,
    },
    smokingStatus: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    familyHistoryCvd: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    activityLevel: {
      type: String,
      enum: Object.values(ActivityLevel),
      default: ActivityLevel.MODERATELY_ACTIVE,
    },
    dailyStepGoal: {
      type: Number,
      min: [500, 'Step goal must be at least 500'],
      max: [100000, 'Step goal cannot exceed 100,000'],
      default: 8000,
    },
    targetSleepHours: {
      type: Number,
      min: [3, 'Sleep target must be at least 3 hours'],
      max: [16, 'Sleep target cannot exceed 16 hours'],
      default: 8.0,
    },
    emergencyContact: {
      type: emergencyContactSchema,
      default: undefined,
    },
    medicalHistorySummary: {
      type: String,
      trim: true,
      default: undefined,
    },
    isActive: {
      type: Boolean,
      default: true,
      required: true,
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

export const PatientModel: Model<IPatientDocument> = model<IPatientDocument>(
  'Patient',
  patientSchema,
  'patients',
);
