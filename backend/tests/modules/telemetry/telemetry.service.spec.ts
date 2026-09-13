import { Types } from 'mongoose';
import { TelemetryService } from '../../../src/modules/telemetry/telemetry.service';
import type { TelemetryRepository } from '../../../src/modules/telemetry/telemetry.repository';
import { SensorType, type ISensorReadingDocument } from '../../../src/models/sensor-reading.model';
import type { IPatientDocument } from '../../../src/models/patient.model';
import type { IDeviceDocument } from '../../../src/models/device.model';
import type { IngestTelemetryInput } from '../../../src/modules/telemetry/telemetry.dto';
import { BadRequestError } from '../../../src/shared/errors/httpErrors';

describe('TelemetryService Unit Tests', () => {
  let service: TelemetryService;
  let mockRepo: jest.Mocked<TelemetryRepository>;
  let mockBroadcast: jest.Mock;
  let mockAlert: jest.Mock;

  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockRepo = {
      insertManyReadings: jest.fn().mockResolvedValue([]),
      updateDeviceHeartbeat: jest.fn().mockResolvedValue(null),
      findPatientByUserId: jest
        .fn()
        .mockResolvedValue({ _id: new Types.ObjectId() } as unknown as IPatientDocument),
      findLatestReadingsByUserId: jest.fn().mockResolvedValue(new Map()),
      findHistoricalReadings: jest.fn().mockResolvedValue([]),
      findPrimaryDeviceByUserId: jest.fn().mockResolvedValue(null),
    } as unknown as jest.Mocked<TelemetryRepository>;

    mockBroadcast = jest.fn();
    mockAlert = jest.fn();

    service = new TelemetryService(mockRepo, mockBroadcast, mockAlert);
    jest.clearAllMocks();
  });

  describe('ingestTelemetry', () => {
    it('should throw BadRequestError if input is null or readings is empty', async () => {
      await expect(
        service.ingestTelemetry(userId, null as unknown as IngestTelemetryInput),
      ).rejects.toThrow(BadRequestError);
      await expect(service.ingestTelemetry(userId, { readings: [] })).rejects.toThrow(
        BadRequestError,
      );
    });

    it('should throw BadRequestError if sensorType is invalid', async () => {
      await expect(
        service.ingestTelemetry(userId, {
          readings: [{ sensorType: 'UNKNOWN_TYPE' as unknown as SensorType, value: 50 }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if value is NaN or not a number', async () => {
      await expect(
        service.ingestTelemetry(userId, {
          readings: [{ sensorType: SensorType.HEART_RATE, value: 'invalid' as unknown as number }],
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if value is outside physiological range', async () => {
      await expect(
        service.ingestTelemetry(userId, {
          readings: [{ sensorType: SensorType.HEART_RATE, value: 10 }], // Min is 25
        }),
      ).rejects.toThrow(BadRequestError);

      await expect(
        service.ingestTelemetry(userId, {
          readings: [{ sensorType: SensorType.HEART_RATE, value: 300 }], // Max is 250
        }),
      ).rejects.toThrow(BadRequestError);
    });

    it('should successfully ingest telemetry with patient profile and device updates', async () => {
      mockRepo.findPatientByUserId.mockResolvedValue({
        _id: new Types.ObjectId(),
      } as unknown as IPatientDocument);

      const result = await service.ingestTelemetry(userId, {
        deviceId: 'WATCH_01',
        batteryLevel: 92,
        readings: [
          {
            sensorType: SensorType.HEART_RATE,
            value: 72,
            unit: 'bpm',
            timestamp: new Date().toISOString(),
            confidence: 99,
            metadata: { motion: 'REST' },
          },
          {
            sensorType: SensorType.SPO2,
            value: 98,
          },
        ],
      });

      expect(result.ingestedCount).toBe(2);
      expect(result.deviceId).toBe('WATCH_01');
      expect(result.batteryLevel).toBe(92);
      expect(mockRepo.insertManyReadings).toHaveBeenCalled();
      expect(mockRepo.updateDeviceHeartbeat).toHaveBeenCalledWith(userId, 'WATCH_01', 92);
      expect(mockBroadcast).toHaveBeenCalled();
    });

    it('should handle ingestion when patient profile is null and no deviceId provided', async () => {
      mockRepo.findPatientByUserId.mockResolvedValue(null);

      const result = await service.ingestTelemetry(userId, {
        readings: [
          {
            sensorType: SensorType.TEMPERATURE,
            value: 36.6,
          },
        ],
      });

      expect(result.ingestedCount).toBe(1);
      expect(mockRepo.updateDeviceHeartbeat).not.toHaveBeenCalled();
      expect(mockBroadcast).toHaveBeenCalled();
    });

    it('should update device heartbeat when only batteryLevel is provided without deviceId', async () => {
      const result = await service.ingestTelemetry(userId, {
        batteryLevel: 75,
        readings: [
          {
            sensorType: SensorType.TEMPERATURE,
            value: 36.6,
          },
        ],
      });

      expect(result.ingestedCount).toBe(1);
      expect(mockRepo.updateDeviceHeartbeat).toHaveBeenCalledWith(userId, undefined, 75);
    });

    it('should trigger WARNING and CRITICAL alerts for high and low thresholds', async () => {
      const result = await service.ingestTelemetry(userId, {
        readings: [
          { sensorType: SensorType.HEART_RATE, value: 155 }, // Warning (alertHigh is 150)
          { sensorType: SensorType.HEART_RATE, value: 185 }, // Critical (150 * 1.15 = 172.5)
          { sensorType: SensorType.SPO2, value: 88 }, // Warning (alertLow is 90)
          { sensorType: SensorType.SPO2, value: 75 }, // Critical (90 * 0.85 = 76.5)
          { sensorType: SensorType.STEPS, value: 5000 }, // No alerts
        ],
      });

      expect(result.alertsTriggered).toBe(4);
      expect(mockAlert).toHaveBeenCalledTimes(4);
    });
  });

  describe('getLatestTelemetry', () => {
    it('should return latest sensor readings and primary device status with lastSeenAt', async () => {
      const now = new Date();
      const mockReadingsMap = new Map();
      mockReadingsMap.set(SensorType.HEART_RATE, {
        sensorType: SensorType.HEART_RATE,
        value: 75,
        unit: 'bpm',
        timestamp: now,
        confidence: 95,
      });

      const mockDevice = {
        deviceId: 'WATCH_01',
        name: 'Smartwatch',
        status: 'ONLINE',
        batteryLevel: 85,
        lastSeenAt: now,
      };

      mockRepo.findLatestReadingsByUserId.mockResolvedValue(
        mockReadingsMap as unknown as Map<SensorType, ISensorReadingDocument>,
      );
      mockRepo.findPrimaryDeviceByUserId.mockResolvedValue(
        mockDevice as unknown as IDeviceDocument,
      );

      const result = await service.getLatestTelemetry(userId);

      expect(result.userId).toBe(userId);
      expect(result.device?.deviceId).toBe('WATCH_01');
      expect(result.readings[SensorType.HEART_RATE]?.value).toBe(75);
    });

    it('should handle primary device without lastSeenAt', async () => {
      const mockDevice = {
        deviceId: 'WATCH_02',
        name: 'Smartwatch 2',
        status: 'OFFLINE',
        batteryLevel: 10,
        lastSeenAt: undefined,
      };

      mockRepo.findLatestReadingsByUserId.mockResolvedValue(new Map());
      mockRepo.findPrimaryDeviceByUserId.mockResolvedValue(
        mockDevice as unknown as IDeviceDocument,
      );

      const result = await service.getLatestTelemetry(userId);

      expect(result.device?.deviceId).toBe('WATCH_02');
      expect(result.device?.lastSeenAt).toBeUndefined();
    });

    it('should handle user with no sensor readings or device', async () => {
      mockRepo.findLatestReadingsByUserId.mockResolvedValue(new Map());
      mockRepo.findPrimaryDeviceByUserId.mockResolvedValue(null);

      const result = await service.getLatestTelemetry(userId);

      expect(result.userId).toBe(userId);
      expect(result.device).toBeNull();
      expect(result.readings).toEqual({});
    });
  });

  describe('getHistoricalReadings', () => {
    it('should call repository for historical readings with custom and default limit', async () => {
      const mockDocs = [{ sensorType: SensorType.HEART_RATE, value: 70 }];
      mockRepo.findHistoricalReadings.mockResolvedValue(
        mockDocs as unknown as ISensorReadingDocument[],
      );

      const result = await service.getHistoricalReadings(userId, SensorType.HEART_RATE, 20);
      expect(result).toEqual(mockDocs);
      expect(mockRepo.findHistoricalReadings).toHaveBeenCalledWith(
        userId,
        SensorType.HEART_RATE,
        20,
      );

      const resultDefault = await service.getHistoricalReadings(userId);
      expect(resultDefault).toEqual(mockDocs);
      expect(mockRepo.findHistoricalReadings).toHaveBeenCalledWith(userId, undefined, 50);
    });
  });
});
