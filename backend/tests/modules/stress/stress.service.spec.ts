import axios from 'axios';
import { Types } from 'mongoose';
import { StressService } from '../../../src/modules/stress/stress.service';
import type { StressRepository } from '../../../src/modules/stress/stress.repository';
import {
  StressLevel,
  EmotionType,
  normalizeEmotion,
} from '../../../src/models/stress-assessment.model';
import { UserModel } from '../../../src/models/user.model';
import { PatientModel } from '../../../src/models/patient.model';
import { SensorReadingModel } from '../../../src/models/sensor-reading.model';
import { DigitalTwinModel } from '../../../src/models/digital-twin.model';
import { NotFoundError, InternalServerError } from '../../../src/shared/errors/httpErrors';

jest.mock('axios');
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/patient.model');
jest.mock('../../../src/models/sensor-reading.model');
jest.mock('../../../src/models/digital-twin.model');

describe('StressService Unit Tests', () => {
  let service: StressService;
  let mockRepo: jest.Mocked<StressRepository>;

  const userId = '507f1f77bcf86cd799439011';
  const mockUserDoc = {
    _id: new Types.ObjectId(userId),
    email: 'karthi@test.com',
  };

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findLatestByUserId: jest.fn(),
      getHistoryByUserId: jest.fn(),
    } as unknown as jest.Mocked<StressRepository>;

    service = new StressService(mockRepo);
    jest.clearAllMocks();
  });

  describe('assessStress', () => {
    it('should throw NotFound when user does not exist', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.assessStress({ userId })).rejects.toThrow(NotFoundError);
    });

    it('should evaluate LOW stress with explicit readings array and update Digital Twin', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Relax',
          stress_probability: 0.15,
          confidence: 0.85,
          summary_vitals: {
            hr_mean: 72,
            hr_min: 68,
            hr_max: 76,
            spo2_mean: 98,
            temp_mean: 36.6,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 15,
        stressLevel: StressLevel.LOW,
        confidence: 85,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const readings = Array.from({ length: 90 }, () => ({ hr: 72, spo2: 98, temp: 36.6 }));
      const result = await service.assessStress({
        userId,
        readings,
        currentEmotion: EmotionType.HAPPY,
      });

      expect(axios.post).toHaveBeenCalled();
      expect(result.stressScore).toBe(15);
      expect(result.stressLevel).toBe(StressLevel.LOW);
    });

    it('should resolve vitals from sensor readings when vitals not passed in input', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockImplementation(
        (): { sort: () => { exec: () => Promise<{ value: number }> } } => ({
          sort: (): { exec: () => Promise<{ value: number }> } => ({
            exec: jest.fn().mockResolvedValue({ value: 78 }),
          }),
        }),
      );

      const mockAIResponse = {
        data: {
          primary_prediction: 'Relax',
          stress_probability: 0.1,
          confidence: 0.9,
          summary_vitals: {
            hr_mean: 78,
            hr_min: 74,
            hr_max: 82,
            spo2_mean: 98,
            temp_mean: 36.6,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 10,
        stressLevel: StressLevel.LOW,
        confidence: 90,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessStress({ userId });
      expect(result.stressScore).toBe(10);
    });

    it('should evaluate MODERATE stress (score 35) and handle digital twin failure', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ value: 80 }),
        }),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Stress',
          stress_probability: 0.35,
          confidence: 0.75,
          summary_vitals: {
            hr_mean: 80,
            hr_min: 75,
            hr_max: 85,
            spo2_mean: 97,
            temp_mean: 36.8,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 35,
        stressLevel: StressLevel.MODERATE,
        confidence: 75,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Digital twin failure')),
      });

      const result = await service.assessStress({ userId });

      expect(result.stressLevel).toBe(StressLevel.MODERATE);
    });

    it('should evaluate HIGH stress (score 65)', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Stress',
          stress_probability: 0.65,
          confidence: 0.88,
          summary_vitals: {
            hr_mean: 95,
            hr_min: 90,
            hr_max: 100,
            spo2_mean: 96,
            temp_mean: 37.1,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 65,
        stressLevel: StressLevel.HIGH,
        confidence: 88,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessStress({
        userId,
        heartRate: 95,
        spo2: 96,
        temperature: 37.1,
      });

      expect(result.stressLevel).toBe(StressLevel.HIGH);
    });

    it('should evaluate SEVERE stress (score 85)', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Stress',
          stress_probability: 0.85,
          confidence: 0.95,
          summary_vitals: {
            hr_mean: 110,
            hr_min: 105,
            hr_max: 115,
            spo2_mean: 94,
            temp_mean: 37.4,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 85,
        stressLevel: StressLevel.SEVERE,
        confidence: 95,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessStress({
        userId,
        heartRate: 110,
        spo2: 94,
        temperature: 37.4,
      });

      expect(result.stressLevel).toBe(StressLevel.SEVERE);
    });

    it('should throw InternalServerError when AI service is offline', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      (axios.post as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      await expect(service.assessStress({ userId })).rejects.toThrow(InternalServerError);
    });
  });

  describe('getCurrentStress', () => {
    it('should return latest stress record if present', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 15,
        stressLevel: StressLevel.LOW,
      };

      mockRepo.findLatestByUserId.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockRepo.findLatestByUserId>>,
      );

      const result = await service.getCurrentStress(userId);

      expect(result.stressScore).toBe(15);
      expect(mockRepo.findLatestByUserId).toHaveBeenCalledWith(userId);
    });

    it('should evaluate initial stress when no record found in getCurrentStress', async () => {
      mockRepo.findLatestByUserId.mockResolvedValue(null);

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Relax',
          stress_probability: 0.15,
          confidence: 0.85,
          summary_vitals: {
            hr_mean: 72,
            hr_min: 68,
            hr_max: 76,
            spo2_mean: 98,
            temp_mean: 36.6,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 15,
        stressLevel: StressLevel.LOW,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.getCurrentStress(userId);

      expect(result.stressScore).toBe(15);
    });
  });

  describe('getStressHistory', () => {
    it('should return paginated stress history with default and custom arguments', async () => {
      const mockResult = {
        records: [
          {
            _id: new Types.ObjectId(),
            stressScore: 15,
            stressLevel: StressLevel.LOW,
          },
        ],
        total: 1,
      };

      mockRepo.getHistoryByUserId.mockResolvedValue(
        mockResult as unknown as Awaited<ReturnType<typeof mockRepo.getHistoryByUserId>>,
      );

      const resultDefault = await service.getStressHistory(userId);
      expect(resultDefault.total).toBe(1);
      expect(mockRepo.getHistoryByUserId).toHaveBeenCalledWith(userId, 1, 20);

      const resultCustom = await service.getStressHistory(userId, 2, 5);
      expect(resultCustom.total).toBe(1);
      expect(mockRepo.getHistoryByUserId).toHaveBeenCalledWith(userId, 2, 5);
    });
  });

  describe('normalizeEmotion helper', () => {
    it('should normalize uppercase string to EmotionType', () => {
      expect(normalizeEmotion('SURPRISE')).toBe(EmotionType.SURPRISE);
      expect(normalizeEmotion('HAPPY')).toBe(EmotionType.HAPPY);
      expect(normalizeEmotion('NEUTRAL')).toBe(EmotionType.NEUTRAL);
      expect(normalizeEmotion('FEAR')).toBe(EmotionType.FEAR);
      expect(normalizeEmotion('SAD')).toBe(EmotionType.SAD);
      expect(normalizeEmotion('ANGRY')).toBe(EmotionType.ANGRY);
      expect(normalizeEmotion('DISGUST')).toBe(EmotionType.DISGUST);
    });

    it('should normalize lowercase string to EmotionType', () => {
      expect(normalizeEmotion('surprise')).toBe(EmotionType.SURPRISE);
      expect(normalizeEmotion('happy')).toBe(EmotionType.HAPPY);
    });

    it('should return undefined for falsy or unknown emotion strings', () => {
      expect(normalizeEmotion(undefined)).toBeUndefined();
      expect(normalizeEmotion(null)).toBeUndefined();
      expect(normalizeEmotion('')).toBeUndefined();
      expect(normalizeEmotion('UNKNOWN_EMOTION')).toBeUndefined();
    });

    it('should correctly normalize uppercase emotion passed into assessStress and persist it', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const mockAIResponse = {
        data: {
          primary_prediction: 'Alert',
          stress_probability: 0.2,
          confidence: 0.85,
          summary_vitals: {
            hr_mean: 80,
            hr_min: 75,
            hr_max: 85,
            spo2_mean: 98,
            temp_mean: 36.6,
          },
          model_name: 'SVM RBF',
          window_size_sec: 90,
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        stressScore: 20,
        stressLevel: StressLevel.LOW,
        currentEmotion: EmotionType.SURPRISE,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      await service.assessStress({
        userId,
        heartRate: 80,
        spo2: 98,
        temperature: 36.6,
        currentEmotion: 'SURPRISE' as unknown as EmotionType,
      });

      expect(mockRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currentEmotion: EmotionType.SURPRISE,
        }),
      );
    });
  });
});
