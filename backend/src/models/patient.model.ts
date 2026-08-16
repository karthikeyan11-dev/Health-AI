import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
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
