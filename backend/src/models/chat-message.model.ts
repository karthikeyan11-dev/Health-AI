import { Schema, model, type Document, type Model, Types } from 'mongoose';
import { EmotionType } from './stress-assessment.model';

export enum ChatSender {
  USER = 'USER',
  BOT = 'BOT',
  SYSTEM = 'SYSTEM',
}

export interface IChatMessage {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  sender: ChatSender;
  message: string;
  intent?: string;
  detectedEmotion?: EmotionType;
  healthContextUsed?: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessageDocument extends IChatMessage, Document {
  id: string;
}

const chatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: [true, 'Chat session reference ID is required'],
      index: true,
    },
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
    sender: {
      type: String,
      enum: Object.values(ChatSender),
      required: [true, 'Sender role is required'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
    },
    intent: {
      type: String,
      trim: true,
      default: undefined,
    },
    detectedEmotion: {
      type: String,
      enum: Object.values(EmotionType),
      default: undefined,
    },
    healthContextUsed: {
      type: String,
      trim: true,
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

chatMessageSchema.index({ sessionId: 1, timestamp: 1 });
chatMessageSchema.index({ userId: 1, timestamp: -1 });

export const ChatMessageModel: Model<IChatMessageDocument> = model<IChatMessageDocument>(
  'ChatMessage',
  chatMessageSchema,
  'chat_messages',
);
