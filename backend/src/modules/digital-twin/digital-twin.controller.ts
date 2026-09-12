import type { Request, Response } from 'express';
import type {
  TypedRequest,
  TypedResponse,
  AuthenticatedUser,
} from '@shared/types/express/express.types';
import { DigitalTwinService, digitalTwinService } from './digital-twin.service';
import { BadRequestError, HttpErrors } from '../../shared/errors/httpErrors';
import { logger } from '@config/logger';
import {
  TwinHealthState,
  EmotionType,
  type IDigitalTwinDocument,
} from '../../models/digital-twin.model';
import type { DigitalTwinResponseDTO } from './digital-twin.interface';

export class DigitalTwinController {
  constructor(private readonly service: DigitalTwinService = digitalTwinService) {}

  private formatTwinResponse(doc: IDigitalTwinDocument): DigitalTwinResponseDTO {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      patientId: doc.patientId ? doc.patientId.toString() : undefined,
      version: doc.version || 1,
      overallHealthScore: doc.overallHealthScore,
      healthState: doc.healthState as TwinHealthState,
      baselineHeartRate: doc.baselineHeartRate,
      baselineTemperature: doc.baselineTemperature,
      baselineSpO2: doc.baselineSpO2,
      dominantEmotion: doc.dominantEmotion as EmotionType,
      currentStressScore: doc.currentStressScore,
      currentCardioRiskScore: doc.currentCardioRiskScore,
      confidence: doc.confidence,
      lastSyncTimestamp: doc.lastSyncTimestamp.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }

  /**
   * POST /digital-twin
   * Initializes a new Digital Twin instance.
   */
  public createDigitalTwin = async (
    req: TypedRequest<'createDigitalTwin'>,
    res: TypedResponse<'createDigitalTwin'>,
  ): Promise<TypedResponse<'createDigitalTwin'>> => {
    try {
      const { userId, baselineHeartRate, baselineTemperature, baselineSpO2 } = req.body;
      const dominantEmotion = (req.body as { dominantEmotion?: EmotionType }).dominantEmotion;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required to create a Digital Twin');
      }

      const twin = await this.service.createDigitalTwin({
        userId: targetUserId,
        baselineHeartRate,
        baselineTemperature,
        baselineSpO2,
        dominantEmotion: dominantEmotion as EmotionType | undefined,
      });

      return res.status(201).json({
        success: true,
        message: 'Digital Twin initialized successfully',
        data: this.formatTwinResponse(twin),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.createDigitalTwin - Error');
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
          message: error instanceof Error ? error.message : 'Failed to create Digital Twin',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/{userId}
   * Retrieves full Digital Twin profile state.
   */
  public getDigitalTwin = async (
    req: TypedRequest<'getDigitalTwin'>,
    res: TypedResponse<'getDigitalTwin'>,
  ): Promise<TypedResponse<'getDigitalTwin'>> => {
    try {
      const { userId } = req.params;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const twin = await this.service.getDigitalTwin(targetUserId);

      return res.status(200).json({
        success: true,
        message: 'Digital Twin retrieved successfully',
        data: this.formatTwinResponse(twin),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.getDigitalTwin - Error');
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
          message: error instanceof Error ? error.message : 'Failed to retrieve Digital Twin',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * PUT /digital-twin/{userId}
   * Updates baseline vital sign thresholds and emotion settings.
   */
  public updateDigitalTwin = async (
    req: TypedRequest<'updateDigitalTwin'>,
    res: TypedResponse<'updateDigitalTwin'>,
  ): Promise<TypedResponse<'updateDigitalTwin'>> => {
    try {
      const { userId } = req.params;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const { baselineHeartRate, baselineTemperature, baselineSpO2 } = req.body;
      const dominantEmotion = (req.body as { dominantEmotion?: EmotionType }).dominantEmotion;

      const twin = await this.service.updateDigitalTwin(targetUserId, {
        baselineHeartRate,
        baselineTemperature,
        baselineSpO2,
        dominantEmotion: dominantEmotion as EmotionType | undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Digital Twin updated successfully',
        data: this.formatTwinResponse(twin),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.updateDigitalTwin - Error');
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
          message: error instanceof Error ? error.message : 'Failed to update Digital Twin',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/{userId}/state
   * Computes dynamic real-time health snapshot of Digital Twin.
   */
  public getCurrentTwinState = async (
    req: TypedRequest<'getCurrentTwinState'>,
    res: TypedResponse<'getCurrentTwinState'>,
  ): Promise<TypedResponse<'getCurrentTwinState'>> => {
    try {
      const { userId } = req.params;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const twin = await this.service.getCurrentTwinState(targetUserId);

      return res.status(200).json({
        success: true,
        message: 'Current Digital Twin state calculated successfully',
        data: this.formatTwinResponse(twin),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.getCurrentTwinState - Error');
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
          message: error instanceof Error ? error.message : 'Failed to retrieve Digital Twin state',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/{userId}/history
   * Retrieves historical health score snapshots and vital trends.
   */
  public getHealthHistory = async (
    req: TypedRequest<'getHealthHistory'>,
    res: TypedResponse<'getHealthHistory'>,
  ): Promise<TypedResponse<'getHealthHistory'>> => {
    try {
      const { userId } = req.params;
      const { days } = req.query;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const daysNum = days ? parseInt(String(days), 10) : 30;
      const history = await this.service.getHealthHistory(targetUserId, daysNum);

      return res.status(200).json({
        success: true,
        message: 'Digital Twin health history retrieved successfully',
        data: history,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.getHealthHistory - Error');
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
          message: error instanceof Error ? error.message : 'Failed to retrieve health history',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/{userId}/trends
   * Evaluates predictive trends and anomaly patterns.
   */
  public getHealthTrendAnalysis = async (
    req: TypedRequest<'getHealthTrendAnalysis'>,
    res: TypedResponse<'getHealthTrendAnalysis'>,
  ): Promise<TypedResponse<'getHealthTrendAnalysis'>> => {
    try {
      const { userId } = req.params;
      const { period } = req.query;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const safePeriod = period === '90_DAYS' || period === '30_DAYS' ? period : '7_DAYS';
      const trends = await this.service.getHealthTrendAnalysis(targetUserId, safePeriod);

      return res.status(200).json({
        success: true,
        message: 'Health trend analysis computed successfully',
        data: trends,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.getHealthTrendAnalysis - Error');
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
          message:
            error instanceof Error ? error.message : 'Failed to compute health trend analysis',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/{userId}/snapshots
   * Retrieves paginated immutable snapshots of the Digital Twin for time-travel and auditing.
   */
  public getDigitalTwinSnapshots = async (
    req: TypedRequest<'getDigitalTwinSnapshots'>,
    res: TypedResponse<'getDigitalTwinSnapshots'>,
  ): Promise<TypedResponse<'getDigitalTwinSnapshots'>> => {
    try {
      const { userId } = req.params;
      const { page, limit, startDate, endDate, trigger } = req.query;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const pageNum = page ? parseInt(String(page), 10) : 1;
      const limitNum = limit ? parseInt(String(limit), 10) : 10;

      const result = await this.service.getSnapshots(targetUserId, {
        page: pageNum,
        limit: limitNum,
        startDate: startDate ? String(startDate) : undefined,
        endDate: endDate ? String(endDate) : undefined,
        trigger: trigger as unknown as
          import('../../models/digital-twin-snapshot.model').SnapshotTriggerReason | undefined,
      });

      return res.status(200).json({
        success: true,
        message: 'Digital Twin snapshots retrieved successfully',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.getDigitalTwinSnapshots - Error');
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
          message:
            error instanceof Error ? error.message : 'Failed to retrieve digital twin snapshots',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /digital-twin/:userId/trajectory
   * POST /digital-twin/:userId/simulate
   * Simulates 30-day temporal trajectory using the PyTorch GRU-Attention model.
   */
  public simulateTrajectory = async (
    req: Request<
      { userId?: string },
      unknown,
      { forecastDays?: number },
      { forecastDays?: string }
    > & {
      user?: AuthenticatedUser;
    },
    res: Response,
  ): Promise<Response> => {
    try {
      const { userId } = req.params;
      const targetUserId =
        userId && userId !== 'me' ? userId : req.user?.id ? String(req.user.id) : '';

      if (!targetUserId) {
        throw new BadRequestError('User ID is required for trajectory simulation');
      }

      const forecastDays = req.query?.forecastDays
        ? Number(req.query.forecastDays)
        : req.body?.forecastDays
          ? Number(req.body.forecastDays)
          : 30;

      const result = await this.service.simulateDigitalTwinTrajectory(targetUserId, forecastDays);

      return res.status(200).json({
        success: true,
        message: 'Digital Twin 30-day trajectory simulated successfully',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'DigitalTwinController.simulateTrajectory - Error');
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
          message:
            error instanceof Error ? error.message : 'Failed to simulate digital twin trajectory',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const digitalTwinController = new DigitalTwinController();
