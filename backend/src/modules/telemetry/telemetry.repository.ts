import { Types } from 'mongoose';
import {
  SensorReadingModel,
  type ISensorReadingDocument,
  SensorType,
} from '../../models/sensor-reading.model';
import { DeviceModel, type IDeviceDocument, DeviceStatus } from '../../models/device.model';
import { PatientModel, type IPatientDocument } from '../../models/patient.model';
import { logger } from '../../config/logger';
import { InternalServerError } from '../../shared/errors/httpErrors';

export class TelemetryRepository {
  constructor(
    private readonly sensorReadingModel: typeof SensorReadingModel = SensorReadingModel,
    private readonly deviceModel: typeof DeviceModel = DeviceModel,
    private readonly patientModel: typeof PatientModel = PatientModel,
  ) {}

  /**
   * Bulk inserts telemetry readings into MongoDB.
   */
  public async insertManyReadings(
    readings: Array<{
      userId: Types.ObjectId;
      patientId?: Types.ObjectId;
      deviceId?: string;
      sensorType: SensorType;
      value: number;
      unit: string;
      confidence?: number;
      metadata?: Record<string, unknown>;
      timestamp: Date;
    }>,
  ): Promise<ISensorReadingDocument[]> {
    try {
      const inserted = await this.sensorReadingModel.insertMany(readings, {
        ordered: false,
      });
      return inserted as unknown as ISensorReadingDocument[];
    } catch (error) {
      logger.error({ err: error }, 'TelemetryRepository.insertManyReadings - Error');
      throw new InternalServerError('Failed to persist sensor telemetry readings');
    }
  }

  /**
   * Updates device heartbeat, status, and battery telemetry.
   */
  public async updateDeviceHeartbeat(
    userId: string,
    deviceId?: string,
    batteryLevel?: number,
  ): Promise<IDeviceDocument | null> {
    try {
      const filter: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
      if (deviceId) {
        filter.deviceId = deviceId;
      }

      const update: Record<string, unknown> = {
        lastSeenAt: new Date(),
        status: DeviceStatus.ONLINE,
      };
      if (batteryLevel !== undefined) {
        update.batteryLevel = batteryLevel;
      }

      return await this.deviceModel
        .findOneAndUpdate(filter, { $set: update }, { new: true })
        .exec();
    } catch (error) {
      logger.error(
        { err: error, userId, deviceId },
        'TelemetryRepository.updateDeviceHeartbeat - Error',
      );
      throw new InternalServerError('Failed to update device heartbeat telemetry');
    }
  }

  /**
   * Finds patient record associated with userId.
   */
  public async findPatientByUserId(userId: string): Promise<IPatientDocument | null> {
    try {
      return await this.patientModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'TelemetryRepository.findPatientByUserId - Error');
      throw new InternalServerError('Failed to find patient profile');
    }
  }

  /**
   * Finds the latest reading for each sensor type for a given user.
   */
  public async findLatestReadingsByUserId(
    userId: string,
  ): Promise<Map<SensorType, ISensorReadingDocument>> {
    try {
      const sensorTypes = Object.values(SensorType);
      const results = new Map<SensorType, ISensorReadingDocument>();

      const promises = sensorTypes.map(async (sensorType) => {
        const reading = await this.sensorReadingModel
          .findOne({
            userId: new Types.ObjectId(userId),
            sensorType,
          })
          .sort({ timestamp: -1 })
          .exec();

        if (reading) {
          results.set(sensorType, reading);
        }
      });

      await Promise.all(promises);
      return results;
    } catch (error) {
      logger.error(
        { err: error, userId },
        'TelemetryRepository.findLatestReadingsByUserId - Error',
      );
      throw new InternalServerError('Failed to retrieve latest sensor telemetry readings');
    }
  }

  /**
   * Retrieves historical readings for a user, optionally filtered by sensor type.
   */
  public async findHistoricalReadings(
    userId: string,
    sensorType?: SensorType,
    limit = 50,
  ): Promise<ISensorReadingDocument[]> {
    try {
      const query: Record<string, unknown> = { userId: new Types.ObjectId(userId) };
      if (sensorType) {
        query.sensorType = sensorType;
      }

      return await this.sensorReadingModel.find(query).sort({ timestamp: -1 }).limit(limit).exec();
    } catch (error) {
      logger.error(
        { err: error, userId, sensorType },
        'TelemetryRepository.findHistoricalReadings - Error',
      );
      throw new InternalServerError('Failed to retrieve historical sensor telemetry');
    }
  }

  /**
   * Finds the primary connected device for a user.
   */
  public async findPrimaryDeviceByUserId(userId: string): Promise<IDeviceDocument | null> {
    try {
      return await this.deviceModel
        .findOne({ userId: new Types.ObjectId(userId), isActive: true })
        .sort({ lastSeenAt: -1 })
        .exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'TelemetryRepository.findPrimaryDeviceByUserId - Error');
      throw new InternalServerError('Failed to find connected device');
    }
  }
}

export const telemetryRepository = new TelemetryRepository();
