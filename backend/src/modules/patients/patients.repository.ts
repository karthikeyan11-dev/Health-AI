import { UserModel, type IUserDocument } from '@models/user.model';
import { PatientModel, type IPatientDocument } from '@models/patient.model';
import { DeviceModel, type IDeviceDocument } from '@models/device.model';
import {
  SensorReadingModel,
  SensorType,
  type ISensorReadingDocument,
} from '@models/sensor-reading.model';
import {
  CardiovascularAssessmentModel,
  type ICardiovascularAssessmentDocument,
} from '@models/cardiovascular-assessment.model';
import {
  StressAssessmentModel,
  type IStressAssessmentDocument,
} from '@models/stress-assessment.model';
import { DigitalTwinModel, type IDigitalTwinDocument } from '@models/digital-twin.model';
import { RecommendationModel, type IRecommendationDocument } from '@models/recommendation.model';
import { logger } from '@config/logger';

export class PatientsRepository {
  /**
   * Finds user document by ID. Returns null if invalid or not found.
   */
  public async findUserById(userId: string): Promise<IUserDocument | null> {
    try {
      if (userId && userId.match(/^[0-9a-fA-F]{24}$/)) {
        return await UserModel.findById(userId).exec();
      }
      return null;
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findUserById - Error');
      throw error;
    }
  }

  /**
   * Finds patient profile document by userId.
   */
  public async findPatientByUserId(userId: string): Promise<IPatientDocument | null> {
    try {
      return await PatientModel.findOne({ userId }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findPatientByUserId - Error');
      return null;
    }
  }

  /**
   * Finds connected device for patient.
   */
  public async findDeviceByUserId(userId: string): Promise<IDeviceDocument | null> {
    try {
      return await DeviceModel.findOne({ userId }).sort({ updatedAt: -1 }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findDeviceByUserId - Error');
      return null;
    }
  }

  /**
   * Finds latest sensor reading for given sensor type.
   */
  public async findLatestReading(
    userId: string,
    sensorType: SensorType,
  ): Promise<ISensorReadingDocument | null> {
    try {
      return await SensorReadingModel.findOne({ userId, sensorType })
        .sort({ timestamp: -1 })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, sensorType },
        'PatientsRepository.findLatestReading - Error',
      );
      return null;
    }
  }

  /**
   * Finds recent sensor readings for trend chart.
   */
  public async findRecentReadings(userId: string, limit = 20): Promise<ISensorReadingDocument[]> {
    try {
      return await SensorReadingModel.find({ userId }).sort({ timestamp: -1 }).limit(limit).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findRecentReadings - Error');
      return [];
    }
  }

  /**
   * Finds latest cardiovascular risk assessment.
   */
  public async findLatestCardiovascularAssessment(
    userId: string,
  ): Promise<ICardiovascularAssessmentDocument | null> {
    try {
      return await CardiovascularAssessmentModel.findOne({ userId }).sort({ timestamp: -1 }).exec();
    } catch (error) {
      logger.error(
        { err: error, userId },
        'PatientsRepository.findLatestCardiovascularAssessment - Error',
      );
      return null;
    }
  }

  /**
   * Finds latest stress assessment.
   */
  public async findLatestStressAssessment(
    userId: string,
  ): Promise<IStressAssessmentDocument | null> {
    try {
      return await StressAssessmentModel.findOne({ userId }).sort({ timestamp: -1 }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findLatestStressAssessment - Error');
      return null;
    }
  }

  /**
   * Finds digital twin state for patient.
   */
  public async findDigitalTwin(userId: string): Promise<IDigitalTwinDocument | null> {
    try {
      return await DigitalTwinModel.findOne({ userId }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findDigitalTwin - Error');
      return null;
    }
  }

  /**
   * Finds active recommendations for patient.
   */
  public async findActiveRecommendations(
    userId: string,
    limit = 5,
  ): Promise<IRecommendationDocument[]> {
    try {
      return await RecommendationModel.find({ userId, isAcknowledged: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findActiveRecommendations - Error');
      return [];
    }
  }

  /**
   * Finds all devices belonging to patient.
   */
  public async findAllDevicesByUserId(userId: string): Promise<IDeviceDocument[]> {
    try {
      return await DeviceModel.find({ userId }).sort({ updatedAt: -1 }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'PatientsRepository.findAllDevicesByUserId - Error');
      return [];
    }
  }

  /**
   * Finds time-series sensor readings with optional time-range and device filtering.
   */
  public async findSensorReadingsFiltered(
    userId: string,
    filter: {
      deviceId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    } = {},
  ): Promise<ISensorReadingDocument[]> {
    try {
      const query: Record<string, unknown> = {
        userId,
        sensorType: { $in: [SensorType.HEART_RATE, SensorType.SPO2, SensorType.TEMPERATURE] },
      };

      if (filter.deviceId) {
        query.deviceId = filter.deviceId;
      }

      if (filter.startDate || filter.endDate) {
        const timestampQuery: Record<string, Date> = {};
        if (filter.startDate) timestampQuery.$gte = filter.startDate;
        if (filter.endDate) timestampQuery.$lte = filter.endDate;
        query.timestamp = timestampQuery;
      }

      return await SensorReadingModel.find(query)
        .sort({ timestamp: 1 })
        .limit(filter.limit || 500)
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, filter },
        'PatientsRepository.findSensorReadingsFiltered - Error',
      );
      return [];
    }
  }
}

export const patientsRepository = new PatientsRepository();
