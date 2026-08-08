import { Schema, model, type Document, type Model } from 'mongoose';

export enum UserRole {
  PATIENT = 'PATIENT',
  CLINICIAN = 'CLINICIAN',
  ADMIN = 'ADMIN',
  SYSTEM = 'SYSTEM',
}

export interface IUser {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  id: string;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      default: undefined,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PATIENT,
      required: true,
      index: true,
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
      transform: (_doc, ret: Record<string, unknown>): Record<string, unknown> => {
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema, 'users');
