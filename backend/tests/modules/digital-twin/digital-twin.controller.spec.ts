import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { DigitalTwinController } from '../../../src/modules/digital-twin/digital-twin.controller';
import type { DigitalTwinService } from '../../../src/modules/digital-twin/digital-twin.service';
import {
  TwinHealthState,
  EmotionType,
  type IDigitalTwinDocument,
} from '../../../src/models/digital-twin.model';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import { NotFoundError, BadRequestError } from '../../../src/shared/errors/httpErrors';

describe('DigitalTwinController Unit Tests', () => {
  let controller: DigitalTwinController;
  let mockService: jest.Mocked<DigitalTwinService>;

  const userId = '507f1f77bcf86cd799439011';
  const mockTwinDoc: IDigitalTwinDocument = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    id: '507f1f77bcf86cd799439012',
    userId: new Types.ObjectId(userId),
    overallHealthScore: 92,
    healthState: TwinHealthState.OPTIMAL,
    baselineHeartRate: 72,
    baselineTemperature: 36.5,
    baselineSpO2: 98,
    dominantEmotion: EmotionType.HAPPY,
    currentStressScore: 18,
    currentCardioRiskScore: 12,
    confidence: 95,
    lastSyncTimestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IDigitalTwinDocument;

  const createMockResponse = <
    T extends
      | 'createDigitalTwin'
      | 'getDigitalTwin'
      | 'updateDigitalTwin'
      | 'getCurrentTwinState'
      | 'getHealthHistory'
      | 'getHealthTrendAnalysis'
      | 'getDigitalTwinSnapshots',
  >(): TypedResponse<T> => {
    const res: Record<string, jest.Mock> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as unknown as TypedResponse<T>;
  };

  beforeEach(() => {
    mockService = {
      createDigitalTwin: jest.fn(),
      getDigitalTwin: jest.fn(),
      updateDigitalTwin: jest.fn(),
      getCurrentTwinState: jest.fn(),
      getHealthHistory: jest.fn(),
      getHealthTrendAnalysis: jest.fn(),
      getSnapshots: jest.fn(),
      simulateDigitalTwinTrajectory: jest.fn(),
    } as unknown as jest.Mocked<DigitalTwinService>;

    controller = new DigitalTwinController(mockService);
    jest.clearAllMocks();
  });

  describe('createDigitalTwin', () => {
    it('should return 201 with created twin data', async () => {
      const req = {
        body: { userId, baselineHeartRate: 72 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ userId }),
        }),
      );
    });

    it('should fallback to auth user id if not provided in body', async () => {
      const req = {
        body: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should format patientId and explicit version correctly when present', async () => {
      const twinWithPatient = {
        ...mockTwinDoc,
        patientId: new Types.ObjectId('507f1f77bcf86cd799439099'),
        version: 5,
      };
      const req = {
        body: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockResolvedValue(
        twinWithPatient as unknown as IDigitalTwinDocument,
      );

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            patientId: '507f1f77bcf86cd799439099',
            version: 5,
          }),
        }),
      );
    });

    it('should return 400 when user ID is completely missing', async () => {
      const req = {
        body: {},
        user: undefined,
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in createDigitalTwin', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockRejectedValue(new BadRequestError('Twin already exists'));

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle generic errors in createDigitalTwin', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockRejectedValue(new Error('Internal server error'));

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in createDigitalTwin', async () => {
      const req = {
        body: { userId },
      } as unknown as TypedRequest<'createDigitalTwin'>;

      const res = createMockResponse<'createDigitalTwin'>();
      mockService.createDigitalTwin.mockRejectedValue('String error failure');

      await controller.createDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getDigitalTwin', () => {
    it('should return 200 with Digital Twin data', async () => {
      const req = {
        params: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      mockService.getDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ userId }),
        }),
      );
    });

    it('should fallback to auth user id if params empty in getDigitalTwin', async () => {
      const req = {
        params: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      mockService.getDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID is completely missing in getDigitalTwin', async () => {
      const req = {
        params: {},
        user: undefined,
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getDigitalTwin', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      mockService.getDigitalTwin.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getDigitalTwin', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      mockService.getDigitalTwin.mockRejectedValue(new Error('Internal server error'));

      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in getDigitalTwin', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getDigitalTwin'>;

      const res = createMockResponse<'getDigitalTwin'>();
      mockService.getDigitalTwin.mockRejectedValue('String error failure');

      await controller.getDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateDigitalTwin', () => {
    it('should return 200 with updated Digital Twin', async () => {
      const req = {
        params: { userId },
        body: { baselineHeartRate: 70 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      mockService.updateDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id if params empty in updateDigitalTwin', async () => {
      const req = {
        params: {},
        body: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      mockService.updateDigitalTwin.mockResolvedValue(mockTwinDoc);

      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID missing in updateDigitalTwin', async () => {
      const req = {
        params: {},
        body: {},
        user: undefined,
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in updateDigitalTwin', async () => {
      const req = {
        params: { userId },
        body: {},
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      mockService.updateDigitalTwin.mockRejectedValue(new NotFoundError('Twin not found'));

      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in updateDigitalTwin', async () => {
      const req = {
        params: { userId },
        body: {},
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      mockService.updateDigitalTwin.mockRejectedValue(new Error('Internal server error'));

      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in updateDigitalTwin', async () => {
      const req = {
        params: { userId },
        body: {},
      } as unknown as TypedRequest<'updateDigitalTwin'>;

      const res = createMockResponse<'updateDigitalTwin'>();
      mockService.updateDigitalTwin.mockRejectedValue('String error failure');

      await controller.updateDigitalTwin(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getCurrentTwinState', () => {
    it('should return 200 with dynamic twin state', async () => {
      const req = {
        params: { userId },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      mockService.getCurrentTwinState.mockResolvedValue(mockTwinDoc);

      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id if params empty in getCurrentTwinState', async () => {
      const req = {
        params: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      mockService.getCurrentTwinState.mockResolvedValue(mockTwinDoc);

      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID missing in getCurrentTwinState', async () => {
      const req = {
        params: {},
        user: undefined,
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getCurrentTwinState', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      mockService.getCurrentTwinState.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getCurrentTwinState', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      mockService.getCurrentTwinState.mockRejectedValue(new Error('Internal server error'));

      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in getCurrentTwinState', async () => {
      const req = {
        params: { userId },
      } as unknown as TypedRequest<'getCurrentTwinState'>;

      const res = createMockResponse<'getCurrentTwinState'>();
      mockService.getCurrentTwinState.mockRejectedValue('String error failure');

      await controller.getCurrentTwinState(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getHealthHistory', () => {
    it('should return 200 with health history array', async () => {
      const req = {
        params: { userId },
        query: { days: 14 },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      const history = [
        {
          timestamp: new Date().toISOString(),
          healthScore: 90,
          healthState: TwinHealthState.OPTIMAL,
        },
      ];
      mockService.getHealthHistory.mockResolvedValue(history);

      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockService.getHealthHistory).toHaveBeenCalledWith(userId, 14);
    });

    it('should fallback to auth user id and default days in getHealthHistory', async () => {
      const req = {
        params: {},
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      mockService.getHealthHistory.mockResolvedValue([]);

      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockService.getHealthHistory).toHaveBeenCalledWith(userId, 30);
    });

    it('should return 400 when user ID missing in getHealthHistory', async () => {
      const req = {
        params: {},
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getHealthHistory', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      mockService.getHealthHistory.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getHealthHistory', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      mockService.getHealthHistory.mockRejectedValue(new Error('Internal server error'));

      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in getHealthHistory', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthHistory'>;

      const res = createMockResponse<'getHealthHistory'>();
      mockService.getHealthHistory.mockRejectedValue('String error failure');

      await controller.getHealthHistory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getHealthTrendAnalysis', () => {
    it('should return 200 with trend analysis insights', async () => {
      const req = {
        params: { userId },
        query: { period: '30_DAYS' },
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      const trendData = {
        userId,
        period: '30_DAYS' as const,
        heartRateTrend: 'STABLE' as const,
        stressTrend: 'DECREASING' as const,
        cardioRiskTrend: 'STABLE' as const,
        insights: ['Insight 1'],
      };
      mockService.getHealthTrendAnalysis.mockResolvedValue(trendData);

      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockService.getHealthTrendAnalysis).toHaveBeenCalledWith(userId, '30_DAYS');
    });

    it('should fallback to default period in getHealthTrendAnalysis', async () => {
      const req = {
        params: {},
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      mockService.getHealthTrendAnalysis.mockResolvedValue({
        userId,
        period: '7_DAYS',
        heartRateTrend: 'STABLE',
        stressTrend: 'STABLE',
        cardioRiskTrend: 'STABLE',
        insights: [],
      });

      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(mockService.getHealthTrendAnalysis).toHaveBeenCalledWith(userId, '7_DAYS');
    });

    it('should return 400 when user ID missing in getHealthTrendAnalysis', async () => {
      const req = {
        params: {},
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getHealthTrendAnalysis', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      mockService.getHealthTrendAnalysis.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getHealthTrendAnalysis', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      mockService.getHealthTrendAnalysis.mockRejectedValue(new Error('Internal server error'));

      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in getHealthTrendAnalysis', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getHealthTrendAnalysis'>;

      const res = createMockResponse<'getHealthTrendAnalysis'>();
      mockService.getHealthTrendAnalysis.mockRejectedValue('String error failure');

      await controller.getHealthTrendAnalysis(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getDigitalTwinSnapshots', () => {
    const mockSnapshotsResult = {
      items: [
        {
          id: '507f1f77bcf86cd799439019',
          userId,
          digitalTwinId: '507f1f77bcf86cd799439012',
          overallHealthScore: 88,
          healthState: TwinHealthState.OPTIMAL,
          dominantEmotion: EmotionType.HAPPY,
          stressScore: 20,
          cardioRiskScore: 14,
          triggerReason:
            'TELEMETRY_SYNC' as unknown as import('../../../src/models/digital-twin-snapshot.model').SnapshotTriggerReason,
          version: 1,
          timestamp: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    it('should return 200 with paginated snapshots when requested', async () => {
      const req = {
        params: { userId },
        query: { page: '1', limit: '10' },
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockResolvedValue(mockSnapshotsResult);

      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockSnapshotsResult,
        }),
      );
    });

    it('should pass through query filters for startDate, endDate, page, limit, and trigger', async () => {
      const req = {
        params: { userId },
        query: {
          page: '2',
          limit: '25',
          startDate: '2026-08-01T00:00:00.000Z',
          endDate: '2026-08-31T23:59:59.999Z',
          trigger: 'BASELINE_CALIBRATION',
        },
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockResolvedValue(mockSnapshotsResult);

      await controller.getDigitalTwinSnapshots(req, res);

      expect(mockService.getSnapshots).toHaveBeenCalledWith(userId, {
        page: 2,
        limit: 25,
        startDate: '2026-08-01T00:00:00.000Z',
        endDate: '2026-08-31T23:59:59.999Z',
        trigger: 'BASELINE_CALIBRATION',
      });
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id if params empty in getDigitalTwinSnapshots', async () => {
      const req = {
        params: {},
        query: {},
        user: { id: userId, email: 'karthi@test.com', role: 'PATIENT' },
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockResolvedValue(mockSnapshotsResult);

      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when user ID missing in getDigitalTwinSnapshots', async () => {
      const req = {
        params: {},
        query: {},
        user: undefined,
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should handle HttpErrors in getDigitalTwinSnapshots', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in getDigitalTwinSnapshots', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockRejectedValue(new Error('Internal server error'));

      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in getDigitalTwinSnapshots', async () => {
      const req = {
        params: { userId },
        query: {},
      } as unknown as TypedRequest<'getDigitalTwinSnapshots'>;

      const res = createMockResponse<'getDigitalTwinSnapshots'>();
      mockService.getSnapshots.mockRejectedValue('String error failure');

      await controller.getDigitalTwinSnapshots(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('simulateTrajectory', () => {
    const mockTrajectoryData = {
      status: 'success',
      forecast_days: 30,
      mean_risk_score: 15.0,
      risk_trend: 'STABLE',
      trajectory: [],
    };

    it('should return 200 with simulation results when userId and forecastDays in query are provided', async () => {
      const req = {
        params: { userId },
        query: { forecastDays: '14' },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockResolvedValue(mockTrajectoryData);

      await controller.simulateTrajectory(req, res);

      expect(mockService.simulateDigitalTwinTrajectory).toHaveBeenCalledWith(userId, 14);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockTrajectoryData,
        }),
      );
    });

    it('should read forecastDays from body if query not present', async () => {
      const req = {
        params: { userId },
        query: {},
        body: { forecastDays: 45 },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockResolvedValue(mockTrajectoryData);

      await controller.simulateTrajectory(req, res);

      expect(mockService.simulateDigitalTwinTrajectory).toHaveBeenCalledWith(userId, 45);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should fallback to auth user id and default 30 days when userId is "me"', async () => {
      const req = {
        params: { userId: 'me' },
        user: { id: userId },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockResolvedValue(mockTrajectoryData);

      await controller.simulateTrajectory(req, res);

      expect(mockService.simulateDigitalTwinTrajectory).toHaveBeenCalledWith(userId, 30);
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when userId is missing', async () => {
      const req = {
        params: {},
        user: undefined,
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      await controller.simulateTrajectory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            message: 'User ID is required for trajectory simulation',
          }),
        }),
      );
    });

    it('should handle HttpErrors appropriately', async () => {
      const req = {
        params: { userId },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockRejectedValue(
        new NotFoundError('Twin not found'),
      );

      await controller.simulateTrajectory(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it('should handle generic errors in simulateTrajectory', async () => {
      const req = {
        params: { userId },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockRejectedValue(new Error('AI Engine crash'));

      await controller.simulateTrajectory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    it('should handle non-Error generic errors in simulateTrajectory', async () => {
      const req = {
        params: { userId },
      } as unknown as Request<
        { userId?: string },
        unknown,
        { forecastDays?: number },
        { forecastDays?: string }
      >;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
      } as unknown as Response;

      mockService.simulateDigitalTwinTrajectory.mockRejectedValue('Unknown crash');

      await controller.simulateTrajectory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
