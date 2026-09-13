import { Types } from 'mongoose';
import { TelemetryRepository } from '../../../src/modules/telemetry/telemetry.repository';
import { SensorReadingModel, SensorType } from '../../../src/models/sensor-reading.model';
import { DeviceModel } from '../../../src/models/device.model';
import { PatientModel } from '../../../src/models/patient.model';
import { InternalServerError } from '../../../src/shared/errors/httpErrors';

jest.mock('../../../src/models/sensor-reading.model');
jest.mock('../../../src/models/device.model');
jest.mock('../../../src/models/patient.model');

describe('TelemetryRepository Unit Tests', () => {
  let repository: TelemetryRepository;
  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    repository = new TelemetryRepository();
    jest.clearAllMocks();
  });

  describe('insertManyReadings', () => {
    it('should successfully bulk insert sensor readings', async () => {
      const mockReadings = [
        {
          userId: new Types.ObjectId(userId),
          sensorType: SensorType.HEART_RATE,
          value: 75,
          unit: 'bpm',
          timestamp: new Date(),
        },
      ];

      (SensorReadingModel.insertMany as jest.Mock).mockResolvedValue(mockReadings);

      const result = await repository.insertManyReadings(mockReadings);
      expect(result).toEqual(mockReadings);
      expect(SensorReadingModel.insertMany).toHaveBeenCalledWith(mockReadings, { ordered: false });
    });

    it('should throw DatabaseError when insertMany fails', async () => {
      (SensorReadingModel.insertMany as jest.Mock).mockRejectedValue(new Error('Insert error'));

      await expect(repository.insertManyReadings([])).rejects.toThrow(InternalServerError);
    });
  });

  describe('updateDeviceHeartbeat', () => {
    it('should update device heartbeat with deviceId and batteryLevel', async () => {
      const mockDevice = {
        _id: new Types.ObjectId(),
        deviceId: 'WATCH_01',
        batteryLevel: 88,
      };

      (DeviceModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDevice),
      });

      const result = await repository.updateDeviceHeartbeat(userId, 'WATCH_01', 88);
      expect(result).toEqual(mockDevice);
      expect(DeviceModel.findOneAndUpdate).toHaveBeenCalled();
    });

    it('should update device heartbeat without deviceId and batteryLevel', async () => {
      const mockDevice = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
      };

      (DeviceModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDevice),
      });

      const result = await repository.updateDeviceHeartbeat(userId);
      expect(result).toEqual(mockDevice);
    });

    it('should throw DatabaseError when findOneAndUpdate fails', async () => {
      (DeviceModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Update failed')),
      });

      await expect(repository.updateDeviceHeartbeat(userId)).rejects.toThrow(InternalServerError);
    });
  });

  describe('findPatientByUserId', () => {
    it('should return patient document when found', async () => {
      const mockPatient = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
      };

      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPatient),
      });

      const result = await repository.findPatientByUserId(userId);
      expect(result).toEqual(mockPatient);
    });

    it('should throw DatabaseError when findOne fails', async () => {
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Query failed')),
      });

      await expect(repository.findPatientByUserId(userId)).rejects.toThrow(InternalServerError);
    });
  });

  describe('findLatestReadingsByUserId', () => {
    it('should retrieve latest reading map across all sensor types', async () => {
      (SensorReadingModel.findOne as jest.Mock).mockImplementation(
        (query: { sensorType: SensorType }) => {
          if (query.sensorType === SensorType.HEART_RATE) {
            return {
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ sensorType: SensorType.HEART_RATE, value: 72 }),
              }),
            };
          }
          return {
            sort: jest.fn().mockReturnValue({
              exec: jest.fn().mockResolvedValue(null),
            }),
          };
        },
      );

      const result = await repository.findLatestReadingsByUserId(userId);
      expect(result.get(SensorType.HEART_RATE)).toBeDefined();
      expect(result.get(SensorType.SPO2)).toBeUndefined();
    });

    it('should throw DatabaseError when query fails', async () => {
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Latest readings failed')),
        }),
      });

      await expect(repository.findLatestReadingsByUserId(userId)).rejects.toThrow(
        InternalServerError,
      );
    });
  });

  describe('findHistoricalReadings', () => {
    it('should return historical readings filtered by sensorType', async () => {
      const mockReadings = [{ sensorType: SensorType.HEART_RATE, value: 80 }];
      (SensorReadingModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReadings),
          }),
        }),
      });

      const result = await repository.findHistoricalReadings(userId, SensorType.HEART_RATE, 25);
      expect(result).toEqual(mockReadings);
      expect(SensorReadingModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
        sensorType: SensorType.HEART_RATE,
      });
    });

    it('should return historical readings without sensorType filter', async () => {
      const mockReadings = [{ sensorType: SensorType.HEART_RATE, value: 80 }];
      (SensorReadingModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue(mockReadings),
          }),
        }),
      });

      const result = await repository.findHistoricalReadings(userId);
      expect(result).toEqual(mockReadings);
      expect(SensorReadingModel.find).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
    });

    it('should throw DatabaseError when find fails', async () => {
      (SensorReadingModel.find as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockRejectedValue(new Error('History query failed')),
          }),
        }),
      });

      await expect(repository.findHistoricalReadings(userId)).rejects.toThrow(InternalServerError);
    });
  });

  describe('findPrimaryDeviceByUserId', () => {
    it('should return primary connected device', async () => {
      const mockDevice = { deviceId: 'WATCH_01', name: 'Smartwatch' };
      (DeviceModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDevice),
        }),
      });

      const result = await repository.findPrimaryDeviceByUserId(userId);
      expect(result).toEqual(mockDevice);
    });

    it('should throw DatabaseError when findOne fails', async () => {
      (DeviceModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockRejectedValue(new Error('Device query failed')),
        }),
      });

      await expect(repository.findPrimaryDeviceByUserId(userId)).rejects.toThrow(
        InternalServerError,
      );
    });
  });
});
