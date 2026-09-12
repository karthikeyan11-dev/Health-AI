import type { TypedRequest, TypedResponse } from '@shared/types/express/express.types';
import { stressService, StressService } from './stress.service';
import { BadRequestError, HttpErrors } from '../../shared/errors/httpErrors';
import { logger } from '@config/logger';
import { StressLevel, EmotionType } from '../../models/stress-assessment.model';

export class StressController {
  constructor(private readonly service: StressService = stressService) {}

  /**
   * POST /stress/assess
   * Evaluates autonomic stress using physiological telemetry.
   */
  public assessStress = async (
    req: TypedRequest<'assessStress'>,
    res: TypedResponse<'assessStress'>,
  ): Promise<TypedResponse<'assessStress'>> => {
    try {
      const body = req.body;
      const targetUserId = body.userId || (req.user?.id ? String(req.user.id) : '');

      if (!targetUserId) {
        throw new BadRequestError('User ID is required for stress assessment');
      }

      const result = await this.service.assessStress({
        userId: targetUserId,
        heartRate: body.heartRate,
        spo2: body.spo2,
        temperature: body.temperature,
        currentEmotion: body.currentEmotion as EmotionType | undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Stress level evaluated successfully',
        data: {
          userId: result.userId.toString(),
          stressScore: result.stressScore,
          stressLevel: result.stressLevel as StressLevel,
          contributingFactors: result.contributingFactors,
          confidence: result.confidence,
          timestamp: result.timestamp.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'StressController.assessStress - Error');
      if (error instanceof HttpErrors) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name.toUpperCase(),
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Failed to evaluate stress level',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /stress/current
   * Retrieves current stress state.
   */
  public getCurrentStress = async (
    req: TypedRequest<'getCurrentStress'>,
    res: TypedResponse<'getCurrentStress'>,
  ): Promise<TypedResponse<'getCurrentStress'>> => {
    try {
      const { userId } = req.query;
      const targetUserId = userId || (req.user?.id ? String(req.user.id) : '');

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const result = await this.service.getCurrentStress(targetUserId);

      return res.status(200).json({
        success: true,
        message: 'Current stress assessment retrieved',
        data: {
          userId: result.userId.toString(),
          stressScore: result.stressScore,
          stressLevel: result.stressLevel as StressLevel,
          contributingFactors: result.contributingFactors,
          confidence: result.confidence,
          timestamp: result.timestamp.toISOString(),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'StressController.getCurrentStress - Error');
      if (error instanceof HttpErrors) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name.toUpperCase(),
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve stress assessment',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /stress/history
   * Retrieves paginated stress history.
   */
  public getStressHistory = async (
    req: TypedRequest<'getStressHistory'>,
    res: TypedResponse<'getStressHistory'>,
  ): Promise<TypedResponse<'getStressHistory'>> => {
    try {
      const { userId, limit } = req.query;
      const targetUserId = userId || (req.user?.id ? String(req.user.id) : '');

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const limitNum = limit ? parseInt(String(limit), 10) : 20;

      const { records } = await this.service.getStressHistory(targetUserId, 1, limitNum);

      const formattedRecords = records.map((r) => ({
        id: r._id.toString(),
        userId: r.userId.toString(),
        stressScore: r.stressScore,
        stressLevel: r.stressLevel as StressLevel,
        confidence: r.confidence,
        timestamp: r.timestamp.toISOString(),
      }));

      return res.status(200).json({
        success: true,
        message: 'Stress history retrieved successfully',
        data: formattedRecords,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'StressController.getStressHistory - Error');
      if (error instanceof HttpErrors) {
        return res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.name.toUpperCase(),
            message: error.message,
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
          },
        });
      }
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to retrieve stress history',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const stressController = new StressController();
