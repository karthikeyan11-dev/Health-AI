import type { TypedRequest, TypedResponse } from '@shared/types/express/express.types';
import type { components } from '../../shared/types/generated/api-types';
import {
  cardiovascularService,
  CardiovascularService,
  type AssessCardioInput,
} from './cardiovascular.service';
import { BadRequestError, HttpErrors } from '../../shared/errors/httpErrors';
import { logger } from '@config/logger';
import {
  CardiovascularRiskLevel,
  type ICardiovascularAssessmentDocument,
} from '../../models/cardiovascular-assessment.model';

function formatCardiovascularData(
  result: ICardiovascularAssessmentDocument,
): components['schemas']['RiskAssessmentResponse']['data'] {
  return {
    userId: result.userId.toString(),
    riskScore: result.riskScore,
    riskLevel: result.riskLevel as CardiovascularRiskLevel,
    contributingFactors: result.contributingFactors || [],
    topDrivers: result.topDrivers || [],
    probabilities: result.probabilities
      ? (Object.fromEntries(
          result.probabilities instanceof Map
            ? result.probabilities
            : Object.entries(result.probabilities),
        ) as Record<string, number>)
      : undefined,
    confidence: result.confidence,
    explanation: result.explanation,
    recommendations: result.recommendations,
    recommendedIntervention: result.recommendedIntervention,
    guidance: result.guidance
      ? {
          status: result.guidance.status,
          provider: result.guidance.provider,
          message: result.guidance.message,
        }
      : {
          status: 'unavailable',
          provider: 'none',
          message: 'No personalized guidance available.',
        },
    timestamp: result.timestamp.toISOString(),
  };
}

export class CardiovascularController {
  constructor(private readonly service: CardiovascularService = cardiovascularService) {}

  /**
   * POST /cardiovascular/assess
   * Evaluates cardiovascular risk using the 26-feature pipeline.
   */
  public assessRisk = async (
    req: TypedRequest<'assessCardiovascularRisk'>,
    res: TypedResponse<'assessCardiovascularRisk'>,
  ): Promise<TypedResponse<'assessCardiovascularRisk'>> => {
    try {
      const body = req.body;
      const authUser = req.user;

      // Extract userId from authenticated session or explicit body parameter
      const targetUserId = body.userId || (authUser?.id ? String(authUser.id) : '');
      if (!targetUserId) {
        throw new BadRequestError('User ID is required for cardiovascular assessment');
      }

      const input: AssessCardioInput = {
        userId: targetUserId,
        age: body.age,
        sex: body.sex,
        bmi: body.bmi,
        smokingStatus: body.smokingStatus,
        familyHistoryCvd: body.familyHistoryCvd,
        heartRate: body.heartRate,
        restingHr: body.restingHr,
        spo2: body.spo2,
        temperature: body.temperature,
        systolicBp: body.systolicBp,
        diastolicBp: body.diastolicBp,
        hrv: body.hrv,
        steps: body.steps,
        caloriesBurned: body.caloriesBurned,
        distanceKm: body.distanceKm,
        sleepHours: body.sleepHours,
        sleepEfficiency: body.sleepEfficiency,
        caloriesConsumed: body.caloriesConsumed,
        waterIntakeL: body.waterIntakeL,
        activityType: body.activityType,
        stressScore: body.stressScore,
        digitalTwinHealthScore: body.digitalTwinHealthScore,
      };

      const result = await this.service.assessCardiovascularRisk(input);

      return res.status(200).json({
        success: true,
        message: 'Cardiovascular risk assessment completed',
        data: formatCardiovascularData(result),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'CardiovascularController.assessRisk - Error');
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
            error instanceof Error ? error.message : 'Failed to evaluate cardiovascular risk',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /cardiovascular/current
   * Retrieves the current cardiovascular risk state.
   */
  public getCurrentRisk = async (
    req: TypedRequest<'getCurrentCardiovascularRisk'>,
    res: TypedResponse<'getCurrentCardiovascularRisk'>,
  ): Promise<TypedResponse<'getCurrentCardiovascularRisk'>> => {
    try {
      const { userId } = req.query;
      const targetUserId = userId || (req.user?.id ? String(req.user.id) : '');

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const result = await this.service.getCurrentRisk(targetUserId);

      return res.status(200).json({
        success: true,
        message: 'Current cardiovascular risk retrieved',
        data: formatCardiovascularData(result),
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'CardiovascularController.getCurrentRisk - Error');
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
          message: 'Failed to retrieve cardiovascular risk',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /cardiovascular/history
   * Retrieves paginated risk history.
   */
  public getRiskHistory = async (
    req: TypedRequest<'getCardiovascularRiskHistory'>,
    res: TypedResponse<'getCardiovascularRiskHistory'>,
  ): Promise<TypedResponse<'getCardiovascularRiskHistory'>> => {
    try {
      const { userId, limit } = req.query;
      const targetUserId = userId || (req.user?.id ? String(req.user.id) : '');

      if (!targetUserId) {
        throw new BadRequestError('User ID is required');
      }

      const limitNum = limit ? parseInt(String(limit), 10) : 20;

      const { records } = await this.service.getRiskHistory(targetUserId, 1, limitNum);

      const formattedRecords = records.map((r) => ({
        id: r._id.toString(),
        userId: r.userId.toString(),
        riskScore: r.riskScore,
        riskLevel: r.riskLevel as CardiovascularRiskLevel,
        confidence: r.confidence,
        timestamp: r.timestamp.toISOString(),
      }));

      return res.status(200).json({
        success: true,
        message: 'Risk history retrieved successfully',
        data: formattedRecords,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'CardiovascularController.getRiskHistory - Error');
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
          message: 'Failed to retrieve cardiovascular risk history',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const cardiovascularController = new CardiovascularController();
