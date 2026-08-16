import { patientsService, PatientsService } from './patients.service';
import type { TypedRequest, TypedResponse } from '@shared/types/express/express.types';
import { HttpErrors, UnauthorizedError } from '@shared/errors/httpErrors';
import { logger } from '@config/logger';

export class PatientsController {
  constructor(private readonly service: PatientsService = patientsService) {}

  /**
   * GET /patients/overview
   * Returns patient dashboard overview analytics for authenticated user.
   */
  public getPatientOverview = async (
    req: TypedRequest<'getPatientOverview'>,
    res: TypedResponse<'getPatientOverview'>,
  ): Promise<TypedResponse<'getPatientOverview'>> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required to access patient overview');
      }

      const overviewData = await this.service.getPatientOverview(userId);

      return res.status(200).json({
        success: true,
        message: 'Patient health overview retrieved successfully',
        data: overviewData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'PatientsController.getPatientOverview - Error');
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
          message: 'Failed to retrieve patient overview',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /patients/health-monitoring
   * Returns patient physiological sensor telemetry, current readings, time-series chart history, and devices.
   */
  public getHealthMonitoring = async (
    req: TypedRequest<'getHealthMonitoring'>,
    res: TypedResponse<'getHealthMonitoring'>,
  ): Promise<TypedResponse<'getHealthMonitoring'>> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Authentication required to access health monitoring');
      }

      const query = {
        timeRange: req.query.timeRange as string | undefined,
        deviceId: req.query.deviceId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
      };

      const healthData = await this.service.getHealthMonitoring(userId, query);

      return res.status(200).json({
        success: true,
        message: 'Health monitoring data retrieved successfully',
        data: healthData,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'PatientsController.getHealthMonitoring - Error');
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
          message: 'Failed to retrieve health monitoring data',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const patientsController = new PatientsController();
