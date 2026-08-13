import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum ChatSessionStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED',
}

export interface IChatSession {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  title: string;
  context?: string;
  status: ChatSessionStatus;
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatSessionDocument extends IChatSession, Document {
  id: string;
}

const chatSessionSchema = new Schema<IChatSessionDocument>(
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
      required: true,
      default: 'Health Consultation Session',
      trim: true,
    },
    context: {
      type: String,
      trim: true,
      default: undefined,
    },
    status: {
      type: String,
      enum: Object.values(ChatSessionStatus),
      default: ChatSessionStatus.ACTIVE,
      required: true,
      index: true,
    },
    lastMessageAt: {
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

chatSessionSchema.index({ userId: 1, status: 1 });
chatSessionSchema.index({ userId: 1, lastMessageAt: -1 });

export const ChatSessionModel: Model<IChatSessionDocument> = model<IChatSessionDocument>(
  'ChatSession',
  chatSessionSchema,
  'chat_sessions',
);
