import axios from 'axios';
import { Types } from 'mongoose';
import { CardiovascularService } from '../../../src/modules/cardiovascular/cardiovascular.service';
import type { CardiovascularRepository } from '../../../src/modules/cardiovascular/cardiovascular.repository';
import { CardiovascularRiskLevel } from '../../../src/models/cardiovascular-assessment.model';
import { UserModel } from '../../../src/models/user.model';
import { PatientModel } from '../../../src/models/patient.model';
import { SensorReadingModel, SensorType } from '../../../src/models/sensor-reading.model';
import { DigitalTwinModel } from '../../../src/models/digital-twin.model';
import { NotFoundError, InternalServerError } from '../../../src/shared/errors/httpErrors';

jest.mock('axios');
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/patient.model');
jest.mock('../../../src/models/sensor-reading.model');
jest.mock('../../../src/models/digital-twin.model');

describe('CardiovascularService Unit Tests', () => {
  let service: CardiovascularService;
  let mockRepo: jest.Mocked<CardiovascularRepository>;

  const userId = '507f1f77bcf86cd799439011';
  const mockUserDoc = {
    _id: new Types.ObjectId(userId),
    email: 'karthi@test.com',
    age: 24,
    gender: 'MALE',
  };

  const mockAIResponse = {
    data: {
      status: 'success',
      assessment: {
        risk_class: 1,
        risk_level: 'LOW',
        risk_score: 22.5,
        confidence: 85.0,
        probabilities: { OPTIMAL: 0.1, LOW: 0.85, MODERATE: 0.05 },
        top_drivers: [
          { feature: 'bp_systolic', value: 120, impact: 0.2 },
          { feature: 'avg_heart_rate', value: 72, impact: 0.15 },
        ],
        shap_string: 'bp_systolic (120), avg_heart_rate (72)',
        recommended_intervention: 'Maintain Routine / Rest',
        action_id: 0,
      },
      guidance: {
        guidance_status: 'success',
        provider: 'gemini',
        message: 'Your cardiovascular health is stable and optimal.',
      },
    },
  };

  beforeEach(() => {
    mockRepo = {
      create: jest.fn(),
      findLatestByUserId: jest.fn(),
      getHistoryByUserId: jest.fn(),
    } as unknown as jest.Mocked<CardiovascularRepository>;

    service = new CardiovascularService(mockRepo);
    jest.clearAllMocks();
  });

  describe('assessCardiovascularRisk', () => {
    it('should throw NotFound when user does not exist', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.assessCardiovascularRisk({ userId })).rejects.toThrow(NotFoundError);
    });

    it('should perform assessment successfully with all inputs provided and update Digital Twin', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId(), bloodType: 'O+' }),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ value: 72 }),
        }),
      });

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 22.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 85.0,
        recommendations: ['Maintain Routine / Rest'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({
        userId,
        age: 30,
        sex: 1,
        bmi: 24.5,
        smokingStatus: 0,
        familyHistoryCvd: 0,
        heartRate: 75,
        restingHr: 68,
        spo2: 98,
        temperature: 36.6,
        systolicBp: 120,
        diastolicBp: 80,
        hrv: 45,
        steps: 8000,
        caloriesBurned: 2200,
        distanceKm: 5.5,
        sleepHours: 7.5,
        sleepEfficiency: 0.88,
        caloriesConsumed: 2100,
        waterIntakeL: 2.5,
        activityType: 'Walking',
        stressScore: 30,
        digitalTwinHealthScore: 85,
      });

      expect(axios.post).toHaveBeenCalled();
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result.riskScore).toBe(22.5);
      expect(result.riskLevel).toBe(CardiovascularRiskLevel.LOW);
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
            exec: jest.fn().mockResolvedValue({ value: 80 }),
          }),
        }),
      );

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 22.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 85.0,
        recommendations: ['Maintain Routine / Rest'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(22.5);
    });

    it('should handle user without age', async () => {
      const userWithoutAge = {
        _id: new Types.ObjectId(userId),
        email: 'noage@test.com',
        age: 0,
        gender: 'MALE',
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithoutAge),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 22.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 85.0,
        recommendations: ['Maintain Routine / Rest'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(22.5);
    });

    it('should handle female user and missing sensor readings gracefully', async () => {
      const femaleUser = {
        _id: new Types.ObjectId(userId),
        email: 'female@test.com',
        age: 28,
        gender: 'FEMALE',
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(femaleUser),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const aiResponseWithoutIntervention = {
        data: {
          status: 'success',
          assessment: {
            risk_class: 0,
            risk_level: 'OPTIMAL',
            risk_score: 10.0,
            confidence: 90.0,
            probabilities: { OPTIMAL: 0.9, LOW: 0.1 },
            top_drivers: [],
            shap_string: '',
            recommended_intervention: '',
            action_id: 0,
          },
          guidance: {
            guidance_status: 'success',
            provider: 'gemini',
            message: 'All parameters optimal.',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(aiResponseWithoutIntervention);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 10.0,
        riskLevel: CardiovascularRiskLevel.OPTIMAL,
        confidence: 90.0,
        recommendations: [],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('Digital twin update failed')),
      });

      const result = await service.assessCardiovascularRisk({ userId });

      expect(result.riskLevel).toBe(CardiovascularRiskLevel.OPTIMAL);
    });

    it('should calculate age from patient dateOfBirth and BMI from height and weight when user age/bmi is missing', async () => {
      const userWithoutAge = {
        _id: new Types.ObjectId(userId),
        email: 'dob@test.com',
        gender: 'OTHER',
      };

      const patientWithDobAndDimensions = {
        _id: new Types.ObjectId(),
        dateOfBirth: new Date('1990-05-15'),
        gender: 'FEMALE',
        heightCm: 180,
        weightKg: 81,
        smokingStatus: 1,
        familyHistoryCvd: 1,
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithoutAge),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(patientWithDobAndDimensions),
      });

      // Simulate latest heart rate present to trigger restingHr = latestHr.value - 5
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ value: 80 }),
        }),
      });

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 35.0,
        riskLevel: CardiovascularRiskLevel.MODERATE,
        confidence: 88.0,
        recommendations: ['Monitor vitals'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(35.0);
    });

    it('should use patient.bmi directly when already stored on patient profile', async () => {
      const userWithAge = {
        _id: new Types.ObjectId(userId),
        email: 'bmi@test.com',
        age: 40,
        gender: 'MALE',
      };

      const patientWithBmi = {
        _id: new Types.ObjectId(),
        bmi: 26.8,
        smokingStatus: 0,
        familyHistoryCvd: 0,
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithAge),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(patientWithBmi),
      });
      (SensorReadingModel.findOne as jest.Mock).mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 20.0,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 90.0,
        recommendations: ['Maintain routine'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(20.0);
    });

    it('should use latestRestingHr sensor reading when present in database', async () => {
      const userWithAge = {
        _id: new Types.ObjectId(userId),
        email: 'resting@test.com',
        age: 45,
        gender: 'MALE',
      };

      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(userWithAge),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock findOne to return latestRestingHr when sensorType is RESTING_HEART_RATE
      (SensorReadingModel.findOne as jest.Mock).mockImplementation(
        (query: { sensorType: SensorType }) => {
          if (query.sensorType === SensorType.RESTING_HEART_RATE) {
            return {
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ value: 62 }),
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

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 15.0,
        riskLevel: CardiovascularRiskLevel.OPTIMAL,
        confidence: 95.0,
        recommendations: ['Maintain active lifestyle'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(15.0);
    });

    it('should derive resting HR from current heart rate when latestRestingHr is absent', async () => {
      (UserModel.findById as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockUserDoc),
      });
      (PatientModel.findOne as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      // Mock findOne to return latestHr when sensorType is HEART_RATE and null for RESTING_HEART_RATE
      (SensorReadingModel.findOne as jest.Mock).mockImplementation(
        (query: { sensorType?: SensorType }) => {
          if (query.sensorType === SensorType.HEART_RATE) {
            return {
              sort: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue({ value: 75 }),
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

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 22.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 85.0,
        recommendations: ['Maintain active lifestyle'],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskScore).toBe(22.5);
    });

    it('should fallback to LOW when AI returns unrecognized risk level', async () => {
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

      const aiResponseUnknownRisk = {
        data: {
          status: 'success',
          assessment: {
            risk_class: 99,
            risk_level: 'SUPER_CRITICAL_UNKNOWN',
            risk_score: 50.0,
            confidence: 50.0,
            probabilities: {},
            top_drivers: [],
            shap_string: '',
            recommended_intervention: '',
            action_id: 0,
          },
          guidance: {
            guidance_status: 'success',
            provider: 'static_fallback',
            message: 'Caution advised.',
          },
        },
      };

      (axios.post as jest.Mock).mockResolvedValue(aiResponseUnknownRisk);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 50.0,
        riskLevel: CardiovascularRiskLevel.LOW,
        confidence: 50.0,
        recommendations: [],
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.assessCardiovascularRisk({ userId });
      expect(result.riskLevel).toBe(CardiovascularRiskLevel.LOW);
    });

    it('should throw InternalServerError when AI service communication fails', async () => {
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

      (axios.post as jest.Mock).mockRejectedValue(new Error('Network error'));

      await expect(service.assessCardiovascularRisk({ userId })).rejects.toThrow(
        InternalServerError,
      );
    });
  });

  describe('getCurrentRisk', () => {
    it('should return latest risk if present', async () => {
      const mockDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 30,
        riskLevel: CardiovascularRiskLevel.LOW,
      };

      mockRepo.findLatestByUserId.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockRepo.findLatestByUserId>>,
      );

      const result = await service.getCurrentRisk(userId);

      expect(result.riskScore).toBe(30);
      expect(mockRepo.findLatestByUserId).toHaveBeenCalledWith(userId);
    });

    it('should trigger initial assessment if no current risk found', async () => {
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

      (axios.post as jest.Mock).mockResolvedValue(mockAIResponse);

      const mockSavedDoc = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(userId),
        riskScore: 22.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        timestamp: new Date(),
      };

      mockRepo.create.mockResolvedValue(
        mockSavedDoc as unknown as Awaited<ReturnType<typeof mockRepo.create>>,
      );
      (DigitalTwinModel.findOneAndUpdate as jest.Mock).mockReturnValue({
        exec: jest.fn().mockResolvedValue({}),
      });

      const result = await service.getCurrentRisk(userId);

      expect(result.riskScore).toBe(22.5);
    });
  });

  describe('getRiskHistory', () => {
    it('should return paginated history records with default and custom pagination', async () => {
      const mockResult = {
        records: [
          {
            _id: new Types.ObjectId(),
            riskScore: 25,
            riskLevel: CardiovascularRiskLevel.LOW,
          },
        ],
        total: 1,
      };

      mockRepo.getHistoryByUserId.mockResolvedValue(
        mockResult as unknown as Awaited<ReturnType<typeof mockRepo.getHistoryByUserId>>,
      );

      const resultDefault = await service.getRiskHistory(userId);
      expect(resultDefault.total).toBe(1);
      expect(mockRepo.getHistoryByUserId).toHaveBeenCalledWith(userId, 1, 20);

      const resultCustom = await service.getRiskHistory(userId, 2, 5);
      expect(resultCustom.total).toBe(1);
      expect(mockRepo.getHistoryByUserId).toHaveBeenCalledWith(userId, 2, 5);
    });
  });
});
