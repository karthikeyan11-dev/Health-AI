import { PatientsRepository } from '../../../src/modules/patients/patients.repository';
import { UserModel } from '../../../src/models/user.model';
import { PatientModel } from '../../../src/models/patient.model';
import { DeviceModel } from '../../../src/models/device.model';
import { SensorReadingModel, SensorType } from '../../../src/models/sensor-reading.model';
import { CardiovascularAssessmentModel } from '../../../src/models/cardiovascular-assessment.model';
import { StressAssessmentModel } from '../../../src/models/stress-assessment.model';
import { DigitalTwinModel } from '../../../src/models/digital-twin.model';
import { RecommendationModel } from '../../../src/models/recommendation.model';

jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/patient.model');
jest.mock('../../../src/models/device.model');
jest.mock('../../../src/models/sensor-reading.model');
jest.mock('../../../src/models/cardiovascular-assessment.model');
jest.mock('../../../src/models/stress-assessment.model');
jest.mock('../../../src/models/digital-twin.model');
jest.mock('../../../src/models/recommendation.model');

describe('PatientsRepository Unit Tests', () => {
  let repository: PatientsRepository;

  beforeEach(() => {
    repository = new PatientsRepository();
    jest.clearAllMocks();
  });

  describe('findUserById', () => {
    it('should return user document when valid 24-char ObjectId is provided', async () => {
      const mockExec = jest.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011' });
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findUserById('507f1f77bcf86cd799439011');
      expect(result).toEqual({ id: '507f1f77bcf86cd799439011' });
      expect(UserModel.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return null when invalid hex string format is passed', async () => {
      const result = await repository.findUserById('invalid_id');
      expect(result).toBeNull();
      expect(UserModel.findById).not.toHaveBeenCalled();
    });

    it('should return null when empty string is passed', async () => {
      const result = await repository.findUserById('');
      expect(result).toBeNull();
    });

    it('should rethrow error when UserModel.findById fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('DB error'));
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.findUserById('507f1f77bcf86cd799439011')).rejects.toThrow('DB error');
    });
  });

  describe('findPatientByUserId', () => {
    it('should return patient document for given userId', async () => {
      const mockExec = jest.fn().mockResolvedValue({ userId: '507f1f77bcf86cd799439011' });
      (PatientModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findPatientByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual({ userId: '507f1f77bcf86cd799439011' });
    });

    it('should return null when PatientModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('DB error'));
      (PatientModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findPatientByUserId('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });
  });

  describe('findDeviceByUserId', () => {
    it('should return sorted device document', async () => {
      const mockExec = jest.fn().mockResolvedValue({ deviceId: 'ESP32_01' });
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (DeviceModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findDeviceByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual({ deviceId: 'ESP32_01' });
    });

    it('should return null when DeviceModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Device query error'));
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (DeviceModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findDeviceByUserId('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });
  });

  describe('findLatestReading', () => {
    it('should return latest sensor reading for sensor type', async () => {
      const mockExec = jest.fn().mockResolvedValue({ value: 72 });
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestReading(
        '507f1f77bcf86cd799439011',
        SensorType.HEART_RATE,
      );
      expect(result).toEqual({ value: 72 });
    });

    it('should return null when SensorReadingModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Reading error'));
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestReading(
        '507f1f77bcf86cd799439011',
        SensorType.HEART_RATE,
      );
      expect(result).toBeNull();
    });
  });

  describe('findRecentReadings', () => {
    it('should return list of recent sensor readings up to limit', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ value: 72 }, { value: 75 }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (SensorReadingModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findRecentReadings('507f1f77bcf86cd799439011', 10);
      expect(result).toEqual([{ value: 72 }, { value: 75 }]);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should use default limit 20 when limit parameter is omitted', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ value: 72 }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (SensorReadingModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findRecentReadings('507f1f77bcf86cd799439011');
      expect(result).toEqual([{ value: 72 }]);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should return empty array when SensorReadingModel.find throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Recent readings error'));
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (SensorReadingModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findRecentReadings('507f1f77bcf86cd799439011');
      expect(result).toEqual([]);
    });
  });

  describe('findLatestCardiovascularAssessment', () => {
    it('should return latest cardiovascular assessment document', async () => {
      const mockExec = jest.fn().mockResolvedValue({ riskScore: 18.5 });
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestCardiovascularAssessment(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toEqual({ riskScore: 18.5 });
    });

    it('should return null when CardiovascularAssessmentModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Cardio error'));
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestCardiovascularAssessment(
        '507f1f77bcf86cd799439011',
      );
      expect(result).toBeNull();
    });
  });

  describe('findLatestStressAssessment', () => {
    it('should return latest stress assessment document', async () => {
      const mockExec = jest.fn().mockResolvedValue({ stressScore: 22.0 });
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestStressAssessment('507f1f77bcf86cd799439011');
      expect(result).toEqual({ stressScore: 22.0 });
    });

    it('should return null when StressAssessmentModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Stress error'));
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestStressAssessment('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });
  });

  describe('findDigitalTwin', () => {
    it('should return digital twin state document', async () => {
      const mockExec = jest.fn().mockResolvedValue({ overallHealthScore: 92.5 });
      (DigitalTwinModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findDigitalTwin('507f1f77bcf86cd799439011');
      expect(result).toEqual({ overallHealthScore: 92.5 });
    });

    it('should return null when DigitalTwinModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Digital twin error'));
      (DigitalTwinModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findDigitalTwin('507f1f77bcf86cd799439011');
      expect(result).toBeNull();
    });
  });

  describe('findActiveRecommendations', () => {
    it('should return unacknowledged active recommendations', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ title: 'Hydration' }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (RecommendationModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findActiveRecommendations('507f1f77bcf86cd799439011', 5);
      expect(result).toEqual([{ title: 'Hydration' }]);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should use default limit 5 when limit parameter is omitted', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ title: 'Exercise' }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (RecommendationModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findActiveRecommendations('507f1f77bcf86cd799439011');
      expect(result).toEqual([{ title: 'Exercise' }]);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });

    it('should return empty array when RecommendationModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Recommendation error'));
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (RecommendationModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findActiveRecommendations('507f1f77bcf86cd799439011');
      expect(result).toEqual([]);
    });
  });

  describe('findAllDevicesByUserId', () => {
    it('should return devices list when DeviceModel query succeeds', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ deviceId: 'DEV_01' }]);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (DeviceModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findAllDevicesByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual([{ deviceId: 'DEV_01' }]);
    });

    it('should return empty array when DeviceModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Device find error'));
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (DeviceModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findAllDevicesByUserId('507f1f77bcf86cd799439011');
      expect(result).toEqual([]);
    });
  });

  describe('findSensorReadingsFiltered', () => {
    it('should query sensor readings with deviceId and date boundaries', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ value: 75 }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (SensorReadingModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-02');
      const result = await repository.findSensorReadingsFiltered('507f1f77bcf86cd799439011', {
        deviceId: 'DEV_01',
        startDate,
        endDate,
      });

      expect(result).toEqual([{ value: 75 }]);
      expect(SensorReadingModel.find).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439011',
        sensorType: { $in: ['HEART_RATE', 'SPO2', 'TEMPERATURE'] },
        deviceId: 'DEV_01',
        timestamp: { $gte: startDate, $lte: endDate },
      });
    });

    it('should return empty array when SensorReadingModel query throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Sensor query error'));
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      (SensorReadingModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findSensorReadingsFiltered('507f1f77bcf86cd799439011');
      expect(result).toEqual([]);
    });
  });
});
