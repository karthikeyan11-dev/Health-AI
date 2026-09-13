import type { Request, Response } from 'express';
import { TelemetryController } from '../../../src/modules/telemetry/telemetry.controller';
import type { TelemetryService } from '../../../src/modules/telemetry/telemetry.service';
import { SensorType } from '../../../src/models/sensor-reading.model';

describe('TelemetryController Unit Tests', () => {
  let controller: TelemetryController;
  let mockService: jest.Mocked<TelemetryService>;
  let mockRes: Response;
  const userId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockService = {
      ingestTelemetry: jest.fn().mockResolvedValue({
        ingestedCount: 2,
        deviceId: 'WATCH_01',
        timestamp: new Date().toISOString(),
        alertsTriggered: 0,
      }),
      getLatestTelemetry: jest.fn().mockResolvedValue({
        userId,
        device: null,
        readings: {},
        lastUpdated: new Date().toISOString(),
      }),
      getHistoricalReadings: jest.fn().mockResolvedValue([
        {
          _id: 'reading1',
          sensorType: SensorType.HEART_RATE,
          value: 75,
          unit: 'bpm',
          timestamp: new Date(),
        },
      ]),
    } as unknown as jest.Mocked<TelemetryService>;

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as Response;

    controller = new TelemetryController(mockService);
    jest.clearAllMocks();
  });

  describe('ingestTelemetry', () => {
    it('should successfully ingest telemetry with authenticated user', async () => {
      const req = {
        user: { id: userId },
        body: { readings: [{ sensorType: SensorType.HEART_RATE, value: 72 }] },
      } as unknown as Request;

      await controller.ingestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockService.ingestTelemetry).toHaveBeenCalledWith(userId, req.body);
    });

    it('should successfully ingest telemetry with explicit userId in body', async () => {
      const req = {
        body: { userId, readings: [{ sensorType: SensorType.HEART_RATE, value: 72 }] },
      } as unknown as Request;

      await controller.ingestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(202);
      expect(mockService.ingestTelemetry).toHaveBeenCalledWith(userId, req.body);
    });

    it('should return 401 when no userId can be resolved', async () => {
      const req = { body: { readings: [] } } as unknown as Request;

      await controller.ingestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 when body is invalid or not an object', async () => {
      const req = { user: { id: userId }, body: null } as unknown as Request;

      await controller.ingestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on unexpected service errors', async () => {
      mockService.ingestTelemetry.mockRejectedValue(new Error('Internal breakdown'));
      const req = { user: { id: userId }, body: { readings: [] } } as unknown as Request;

      await controller.ingestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getLatestTelemetry', () => {
    it('should return latest telemetry for query userId or auth user', async () => {
      const req = { query: { userId } } as unknown as Request;

      await controller.getLatestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockService.getLatestTelemetry).toHaveBeenCalledWith(userId);
    });

    it('should return latest telemetry from auth user when query is empty', async () => {
      const req = { user: { id: userId }, query: {} } as unknown as Request;

      await controller.getLatestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockService.getLatestTelemetry).toHaveBeenCalledWith(userId);
    });

    it('should return 401 when neither query nor auth userId is provided', async () => {
      const req = { query: {} } as unknown as Request;

      await controller.getLatestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 500 on unexpected errors', async () => {
      mockService.getLatestTelemetry.mockRejectedValue(new Error('Latest failed'));
      const req = { user: { id: userId }, query: {} } as unknown as Request;

      await controller.getLatestTelemetry(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('getHistoricalReadings', () => {
    it('should return historical readings with valid sensorType and custom limit', async () => {
      const req = {
        user: { id: userId },
        query: { sensorType: SensorType.HEART_RATE, limit: '25' },
      } as unknown as Request;

      await controller.getHistoricalReadings(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockService.getHistoricalReadings).toHaveBeenCalledWith(
        userId,
        SensorType.HEART_RATE,
        25,
      );
    });

    it('should return historical readings with default limit when no query provided', async () => {
      const req = {
        user: { id: userId },
        query: {},
      } as unknown as Request;

      await controller.getHistoricalReadings(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockService.getHistoricalReadings).toHaveBeenCalledWith(userId, undefined, 50);
    });

    it('should return 401 when userId is missing', async () => {
      const req = { query: {} } as unknown as Request;

      await controller.getHistoricalReadings(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should return 400 when invalid sensorType filter is provided', async () => {
      const req = {
        user: { id: userId },
        query: { sensorType: 'INVALID_SENSOR' },
      } as unknown as Request;

      await controller.getHistoricalReadings(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 when limit is invalid or out of bounds', async () => {
      const reqInvalidNumber = {
        user: { id: userId },
        query: { limit: 'abc' },
      } as unknown as Request;
      await controller.getHistoricalReadings(reqInvalidNumber, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);

      const reqOutOfBounds = {
        user: { id: userId },
        query: { limit: '999' },
      } as unknown as Request;
      await controller.getHistoricalReadings(reqOutOfBounds, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should return 500 on unexpected errors', async () => {
      mockService.getHistoricalReadings.mockRejectedValue(new Error('History failed'));
      const req = { user: { id: userId }, query: {} } as unknown as Request;

      await controller.getHistoricalReadings(req, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });
});
