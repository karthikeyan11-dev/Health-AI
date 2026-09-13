import { Types } from 'mongoose';
import { DigitalTwinRepository } from '../../../src/modules/digital-twin/digital-twin.repository';
import {
  DigitalTwinModel,
  TwinHealthState,
  EmotionType,
} from '../../../src/models/digital-twin.model';
import {
  DigitalTwinSnapshotModel,
  SnapshotTriggerReason,
} from '../../../src/models/digital-twin-snapshot.model';
import { UserModel } from '../../../src/models/user.model';
import { PatientModel } from '../../../src/models/patient.model';
import { SensorReadingModel } from '../../../src/models/sensor-reading.model';
import { CardiovascularAssessmentModel } from '../../../src/models/cardiovascular-assessment.model';
import { StressAssessmentModel } from '../../../src/models/stress-assessment.model';

jest.mock('../../../src/models/digital-twin.model', () => {
  const actual = jest.requireActual('../../../src/models/digital-twin.model');
  return {
    ...actual,
    DigitalTwinModel: {
      findOne: jest.fn(),
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
    },
  };
});
jest.mock('../../../src/models/digital-twin-snapshot.model', () => {
  const actual = jest.requireActual('../../../src/models/digital-twin-snapshot.model');
  return {
    ...actual,
    DigitalTwinSnapshotModel: {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
    },
  };
});
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/patient.model');
jest.mock('../../../src/models/sensor-reading.model');
jest.mock('../../../src/models/cardiovascular-assessment.model');
jest.mock('../../../src/models/stress-assessment.model');

describe('DigitalTwinRepository Unit Tests', () => {
  let repository: DigitalTwinRepository;
  const userId = '507f1f77bcf86cd799439011';
  const mockTwin = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(userId),
    overallHealthScore: 90,
    healthState: TwinHealthState.OPTIMAL,
    baselineHeartRate: 72,
    baselineTemperature: 36.5,
    baselineSpO2: 98,
    dominantEmotion: EmotionType.HAPPY,
    currentStressScore: 20,
    currentCardioRiskScore: 15,
  };

  beforeEach(() => {
    repository = new DigitalTwinRepository();
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should find twin by user ID', async () => {
      (DigitalTwinModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockTwin),
      });

      const result = await repository.findByUserId(userId);
      expect(result).toEqual(mockTwin);
      expect(DigitalTwinModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
    });

    it('should rethrow error on find failure', async () => {
      (DigitalTwinModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(repository.findByUserId(userId)).rejects.toThrow('DB error');
    });
  });

  describe('create', () => {
    it('should create new digital twin document', async () => {
      (DigitalTwinModel.create as jest.Mock).mockResolvedValue(mockTwin);

      const result = await repository.create(mockTwin);
      expect(result).toEqual(mockTwin);
      expect(DigitalTwinModel.create).toHaveBeenCalledWith(mockTwin);
    });

    it('should rethrow error on creation failure', async () => {
      (DigitalTwinModel.create as jest.Mock).mockRejectedValue(new Error('Validation error'));

      await expect(repository.create(mockTwin)).rejects.toThrow('Validation error');
    });
  });

  describe('updateByUserId', () => {
    it('should update twin document by user ID', async () => {
      const updatedTwin = { ...mockTwin, overallHealthScore: 95 };
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTwin),
      });

      const result = await repository.updateByUserId(userId, { overallHealthScore: 95 });
      expect(result?.overallHealthScore).toBe(95);
      expect(DigitalTwinModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: new Types.ObjectId(userId) },
        { $set: { overallHealthScore: 95 } },
        { new: true },
      );
    });

    it('should update twin document by user ID with version increment', async () => {
      const updatedTwin = { ...mockTwin, overallHealthScore: 95, version: 2 };
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTwin),
      });

      const result = await repository.updateByUserId(userId, { overallHealthScore: 95 }, true);
      expect(result?.overallHealthScore).toBe(95);
      expect(DigitalTwinModel.findOneAndUpdate).toHaveBeenCalledWith(
        { userId: new Types.ObjectId(userId) },
        { $set: { overallHealthScore: 95 }, $inc: { version: 1 } },
        { new: true },
      );
    });

    it('should rethrow error on update failure', async () => {
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Update failed')),
      });

      await expect(repository.updateByUserId(userId, { overallHealthScore: 95 })).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('createSnapshot', () => {
    it('should create new snapshot document', async () => {
      const mockSnapshot = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        overallHealthScore: 90,
        healthState: TwinHealthState.OPTIMAL,
        triggerReason: SnapshotTriggerReason.TELEMETRY_SYNC,
        version: 1,
      };
      (DigitalTwinSnapshotModel.create as jest.Mock).mockResolvedValue(mockSnapshot);

      const result = await repository.createSnapshot(mockSnapshot);
      expect(result).toEqual(mockSnapshot);
      expect(DigitalTwinSnapshotModel.create).toHaveBeenCalledWith(mockSnapshot);
    });

    it('should rethrow error on snapshot creation failure', async () => {
      (DigitalTwinSnapshotModel.create as jest.Mock).mockRejectedValue(
        new Error('Snapshot write error'),
      );

      await expect(repository.createSnapshot({})).rejects.toThrow('Snapshot write error');
    });
  });

  describe('findLatestSnapshot', () => {
    it('should find latest snapshot by user ID', async () => {
      const mockSnapshot = { _id: new Types.ObjectId(), version: 2 };
      (DigitalTwinSnapshotModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(mockSnapshot) }),
      });

      const result = await repository.findLatestSnapshot(userId);
      expect(result).toEqual(mockSnapshot);
      expect(DigitalTwinSnapshotModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
    });

    it('should rethrow error on findLatestSnapshot failure', async () => {
      (DigitalTwinSnapshotModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Query error')) }),
      });

      await expect(repository.findLatestSnapshot(userId)).rejects.toThrow('Query error');
    });
  });

  describe('findSnapshots', () => {
    it('should find paginated snapshots with default pagination and sorting', async () => {
      const snapshots = [{ version: 2 }, { version: 1 }];
      (DigitalTwinSnapshotModel.find as jest.Mock).mockReturnValue({
        sort: (): { skip: () => { limit: () => { exec: () => Promise<typeof snapshots> } } } => ({
          skip: (): { limit: () => { exec: () => Promise<typeof snapshots> } } => ({
            limit: (): { exec: () => Promise<typeof snapshots> } => ({
              exec: jest.fn().mockResolvedValue(snapshots),
            }),
          }),
        }),
      });
      (DigitalTwinSnapshotModel.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(2),
      });

      const result = await repository.findSnapshots(userId);
      expect(result.items).toEqual(snapshots);
      expect(result.total).toBe(2);
    });

    it('should find paginated snapshots with date range and trigger reason filters', async () => {
      const snapshots = [{ version: 2 }];
      (DigitalTwinSnapshotModel.find as jest.Mock).mockReturnValue({
        sort: (): { skip: () => { limit: () => { exec: () => Promise<typeof snapshots> } } } => ({
          skip: (): { limit: () => { exec: () => Promise<typeof snapshots> } } => ({
            limit: (): { exec: () => Promise<typeof snapshots> } => ({
              exec: jest.fn().mockResolvedValue(snapshots),
            }),
          }),
        }),
      });
      (DigitalTwinSnapshotModel.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const startDate = new Date('2026-08-01');
      const endDate = new Date('2026-08-10');
      const result = await repository.findSnapshots(userId, {
        page: 2,
        limit: 5,
        startDate,
        endDate,
        trigger: SnapshotTriggerReason.BASELINE_CALIBRATION,
      });

      expect(result.items).toEqual(snapshots);
      expect(result.total).toBe(1);
    });

    it('should rethrow error on findSnapshots failure', async () => {
      (DigitalTwinSnapshotModel.find as jest.Mock).mockReturnValue({
        sort: (): { skip: () => { limit: () => { exec: () => Promise<never> } } } => ({
          skip: (): { limit: () => { exec: () => Promise<never> } } => ({
            limit: (): { exec: () => Promise<never> } => ({
              exec: jest.fn().mockRejectedValue(new Error('Snapshot search error')),
            }),
          }),
        }),
      });
      (DigitalTwinSnapshotModel.countDocuments as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      await expect(repository.findSnapshots(userId)).rejects.toThrow('Snapshot search error');
    });
  });

  describe('findUserById', () => {
    it('should find user by ID', async () => {
      const mockUser = { _id: new Types.ObjectId(userId), email: 'test@test.com' };
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUser),
      });

      const result = await repository.findUserById(userId);
      expect(result).toEqual(mockUser);
    });

    it('should rethrow error on findUserById failure', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('User find error')),
      });

      await expect(repository.findUserById(userId)).rejects.toThrow('User find error');
    });
  });

  describe('findPatientByUserId', () => {
    it('should find patient by user ID', async () => {
      const mockPatient = { _id: new Types.ObjectId(), userId: new Types.ObjectId(userId) };
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockPatient),
      });

      const result = await repository.findPatientByUserId(userId);
      expect(result).toEqual(mockPatient);
    });

    it('should rethrow error on findPatientByUserId failure', async () => {
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Patient find error')),
      });

      await expect(repository.findPatientByUserId(userId)).rejects.toThrow('Patient find error');
    });
  });

  describe('findLatestReadings', () => {
    it('should fetch latest HR, SpO2, and temperature readings', async () => {
      const hrDoc = { value: 74, sensorType: 'HEART_RATE' };
      const spo2Doc = { value: 98.5, sensorType: 'SPO2' };
      const tempDoc = { value: 36.6, sensorType: 'TEMPERATURE' };

      (SensorReadingModel.findOne as jest.Mock).mockImplementation((query) => {
        if (query.sensorType === 'HEART_RATE') {
          return {
            sort: (): { exec: () => Promise<typeof hrDoc> } => ({
              exec: jest.fn().mockResolvedValue(hrDoc),
            }),
          };
        }
        if (query.sensorType === 'SPO2') {
          return {
            sort: (): { exec: () => Promise<typeof spo2Doc> } => ({
              exec: jest.fn().mockResolvedValue(spo2Doc),
            }),
          };
        }
        return {
          sort: (): { exec: () => Promise<typeof tempDoc> } => ({
            exec: jest.fn().mockResolvedValue(tempDoc),
          }),
        };
      });

      const result = await repository.findLatestReadings(userId);
      expect(result.heartRate).toEqual(hrDoc);
      expect(result.spo2).toEqual(spo2Doc);
      expect(result.temperature).toEqual(tempDoc);
    });

    it('should rethrow error on findLatestReadings failure', async () => {
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Reading query error')) }),
      });

      await expect(repository.findLatestReadings(userId)).rejects.toThrow('Reading query error');
    });
  });

  describe('findHistoricalSensorReadings', () => {
    it('should query sensor readings since start date', async () => {
      const readings = [{ value: 72 }, { value: 75 }];
      (SensorReadingModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(readings) }),
      });

      const startDate = new Date();
      const result = await repository.findHistoricalSensorReadings(userId, startDate);
      expect(result).toEqual(readings);
    });

    it('should rethrow error on findHistoricalSensorReadings failure', async () => {
      (SensorReadingModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('History query error')) }),
      });

      await expect(repository.findHistoricalSensorReadings(userId, new Date())).rejects.toThrow(
        'History query error',
      );
    });
  });

  describe('findLatestCardioAssessment', () => {
    it('should find latest cardio assessment', async () => {
      const cardio = { riskScore: 15 };
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(cardio) }),
      });

      const result = await repository.findLatestCardioAssessment(userId);
      expect(result).toEqual(cardio);
    });

    it('should rethrow error on findLatestCardioAssessment failure', async () => {
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Cardio query error')) }),
      });

      await expect(repository.findLatestCardioAssessment(userId)).rejects.toThrow(
        'Cardio query error',
      );
    });
  });

  describe('findHistoricalCardioAssessments', () => {
    it('should find historical cardio assessments', async () => {
      const cardioList = [{ riskScore: 12 }, { riskScore: 15 }];
      (CardiovascularAssessmentModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(cardioList) }),
      });

      const result = await repository.findHistoricalCardioAssessments(userId, new Date());
      expect(result).toEqual(cardioList);
    });

    it('should rethrow error on findHistoricalCardioAssessments failure', async () => {
      (CardiovascularAssessmentModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Cardio history error')) }),
      });

      await expect(repository.findHistoricalCardioAssessments(userId, new Date())).rejects.toThrow(
        'Cardio history error',
      );
    });
  });

  describe('findLatestStressAssessment', () => {
    it('should find latest stress assessment', async () => {
      const stress = { stressScore: 22 };
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(stress) }),
      });

      const result = await repository.findLatestStressAssessment(userId);
      expect(result).toEqual(stress);
    });

    it('should rethrow error on findLatestStressAssessment failure', async () => {
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Stress query error')) }),
      });

      await expect(repository.findLatestStressAssessment(userId)).rejects.toThrow(
        'Stress query error',
      );
    });
  });

  describe('findHistoricalStressAssessments', () => {
    it('should find historical stress assessments', async () => {
      const stressList = [{ stressScore: 20 }, { stressScore: 22 }];
      (StressAssessmentModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockResolvedValue(stressList) }),
      });

      const result = await repository.findHistoricalStressAssessments(userId, new Date());
      expect(result).toEqual(stressList);
    });

    it('should rethrow error on findHistoricalStressAssessments failure', async () => {
      (StressAssessmentModel.find as jest.Mock).mockReturnValue({
        sort: () => ({ exec: jest.fn().mockRejectedValue(new Error('Stress history error')) }),
      });

      await expect(repository.findHistoricalStressAssessments(userId, new Date())).rejects.toThrow(
        'Stress history error',
      );
    });
  });
});
