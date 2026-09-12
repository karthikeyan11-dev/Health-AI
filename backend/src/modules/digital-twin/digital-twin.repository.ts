import { Types } from 'mongoose';
import { logger } from '@config/logger';
import {
  DigitalTwinModel,
  type IDigitalTwin,
  type IDigitalTwinDocument,
} from '../../models/digital-twin.model';
import {
  DigitalTwinSnapshotModel,
  type IDigitalTwinSnapshot,
  type IDigitalTwinSnapshotDocument,
  type SnapshotTriggerReason,
} from '../../models/digital-twin-snapshot.model';
import { UserModel, type IUserDocument } from '../../models/user.model';
import { PatientModel, type IPatientDocument } from '../../models/patient.model';
import {
  SensorReadingModel,
  SensorType,
  type ISensorReadingDocument,
} from '../../models/sensor-reading.model';
import {
  CardiovascularAssessmentModel,
  type ICardiovascularAssessmentDocument,
} from '../../models/cardiovascular-assessment.model';
import {
  StressAssessmentModel,
  type IStressAssessmentDocument,
} from '../../models/stress-assessment.model';

export class DigitalTwinRepository {
  /**
   * Finds a Digital Twin document by its associated userId.
   */
  public async findByUserId(userId: string): Promise<IDigitalTwinDocument | null> {
    try {
      return await DigitalTwinModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findByUserId - Error');
      throw error;
    }
  }

  /**
   * Creates a new Digital Twin instance.
   */
  public async create(data: Partial<IDigitalTwin>): Promise<IDigitalTwinDocument> {
    try {
      return await DigitalTwinModel.create(data);
    } catch (error) {
      logger.error({ err: error, data }, 'DigitalTwinRepository.create - Error');
      throw error;
    }
  }

  /**
   * Updates an existing Digital Twin instance by userId with optional atomic version incrementation.
   */
  public async updateByUserId(
    userId: string,
    data: Partial<IDigitalTwin>,
    incrementVersion = false,
  ): Promise<IDigitalTwinDocument | null> {
    try {
      const updatePayload: {
        $set: Partial<IDigitalTwin>;
        $inc?: { version: number };
      } = {
        $set: data,
      };

      if (incrementVersion) {
        updatePayload.$inc = { version: 1 };
      }

      return await DigitalTwinModel.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        updatePayload,
        { new: true },
      ).exec();
    } catch (error) {
      logger.error({ err: error, userId, data }, 'DigitalTwinRepository.updateByUserId - Error');
      throw error;
    }
  }

  /**
   * Appends an immutable Digital Twin snapshot record to the ledger.
   */
  public async createSnapshot(
    data: Partial<IDigitalTwinSnapshot>,
  ): Promise<IDigitalTwinSnapshotDocument> {
    try {
      return await DigitalTwinSnapshotModel.create(data);
    } catch (error) {
      logger.error({ err: error, data }, 'DigitalTwinRepository.createSnapshot - Error');
      throw error;
    }
  }

  /**
   * Finds the latest immutable snapshot for a given user ID.
   */
  public async findLatestSnapshot(userId: string): Promise<IDigitalTwinSnapshotDocument | null> {
    try {
      return await DigitalTwinSnapshotModel.findOne({ userId: new Types.ObjectId(userId) })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findLatestSnapshot - Error');
      throw error;
    }
  }

  /**
   * Finds paginated historical snapshots with optional date range and trigger reason filters.
   */
  public async findSnapshots(
    userId: string,
    options: {
      page?: number;
      limit?: number;
      startDate?: Date;
      endDate?: Date;
      trigger?: SnapshotTriggerReason;
    } = {},
  ): Promise<{ items: IDigitalTwinSnapshotDocument[]; total: number }> {
    try {
      const page = Math.max(1, options.page ?? 1);
      const limit = Math.max(1, Math.min(100, options.limit ?? 10));
      const skip = (page - 1) * limit;

      const filter: Record<string, unknown> = {
        userId: new Types.ObjectId(userId),
      };

      if (options.startDate || options.endDate) {
        const timeFilter: Record<string, Date> = {};
        if (options.startDate) timeFilter.$gte = options.startDate;
        if (options.endDate) timeFilter.$lte = options.endDate;
        filter.timestamp = timeFilter;
      }

      if (options.trigger) {
        filter.triggerReason = options.trigger;
      }

      const [items, total] = await Promise.all([
        DigitalTwinSnapshotModel.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        DigitalTwinSnapshotModel.countDocuments(filter).exec(),
      ]);

      return { items, total };
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findSnapshots - Error');
      throw error;
    }
  }

  /**
   * Finds a user document by ID.
   */
  public async findUserById(userId: string): Promise<IUserDocument | null> {
    try {
      return await UserModel.findById(userId).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findUserById - Error');
      throw error;
    }
  }

  /**
   * Finds a patient document by user ID.
   */
  public async findPatientByUserId(userId: string): Promise<IPatientDocument | null> {
    try {
      return await PatientModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findPatientByUserId - Error');
      throw error;
    }
  }

  /**
   * Finds the latest sensor readings for each primary vital sign.
   */
  public async findLatestReadings(userId: string): Promise<{
    heartRate?: ISensorReadingDocument | null;
    spo2?: ISensorReadingDocument | null;
    temperature?: ISensorReadingDocument | null;
  }> {
    try {
      const userObjectId = new Types.ObjectId(userId);
      const [heartRate, spo2, temperature] = await Promise.all([
        SensorReadingModel.findOne({ userId: userObjectId, sensorType: SensorType.HEART_RATE })
          .sort({ timestamp: -1 })
          .exec(),
        SensorReadingModel.findOne({ userId: userObjectId, sensorType: SensorType.SPO2 })
          .sort({ timestamp: -1 })
          .exec(),
        SensorReadingModel.findOne({ userId: userObjectId, sensorType: SensorType.TEMPERATURE })
          .sort({ timestamp: -1 })
          .exec(),
      ]);

      return { heartRate, spo2, temperature };
    } catch (error) {
      logger.error({ err: error, userId }, 'DigitalTwinRepository.findLatestReadings - Error');
      throw error;
    }
  }

  /**
   * Finds historical sensor readings since a given start date.
   */
  public async findHistoricalSensorReadings(
    userId: string,
    startDate: Date,
  ): Promise<ISensorReadingDocument[]> {
    try {
      return await SensorReadingModel.find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      })
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, startDate },
        'DigitalTwinRepository.findHistoricalSensorReadings - Error',
      );
      throw error;
    }
  }

  /**
   * Finds the latest cardiovascular risk assessment.
   */
  public async findLatestCardioAssessment(
    userId: string,
  ): Promise<ICardiovascularAssessmentDocument | null> {
    try {
      return await CardiovascularAssessmentModel.findOne({ userId: new Types.ObjectId(userId) })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId },
        'DigitalTwinRepository.findLatestCardioAssessment - Error',
      );
      throw error;
    }
  }

  /**
   * Finds historical cardiovascular risk assessments since a given start date.
   */
  public async findHistoricalCardioAssessments(
    userId: string,
    startDate: Date,
  ): Promise<ICardiovascularAssessmentDocument[]> {
    try {
      return await CardiovascularAssessmentModel.find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      })
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, startDate },
        'DigitalTwinRepository.findHistoricalCardioAssessments - Error',
      );
      throw error;
    }
  }

  /**
   * Finds the latest autonomic stress assessment.
   */
  public async findLatestStressAssessment(
    userId: string,
  ): Promise<IStressAssessmentDocument | null> {
    try {
      return await StressAssessmentModel.findOne({ userId: new Types.ObjectId(userId) })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId },
        'DigitalTwinRepository.findLatestStressAssessment - Error',
      );
      throw error;
    }
  }

  /**
   * Finds historical stress assessments since a given start date.
   */
  public async findHistoricalStressAssessments(
    userId: string,
    startDate: Date,
  ): Promise<IStressAssessmentDocument[]> {
    try {
      return await StressAssessmentModel.find({
        userId: new Types.ObjectId(userId),
        timestamp: { $gte: startDate },
      })
        .sort({ timestamp: 1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, startDate },
        'DigitalTwinRepository.findHistoricalStressAssessments - Error',
      );
      throw error;
    }
  }
}

export const digitalTwinRepository = new DigitalTwinRepository();
