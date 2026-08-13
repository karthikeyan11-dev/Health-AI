import { Schema, model, type Document, type Model, Types } from 'mongoose';

export enum ReportType {
  DAILY_SUMMARY = 'DAILY_SUMMARY',
  WEEKLY_HEALTH_ANALYSIS = 'WEEKLY_HEALTH_ANALYSIS',
  CARDIOVASCULAR_RISK_REPORT = 'CARDIOVASCULAR_RISK_REPORT',
  STRESS_ANALYTICS = 'STRESS_ANALYTICS',
  COMPREHENSIVE_CLINICAL = 'COMPREHENSIVE_CLINICAL',
}

export enum ReportFormat {
  PDF = 'PDF',
  JSON = 'JSON',
  CSV = 'CSV',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface IReportMetadata {
  startDate?: Date;
  endDate?: Date;
  summaryMetrics?: Record<string, string | number | boolean | null | undefined>;
  [key: string]: string | number | boolean | object | Date | null | undefined;
}

export interface IReport {
  userId: Types.ObjectId;
  patientId?: Types.ObjectId;
  reportType: ReportType;
  format: ReportFormat;
  downloadUrl: string;
  status: ReportStatus;
  startDate?: Date;
  endDate?: Date;
  summary?: string;
  qrCodeToken?: string;
  expiresAt?: Date;
  generatedAt: Date;
  metadata?: IReportMetadata;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReportDocument extends IReport, Document {
  id: string;
}

const reportSchema = new Schema<IReportDocument>(
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
    reportType: {
      type: String,
      enum: Object.values(ReportType),
      required: [true, 'Report type classification is required'],
      index: true,
    },
    format: {
      type: String,
      enum: Object.values(ReportFormat),
      default: ReportFormat.PDF,
      required: true,
    },
    downloadUrl: {
      type: String,
      required: [true, 'Download URL path is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(ReportStatus),
      default: ReportStatus.COMPLETED,
      required: true,
      index: true,
    },
    startDate: {
      type: Date,
      default: undefined,
    },
    endDate: {
      type: Date,
      default: undefined,
    },
    summary: {
      type: String,
      trim: true,
      default: undefined,
    },
    qrCodeToken: {
      type: String,
      trim: true,
      default: undefined,
    },
    expiresAt: {
      type: Date,
      default: undefined,
    },
    generatedAt: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
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

reportSchema.index({ userId: 1, generatedAt: -1 });

export const ReportModel: Model<IReportDocument> = model<IReportDocument>(
  'Report',
  reportSchema,
  'reports',
);
