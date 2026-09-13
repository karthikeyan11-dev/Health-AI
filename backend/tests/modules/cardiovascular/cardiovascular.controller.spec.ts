import { Types } from 'mongoose';
import { CardiovascularController } from '../../../src/modules/cardiovascular/cardiovascular.controller';
import type { CardiovascularService } from '../../../src/modules/cardiovascular/cardiovascular.service';
import {
  CardiovascularRiskLevel,
  type ICardiovascularAssessmentDocument,
} from '../../../src/models/cardiovascular-assessment.model';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import { NotFoundError, BadRequestError } from '../../../src/shared/errors/httpErrors';

describe('CardiovascularController Unit Tests', () => {
  let controller: CardiovascularController;
  let mockService: jest.Mocked<CardiovascularService>;

  const userId = '507f1f77bcf86cd799439011';
  const mockDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    userId: new Types.ObjectId(userId),
    riskScore: 25.5,
    riskLevel: CardiovascularRiskLevel.LOW,
    contributingFactors: ['bp_systolic: 120 (Impact: 0.2)'],
    topDrivers: [{ feature: 'bp_systolic', value: 120, impact: 0.2 }],
    probabilities: new Map([['LOW', 0.85]]),
    confidence: 85.0,
    explanation: 'Low cardiovascular risk detected.',
    recommendations: ['Walk 30 mins'],
    recommendedIntervention: 'Maintain Routine / Rest',
    guidance: {
      status: 'success',
      provider: 'gemini',
      message: 'Looking great!',
    },
    timestamp: new Date(),
  };

  const createMockResponse = <
    T extends
      'assessCardiovascularRisk' | 'getCardiovascularRiskHistory' | 'getCurrentCardiovascularRisk',
  >(): TypedResponse<T> => {
    const res: Record<string, jest.Mock> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as unknown as TypedResponse<T>;
  };

  beforeEach(() => {
    mockService = {
      assessCardiovascularRisk: jest.fn(),
      getCurrentRisk: jest.fn(),
      getRiskHistory: jest.fn(),
    } as unknown as jest.Mocked<CardiovascularService>;

    controller = new CardiovascularController(mockService);
    jest.clearAllMocks();
  });

  describe('assessRisk', () => {
    it('should return 200 with formatted assessment data when all fields present (Map probabilities)', async () => {
      const req = {
        body: { userId, age: 30, systolicBp: 120 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();

      mockService.assessCardiovascularRisk.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.assessCardiovascularRisk>>,
      );

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 200 with plain object probabilities', async () => {
      const plainObjDoc = {
        ...mockDoc,
        probabilities: { OPTIMAL: 0.1, LOW: 0.9 },
      };
      const req = {
        body: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.assessCardiovascularRisk.mockResolvedValue(
        plainObjDoc as unknown as Awaited<ReturnType<typeof mockService.assessCardiovascularRisk>>,
      );

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id and default guidance if not in doc', async () => {
      const req = {
        body: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();

      const docWithoutGuidance = {
        ...mockDoc,
        contributingFactors: undefined as unknown as string[],
        topDrivers: undefined as unknown as Array<{
          feature: string;
          value: number;
          impact: number;
        }>,
        probabilities: undefined,
        guidance: undefined,
      };

      mockService.assessCardiovascularRisk.mockResolvedValue(
        docWithoutGuidance as unknown as Awaited<
          ReturnType<typeof mockService.assessCardiovascularRisk>
        >,
      );

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is completely missing', async () => {
      const req = {
        body: {},
        user: undefined,
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors appropriately', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.assessCardiovascularRisk.mockRejectedValue(new NotFoundError('User not found'));

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors appropriately', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.assessCardiovascularRisk.mockRejectedValue(new Error('Unexpected DB error'));

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error throwables', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'assessCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.assessCardiovascularRisk.mockRejectedValue('String error');

      await controller.assessRisk(req, res as TypedResponse<'assessCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCurrentRisk', () => {
    it('should return 200 with current risk state (Map probabilities)', async () => {
      const req = {
        query: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentCardiovascularRisk'>;

      const res = createMockResponse();

      mockService.getCurrentRisk.mockResolvedValue(
        mockDoc as unknown as Awaited<ReturnType<typeof mockService.getCurrentRisk>>,
      );

      await controller.getCurrentRisk(req, res as TypedResponse<'getCurrentCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id and handle missing guidance in getCurrentRisk', async () => {
      const req = {
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentCardiovascularRisk'>;

      const res = createMockResponse();
      const docNoGuidance = { ...mockDoc, probabilities: { LOW: 0.8 }, guidance: undefined };

      mockService.getCurrentRisk.mockResolvedValue(
        docNoGuidance as unknown as Awaited<ReturnType<typeof mockService.getCurrentRisk>>,
      );

      await controller.getCurrentRisk(req, res as TypedResponse<'getCurrentCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is missing in getCurrentRisk', async () => {
      const req = {
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getCurrentCardiovascularRisk'>;

      const res = createMockResponse();

      await controller.getCurrentRisk(req, res as TypedResponse<'getCurrentCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getCurrentRisk', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCurrentCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.getCurrentRisk.mockRejectedValue(new NotFoundError('Not found'));

      await controller.getCurrentRisk(req, res as TypedResponse<'getCurrentCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getCurrentRisk', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCurrentCardiovascularRisk'>;

      const res = createMockResponse();
      mockService.getCurrentRisk.mockRejectedValue(new Error('Generic failure'));

      await controller.getCurrentRisk(req, res as TypedResponse<'getCurrentCardiovascularRisk'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getRiskHistory', () => {
    it('should return 200 with paginated history', async () => {
      const req = {
        query: { userId, limit: 10 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCardiovascularRiskHistory'>;

      const res = createMockResponse();

      mockService.getRiskHistory.mockResolvedValue({
        records: [mockDoc as unknown as ICardiovascularAssessmentDocument],
        total: 1,
      });

      await controller.getRiskHistory(req, res as TypedResponse<'getCardiovascularRiskHistory'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id and default limit in getRiskHistory', async () => {
      const req = {
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCardiovascularRiskHistory'>;

      const res = createMockResponse();

      mockService.getRiskHistory.mockResolvedValue({
        records: [],
        total: 0,
      });

      await controller.getRiskHistory(req, res as TypedResponse<'getCardiovascularRiskHistory'>);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is missing in getRiskHistory', async () => {
      const req = {
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getCardiovascularRiskHistory'>;

      const res = createMockResponse();

      await controller.getRiskHistory(req, res as TypedResponse<'getCardiovascularRiskHistory'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getRiskHistory', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCardiovascularRiskHistory'>;

      const res = createMockResponse();
      mockService.getRiskHistory.mockRejectedValue(new BadRequestError('Bad input'));

      await controller.getRiskHistory(req, res as TypedResponse<'getCardiovascularRiskHistory'>);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle generic errors in getRiskHistory', async () => {
      const req = {
        query: { userId },
      } as unknown as TypedRequest<'getCardiovascularRiskHistory'>;

      const res = createMockResponse();
      mockService.getRiskHistory.mockRejectedValue(new Error('Internal failure'));

      await controller.getRiskHistory(req, res as TypedResponse<'getCardiovascularRiskHistory'>);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
