import { Types } from 'mongoose';
import { CardiovascularRepository } from '../../../src/modules/cardiovascular/cardiovascular.repository';
import {
  CardiovascularAssessmentModel,
  CardiovascularRiskLevel,
} from '../../../src/models/cardiovascular-assessment.model';

jest.mock('../../../src/models/cardiovascular-assessment.model');

describe('CardiovascularRepository Unit Tests', () => {
  let repository: CardiovascularRepository;

  beforeEach(() => {
    repository = new CardiovascularRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new cardiovascular assessment document', async () => {
      const mockAssessmentData = {
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        riskScore: 25.5,
        riskLevel: CardiovascularRiskLevel.LOW,
        recommendations: ['Walk 30 mins'],
        heartRate: 72,
        spo2: 98,
        temperature: 36.6,
      };

      (CardiovascularAssessmentModel.create as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        ...mockAssessmentData,
      });

      const result = await repository.create(mockAssessmentData);

      expect(CardiovascularAssessmentModel.create).toHaveBeenCalledWith(mockAssessmentData);
      expect(result.riskScore).toBe(25.5);
      expect(result.riskLevel).toBe(CardiovascularRiskLevel.LOW);
    });
  });

  describe('findLatestByUserId', () => {
    it('should query and return the latest assessment document with string userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockExec = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        userId: new Types.ObjectId(userId),
        riskScore: 40,
        riskLevel: CardiovascularRiskLevel.MODERATE,
      });

      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestByUserId(userId);

      expect(CardiovascularAssessmentModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(mockSort).toHaveBeenCalledWith({ timestamp: -1 });
      expect(result?.riskScore).toBe(40);
    });

    it('should query and return the latest assessment document with Types.ObjectId userId', async () => {
      const userObjId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (CardiovascularAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestByUserId(userObjId);

      expect(result).toBeNull();
    });
  });

  describe('getHistoryByUserId', () => {
    it('should return paginated assessment records and total count with default pagination', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockRecords = [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          riskScore: 20,
          riskLevel: CardiovascularRiskLevel.LOW,
        },
      ];

      const mockExec = jest.fn().mockResolvedValue(mockRecords);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      (CardiovascularAssessmentModel.find as jest.Mock).mockReturnValue({ sort: mockSort });
      (CardiovascularAssessmentModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await repository.getHistoryByUserId(userId);

      expect(result.records).toEqual(mockRecords);
      expect(result.total).toBe(1);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should return paginated assessment records with Types.ObjectId and custom pagination', async () => {
      const userObjId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const mockExec = jest.fn().mockResolvedValue([]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      (CardiovascularAssessmentModel.find as jest.Mock).mockReturnValue({ sort: mockSort });
      (CardiovascularAssessmentModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await repository.getHistoryByUserId(userObjId, 2, 5);

      expect(result.records).toEqual([]);
      expect(result.total).toBe(0);
      expect(mockSkip).toHaveBeenCalledWith(5);
      expect(mockLimit).toHaveBeenCalledWith(5);
    });
  });
});
