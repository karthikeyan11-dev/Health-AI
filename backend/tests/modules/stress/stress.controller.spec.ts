import { Types } from 'mongoose';
import { StressController } from '../../../src/modules/stress/stress.controller';
import type { StressService } from '../../../src/modules/stress/stress.service';
import {
  StressLevel,
  type IStressAssessmentDocument,
} from '../../../src/models/stress-assessment.model';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import { NotFoundError, BadRequestError } from '../../../src/shared/errors/httpErrors';

describe('StressController Unit Tests', () => {
  let controller: StressController;
  let mockService: jest.Mocked<StressService>;

  const userId = '507f1f77bcf86cd799439011';
  const mockDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    userId: new Types.ObjectId(userId),
    stressScore: 20,
    stressLevel: StressLevel.LOW,
    contributingFactors: ['Autonomic State: Relax'],
    confidence: 85,
    timestamp: new Date(),
  };

  const createMockResponse = <
    T extends 'assessStress' | 'getStressHistory' | 'getCurrentStress',
  >(): TypedResponse<T> => {
    const res: Record<string, jest.Mock> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as unknown as TypedResponse<T>;
  };

  beforeEach(() => {
    mockService = {
      assessStress: jest.fn(),
      getCurrentStress: jest.fn(),
      getStressHistory: jest.fn(),
    } as unknown as jest.Mocked<StressService>;

    controller = new StressController(mockService);
    jest.clearAllMocks();
  });

  describe('assessStress', () => {
    it('should return 200 with evaluated stress data', async () => {
      const req = {
        body: { userId, heartRate: 72, spo2: 98, temperature: 36.6 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();

      mockService.assessStress.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.assessStress>>,
      );

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            userId,
            stressScore: 20,
            stressLevel: StressLevel.LOW,
          }),
        }),
      );
    });

    it('should fallback to auth user id if not in body', async () => {
      const req = {
        body: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();

      mockService.assessStress.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.assessStress>>,
      );

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is completely missing in assessStress', async () => {
      const req = {
        body: {},
        user: undefined,
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in assessStress', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();
      mockService.assessStress.mockRejectedValue(new NotFoundError('User not found'));

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in assessStress', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();
      mockService.assessStress.mockRejectedValue(new Error('Internal server error'));

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error objects in assessStress', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessStress'>;

      const res = createMockResponse();
      mockService.assessStress.mockRejectedValue('String error');

      await controller.assessStress(req, res as TypedResponse<'assessStress'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCurrentStress', () => {
    it('should return 200 with current stress', async () => {
      const req = {
        query: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentStress'>;

      const res = createMockResponse();

      mockService.getCurrentStress.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.getCurrentStress>>,
      );

      await controller.getCurrentStress(req, res as TypedResponse<'getCurrentStress'>);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            userId,
            stressScore: 20,
          }),
        }),
      );
    });

    it('should fallback to auth user id in getCurrentStress', async () => {
      const req = {
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentStress'>;

      const res = createMockResponse();

      mockService.getCurrentStress.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.getCurrentStress>>,
      );

      await controller.getCurrentStress(req, res as TypedResponse<'getCurrentStress'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is missing in getCurrentStress', async () => {
      const req = {
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getCurrentStress'>;

      const res = createMockResponse();

      await controller.getCurrentStress(req, res as TypedResponse<'getCurrentStress'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getCurrentStress', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCurrentStress'>;

      const res = createMockResponse();
      mockService.getCurrentStress.mockRejectedValue(new NotFoundError('Not found'));

      await controller.getCurrentStress(req, res as TypedResponse<'getCurrentStress'>);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getCurrentStress', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCurrentStress'>;

      const res = createMockResponse();
      mockService.getCurrentStress.mockRejectedValue(new Error('Internal failure'));

      await controller.getCurrentStress(req, res as TypedResponse<'getCurrentStress'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getStressHistory', () => {
    it('should return 200 with paginated stress history', async () => {
      const req = {
        query: { userId, limit: 10 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getStressHistory'>;

      const res = createMockResponse();

      mockService.getStressHistory.mockResolvedValue({
        records: [mockDoc as unknown as IStressAssessmentDocument],
        total: 1,
      });

      await controller.getStressHistory(req, res as TypedResponse<'getStressHistory'>);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              stressScore: 20,
            }),
          ]),
        }),
      );
    });

    it('should fallback to auth user id and default limit in getStressHistory', async () => {
      const req = {
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getStressHistory'>;

      const res = createMockResponse();

      mockService.getStressHistory.mockResolvedValue({
        records: [],
        total: 0,
      });

      await controller.getStressHistory(req, res as TypedResponse<'getStressHistory'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is missing in getStressHistory', async () => {
      const req = {
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getStressHistory'>;

      const res = createMockResponse();

      await controller.getStressHistory(req, res as TypedResponse<'getStressHistory'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getStressHistory', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getStressHistory'>;

      const res = createMockResponse();
      mockService.getStressHistory.mockRejectedValue(new BadRequestError('Bad input'));

      await controller.getStressHistory(req, res as TypedResponse<'getStressHistory'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle generic errors in getStressHistory', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getStressHistory'>;

      const res = createMockResponse();
      mockService.getStressHistory.mockRejectedValue(new Error('Internal failure'));

      await controller.getStressHistory(req, res as TypedResponse<'getStressHistory'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
