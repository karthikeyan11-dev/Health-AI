import { Types } from 'mongoose';
import { StressRepository } from '../../../src/modules/stress/stress.repository';
import { StressAssessmentModel, StressLevel } from '../../../src/models/stress-assessment.model';

jest.mock('../../../src/models/stress-assessment.model');

describe('StressRepository Unit Tests', () => {
  let repository: StressRepository;

  beforeEach(() => {
    repository = new StressRepository();
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a new stress assessment document', async () => {
      const mockData = {
        userId: new Types.ObjectId('507f1f77bcf86cd799439011'),
        stressScore: 35,
        stressLevel: StressLevel.MODERATE,
        contributingFactors: ['Elevated HR'],
      };

      (StressAssessmentModel.create as jest.Mock).mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        ...mockData,
      });

      const result = await repository.create(mockData);

      expect(StressAssessmentModel.create).toHaveBeenCalledWith(mockData);
      expect(result.stressScore).toBe(35);
      expect(result.stressLevel).toBe(StressLevel.MODERATE);
    });
  });

  describe('findLatestByUserId', () => {
    it('should query and return latest stress assessment with string userId', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockExec = jest.fn().mockResolvedValue({
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        userId: new Types.ObjectId(userId),
        stressScore: 20,
        stressLevel: StressLevel.LOW,
      });

      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestByUserId(userId);

      expect(StressAssessmentModel.findOne).toHaveBeenCalledWith({
        userId: new Types.ObjectId(userId),
      });
      expect(result?.stressScore).toBe(20);
    });

    it('should query and return latest stress assessment with ObjectId', async () => {
      const userObjId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockSort = jest.fn().mockReturnValue({ exec: mockExec });
      (StressAssessmentModel.findOne as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findLatestByUserId(userObjId);

      expect(result).toBeNull();
    });
  });

  describe('getHistoryByUserId', () => {
    it('should return paginated stress assessment history with defaults', async () => {
      const userId = '507f1f77bcf86cd799439011';
      const mockRecords = [
        {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          stressScore: 20,
          stressLevel: StressLevel.LOW,
        },
      ];

      const mockExec = jest.fn().mockResolvedValue(mockRecords);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      (StressAssessmentModel.find as jest.Mock).mockReturnValue({ sort: mockSort });
      (StressAssessmentModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await repository.getHistoryByUserId(userId);

      expect(result.records).toEqual(mockRecords);
      expect(result.total).toBe(1);
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should return paginated stress assessment history with custom pagination', async () => {
      const userObjId = new Types.ObjectId('507f1f77bcf86cd799439011');
      const mockExec = jest.fn().mockResolvedValue([]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });

      (StressAssessmentModel.find as jest.Mock).mockReturnValue({ sort: mockSort });
      (StressAssessmentModel.countDocuments as jest.Mock).mockResolvedValue(0);

      const result = await repository.getHistoryByUserId(userObjId, 3, 10);

      expect(result.records).toEqual([]);
      expect(mockSkip).toHaveBeenCalledWith(20);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });
});
