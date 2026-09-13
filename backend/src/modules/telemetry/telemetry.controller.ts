import type { Request, Response } from 'express';
import { TelemetryService, telemetryService as defaultService } from './telemetry.service';
import { type IngestTelemetryInput } from './telemetry.dto';
import { SensorType } from '../../models/sensor-reading.model';
import { HttpErrors, UnauthorizedError, BadRequestError } from '../../shared/errors/httpErrors';
import { logger } from '../../config/logger';

export class TelemetryController {
  constructor(private readonly service: TelemetryService = defaultService) {}

  /**
   * POST /telemetry/ingest or POST /sensors/readings
   * Ingests a batch of telemetry sensor readings from smartwatch or companion app.
   */
  public ingestTelemetry = async (req: Request, res: Response): Promise<Response> => {
    try {
      const authUser = (req as Request & { user?: { id: string } }).user;
      const targetUserId = authUser?.id || (req.body as IngestTelemetryInput)?.userId;

      if (!targetUserId) {
        throw new UnauthorizedError(
          'Authentication or valid userId required for telemetry ingestion',
        );
      }

      const input = req.body as IngestTelemetryInput;
      if (!input || typeof input !== 'object') {
        throw new BadRequestError('Invalid JSON request body');
      }

      const result = await this.service.ingestTelemetry(targetUserId, input);

      return res.status(202).json({
        success: true,
        message: 'Telemetry readings successfully ingested and broadcasted',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'TelemetryController.ingestTelemetry - Error');
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
          message: 'Failed to ingest telemetry readings',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /telemetry/latest or GET /sensors/readings/latest
   * Retrieves the latest snapshot of all sensor readings and connected device.
   */
  public getLatestTelemetry = async (req: Request, res: Response): Promise<Response> => {
    try {
      const authUser = (req as Request & { user?: { id: string } }).user;
      const userId = (req.query?.userId as string) || authUser?.id;

      if (!userId) {
        throw new UnauthorizedError('Authentication required to access latest telemetry');
      }

      const data = await this.service.getLatestTelemetry(userId);

      return res.status(200).json({
        success: true,
        message: 'Latest telemetry summary retrieved successfully',
        data,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'TelemetryController.getLatestTelemetry - Error');
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
          message: 'Failed to retrieve latest telemetry',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /telemetry/history or GET /sensors/readings/history
   * Retrieves historical time-series sensor readings.
   */
  public getHistoricalReadings = async (req: Request, res: Response): Promise<Response> => {
    try {
      const authUser = (req as Request & { user?: { id: string } }).user;
      const userId = (req.query?.userId as string) || authUser?.id;

      if (!userId) {
        throw new UnauthorizedError('Authentication required to access telemetry history');
      }

      const sensorTypeQuery = req.query?.sensorType as string | undefined;
      let sensorType: SensorType | undefined;
      if (sensorTypeQuery) {
        if (!Object.values(SensorType).includes(sensorTypeQuery as SensorType)) {
          throw new BadRequestError(`Invalid sensorType filter: ${sensorTypeQuery}`);
        }
        sensorType = sensorTypeQuery as SensorType;
      }

      const limitQuery = req.query?.limit as string | undefined;
      const limit = limitQuery ? parseInt(limitQuery, 10) : 50;
      if (isNaN(limit) || limit < 1 || limit > 500) {
        throw new BadRequestError('Limit must be an integer between 1 and 500');
      }

      const records = await this.service.getHistoricalReadings(userId, sensorType, limit);

      return res.status(200).json({
        success: true,
        message: 'Historical sensor telemetry retrieved successfully',
        data: {
          total: records.length,
          sensorType: sensorType || 'ALL',
          readings: records.map((r) => ({
            id: r._id.toString(),
            sensorType: r.sensorType,
            value: r.value,
            unit: r.unit,
            confidence: r.confidence,
            timestamp: r.timestamp.toISOString(),
          })),
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'TelemetryController.getHistoricalReadings - Error');
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
          message: 'Failed to retrieve historical telemetry',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const telemetryController = new TelemetryController();
