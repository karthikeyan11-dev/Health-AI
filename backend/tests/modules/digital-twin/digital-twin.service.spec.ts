import { Types } from 'mongoose';
import { DigitalTwinService } from '../../../src/modules/digital-twin/digital-twin.service';
import type { DigitalTwinRepository } from '../../../src/modules/digital-twin/digital-twin.repository';
import {
  TwinHealthState,
  EmotionType,
  type IDigitalTwinDocument,
} from '../../../src/models/digital-twin.model';
import { NotFoundError, BadRequestError } from '../../../src/shared/errors/httpErrors';
import type { ISensorReadingDocument } from '../../../src/models/sensor-reading.model';
import type { ICardiovascularAssessmentDocument } from '../../../src/models/cardiovascular-assessment.model';
import type { IStressAssessmentDocument } from '../../../src/models/stress-assessment.model';

describe('DigitalTwinService Unit Tests', () => {
  let service: DigitalTwinService;
  let mockRepo: jest.Mocked<DigitalTwinRepository>;

  const userId = '507f1f77bcf86cd799439011';
  const mockUserDoc = {
    _id: new Types.ObjectId(userId),
    email: 'karthi@test.com',
  };

  const mockTwinDoc: IDigitalTwinDocument = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
    id: '507f1f77bcf86cd799439012',
    userId: new Types.ObjectId(userId),
    overallHealthScore: 92,
    healthState: TwinHealthState.OPTIMAL,
    baselineHeartRate: 72.0,
    baselineTemperature: 36.5,
    baselineSpO2: 98.0,
    dominantEmotion: EmotionType.HAPPY,
    currentStressScore: 18.0,
    currentCardioRiskScore: 12.0,
    confidence: 95.0,
    lastSyncTimestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as IDigitalTwinDocument;

  const mockSnapshotDoc = {
    _id: new Types.ObjectId('507f1f77bcf86cd799439019'),
    userId: new Types.ObjectId(userId),
    patientId: new Types.ObjectId('507f1f77bcf86cd799439013'),
    digitalTwinId: new Types.ObjectId('507f1f77bcf86cd799439012'),
    overallHealthScore: 88,
    healthState: TwinHealthState.OPTIMAL,
    heartRate: 72,
    spO2: 98.5,
    temperature: 36.6,
    dominantEmotion: EmotionType.HAPPY,
    stressScore: 20,
    cardioRiskScore: 14,
    confidence: 94,
    triggerReason: 'TELEMETRY_SYNC',
    version: 2,
    timestamp: new Date('2026-08-10T10:00:00.000Z'),
    createdAt: new Date('2026-08-10T10:00:00.000Z'),
    updatedAt: new Date('2026-08-10T10:00:00.000Z'),
  };

  beforeEach(() => {
    mockRepo = {
      findByUserId: jest.fn(),
      create: jest.fn(),
      updateByUserId: jest.fn(),
      createSnapshot: jest.fn(),
      findLatestSnapshot: jest.fn(),
      findSnapshots: jest.fn(),
      findUserById: jest.fn(),
      findPatientByUserId: jest.fn(),
      findLatestReadings: jest.fn(),
      findHistoricalSensorReadings: jest.fn(),
      findLatestCardioAssessment: jest.fn(),
      findHistoricalCardioAssessments: jest.fn(),
      findLatestStressAssessment: jest.fn(),
      findHistoricalStressAssessments: jest.fn(),
    } as unknown as jest.Mocked<DigitalTwinRepository>;

    service = new DigitalTwinService(mockRepo);
    jest.clearAllMocks();
  });

  describe('calculateHealthScoreAndState', () => {
    it('should compute OPTIMAL state when inputs are within healthy ranges', () => {
      const result = service.calculateHealthScoreAndState(10, 15, 72, 72, 98, 98, 36.5, 36.5);
      expect(result.healthScore).toBeGreaterThanOrEqual(85);
      expect(result.healthState).toBe(TwinHealthState.OPTIMAL);
    });

    it('should compute STABLE state for moderate scores', () => {
      const result = service.calculateHealthScoreAndState(30, 40, 72, 72, 98, 98, 36.5, 36.5);
      expect(result.healthScore).toBeLessThan(85);
      expect(result.healthScore).toBeGreaterThanOrEqual(70);
      expect(result.healthState).toBe(TwinHealthState.STABLE);
    });

    it('should compute ELEVATED_STRESS state for elevated risk and stress', () => {
      const result = service.calculateHealthScoreAndState(50, 60, 72, 72, 98, 98, 36.5, 36.5);
      expect(result.healthScore).toBeLessThan(70);
      expect(result.healthScore).toBeGreaterThanOrEqual(55);
      expect(result.healthState).toBe(TwinHealthState.ELEVATED_STRESS);
    });

    it('should compute AT_RISK state when scores and vital deviations are significant', () => {
      const result = service.calculateHealthScoreAndState(75, 80, 72, 72, 98, 98, 36.5, 36.5);
      expect(result.healthScore).toBeLessThan(55);
      expect(result.healthScore).toBeGreaterThanOrEqual(40);
      expect(result.healthState).toBe(TwinHealthState.AT_RISK);
    });

    it('should compute CRITICAL state for extreme risk/stress/vitals', () => {
      const result = service.calculateHealthScoreAndState(95, 95, 130, 72, 85, 98, 40.0, 36.5);
      expect(result.healthScore).toBeLessThan(40);
      expect(result.healthState).toBe(TwinHealthState.CRITICAL);
    });

    it('should handle undefined optional values gracefully', () => {
      const result = service.calculateHealthScoreAndState();
      expect(result.healthScore).toBe(100);
      expect(result.healthState).toBe(TwinHealthState.OPTIMAL);
    });
  });

  describe('createDigitalTwin', () => {
    it('should throw NotFoundError if user does not exist', async () => {
      mockRepo.findUserById.mockResolvedValue(null);

      await expect(service.createDigitalTwin({ userId })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if twin already exists', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);

      await expect(service.createDigitalTwin({ userId })).rejects.toThrow(BadRequestError);
    });

    it('should initialize and create new Digital Twin with latest assessments and vitals', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.findPatientByUserId.mockResolvedValue({
        _id: new Types.ObjectId(),
      } as unknown as Awaited<ReturnType<typeof mockRepo.findPatientByUserId>>);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: { value: 76 } as unknown as ISensorReadingDocument,
        spo2: { value: 98.2 } as unknown as ISensorReadingDocument,
        temperature: { value: 36.6 } as unknown as ISensorReadingDocument,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue({
        riskScore: 10,
      } as unknown as ICardiovascularAssessmentDocument);
      mockRepo.findLatestStressAssessment.mockResolvedValue({
        stressScore: 15,
      } as unknown as IStressAssessmentDocument);
      mockRepo.create.mockResolvedValue(mockTwinDoc);

      const result = await service.createDigitalTwin({
        userId,
        baselineHeartRate: 74,
        baselineTemperature: 36.6,
        baselineSpO2: 98.5,
        dominantEmotion: EmotionType.HAPPY,
      });

      expect(mockRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockTwinDoc);
    });

    it('should initialize default parameters when patient/assessments/readings are null', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(null);
      mockRepo.findPatientByUserId.mockResolvedValue(null);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: null,
        spo2: null,
        temperature: null,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockTwinDoc);

      const result = await service.createDigitalTwin({ userId });
      expect(mockRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockTwinDoc);
    });
  });

  describe('getDigitalTwin', () => {
    it('should throw NotFoundError if user does not exist', async () => {
      mockRepo.findUserById.mockResolvedValue(null);

      await expect(service.getDigitalTwin(userId)).rejects.toThrow(NotFoundError);
    });

    it('should return existing digital twin document', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);

      const result = await service.getDigitalTwin(userId);
      expect(result).toEqual(mockTwinDoc);
    });

    it('should auto-create digital twin if not yet initialized', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      mockRepo.findPatientByUserId.mockResolvedValue(null);
      mockRepo.findLatestReadings.mockResolvedValue({});
      mockRepo.findLatestCardioAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockTwinDoc);

      const result = await service.getDigitalTwin(userId);
      expect(result).toEqual(mockTwinDoc);
    });
  });

  describe('updateDigitalTwin', () => {
    it('should update baseline values and recalculate health score', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: { value: 72 } as unknown as ISensorReadingDocument,
        spo2: { value: 98 } as unknown as ISensorReadingDocument,
        temperature: { value: 36.5 } as unknown as ISensorReadingDocument,
      });

      const updatedDoc = { ...mockTwinDoc, baselineHeartRate: 70 };
      mockRepo.updateByUserId.mockResolvedValue(updatedDoc as unknown as IDigitalTwinDocument);

      const result = await service.updateDigitalTwin(userId, {
        baselineHeartRate: 70,
        baselineTemperature: 36.6,
        baselineSpO2: 99,
        dominantEmotion: EmotionType.HAPPY,
      });

      expect(mockRepo.updateByUserId).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          baselineHeartRate: 70,
          baselineTemperature: 36.6,
          baselineSpO2: 99,
          dominantEmotion: EmotionType.HAPPY,
        }),
        true,
      );
      expect(result.baselineHeartRate).toBe(70);
    });

    it('should throw NotFoundError if update returns null', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({});
      mockRepo.updateByUserId.mockResolvedValue(null);

      await expect(service.updateDigitalTwin(userId, {})).rejects.toThrow(NotFoundError);
    });
  });

  describe('getCurrentTwinState', () => {
    it('should calculate dynamic real-time health score from latest telemetry', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: { value: 78 } as unknown as ISensorReadingDocument,
        spo2: { value: 98.4 } as unknown as ISensorReadingDocument,
        temperature: { value: 36.6 } as unknown as ISensorReadingDocument,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue({
        riskScore: 15,
        confidence: 90,
      } as unknown as ICardiovascularAssessmentDocument);
      mockRepo.findLatestStressAssessment.mockResolvedValue({
        stressScore: 20,
        currentEmotion: EmotionType.SURPRISE,
        confidence: 88,
      } as unknown as IStressAssessmentDocument);

      const updatedTwin = {
        ...mockTwinDoc,
        overallHealthScore: 89,
        dominantEmotion: EmotionType.SURPRISE,
      };
      mockRepo.updateByUserId.mockResolvedValue(updatedTwin as unknown as IDigitalTwinDocument);

      const result = await service.getCurrentTwinState(userId);

      expect(mockRepo.updateByUserId).toHaveBeenCalled();
      expect(result.dominantEmotion).toBe(EmotionType.SURPRISE);
    });

    it('should fallback to twin baselines when latest sensor readings are unavailable', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: null,
        spo2: null,
        temperature: null,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.updateByUserId.mockResolvedValue(mockTwinDoc);

      const result = await service.getCurrentTwinState(userId);
      expect(result).toEqual(mockTwinDoc);
    });

    it('should fallback to existing twin doc if updateByUserId returns null in getCurrentTwinState', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: null,
        spo2: null,
        temperature: null,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.findLatestSnapshot.mockResolvedValue({
        timestamp: new Date(),
      } as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument);
      mockRepo.updateByUserId.mockResolvedValue(null);

      const result = await service.getCurrentTwinState(userId);
      expect(result).toEqual(mockTwinDoc);
    });

    it('should record STATE_TRANSITION snapshot when health state changes', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc); // OPTIMAL
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: null,
        spo2: null,
        temperature: null,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue({
        riskScore: 60,
      } as unknown as ICardiovascularAssessmentDocument);
      mockRepo.findLatestStressAssessment.mockResolvedValue({
        stressScore: 70,
      } as unknown as IStressAssessmentDocument);
      mockRepo.findLatestSnapshot.mockResolvedValue({
        timestamp: new Date(),
      } as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument);
      mockRepo.updateByUserId.mockResolvedValue({
        ...mockTwinDoc,
        healthState: TwinHealthState.ELEVATED_STRESS,
        overallHealthScore: 60,
      } as unknown as IDigitalTwinDocument);

      const result = await service.getCurrentTwinState(userId);
      expect(mockRepo.createSnapshot).toHaveBeenCalled();
      expect(result.healthState).toBe(TwinHealthState.ELEVATED_STRESS);
    });

    it('should not record snapshot if within cooldown and score has not changed', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findLatestReadings.mockResolvedValue({
        heartRate: { value: 72 } as unknown as ISensorReadingDocument,
        spo2: { value: 98 } as unknown as ISensorReadingDocument,
        temperature: { value: 36.5 } as unknown as ISensorReadingDocument,
      });
      mockRepo.findLatestCardioAssessment.mockResolvedValue({
        riskScore: 12,
      } as unknown as ICardiovascularAssessmentDocument);
      mockRepo.findLatestStressAssessment.mockResolvedValue({
        stressScore: 18,
      } as unknown as IStressAssessmentDocument);
      mockRepo.findLatestSnapshot.mockResolvedValue({
        timestamp: new Date(), // recent
      } as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument);
      mockRepo.updateByUserId.mockResolvedValue(mockTwinDoc);

      await service.getCurrentTwinState(userId);
      expect(mockRepo.createSnapshot).not.toHaveBeenCalled();
    });
  });

  describe('getHealthHistory', () => {
    it('should use default 30 days when days parameter is omitted', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const history = await service.getHealthHistory(userId);
      expect(history.length).toBe(7);
    });

    it('should aggregate historical sensor readings and standalone day assessments into daily points', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);

      const date1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const date2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const dateStandaloneCardio = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const dateStandaloneStress = new Date();

      mockRepo.findHistoricalSensorReadings.mockResolvedValue([
        {
          timestamp: date1,
          value: 72,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        { timestamp: date1, value: 98, sensorType: 'SPO2' } as unknown as ISensorReadingDocument,
        {
          timestamp: date1,
          value: 36.5,
          sensorType: 'TEMPERATURE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: date2,
          value: 75,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: date2,
          value: 97.5,
          sensorType: 'SPO2',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: date2,
          value: 36.6,
          sensorType: 'TEMPERATURE',
        } as unknown as ISensorReadingDocument,
      ]);

      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([
        {
          timestamp: dateStandaloneCardio,
          riskScore: 12,
        } as unknown as ICardiovascularAssessmentDocument,
      ]);

      mockRepo.findHistoricalStressAssessments.mockResolvedValue([
        {
          timestamp: dateStandaloneStress,
          stressScore: 18,
        } as unknown as IStressAssessmentDocument,
      ]);

      const history = await service.getHealthHistory(userId, 7);

      expect(history.length).toBeGreaterThanOrEqual(3);
      expect(history[0]).toHaveProperty('healthScore');
      expect(history[0]).toHaveProperty('avgHeartRate');
      expect(history[0]).toHaveProperty('avgSpO2');
    });

    it('should generate baseline trajectory points when historical data is scarce (< 3 records)', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const history = await service.getHealthHistory(userId, 7);

      expect(history.length).toBe(7);
      expect(history[0]!.healthScore).toBe(mockTwinDoc.overallHealthScore);
      expect(history[0]!.healthState).toBe(mockTwinDoc.healthState);
    });
  });

  describe('getHealthTrendAnalysis', () => {
    it('should compute trend trajectories and insights for 7_DAYS period', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue({
        ...mockTwinDoc,
        currentCardioRiskScore: 12,
        currentStressScore: 20,
      } as unknown as IDigitalTwinDocument);

      mockRepo.findHistoricalSensorReadings.mockResolvedValue([]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis = await service.getHealthTrendAnalysis(userId, '7_DAYS');

      expect(analysis.period).toBe('7_DAYS');
      expect(analysis.heartRateTrend).toBe('STABLE');
      expect(analysis.stressTrend).toBe('DECREASING');
      expect(analysis.cardioRiskTrend).toBe('STABLE');
      expect(analysis.insights.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle decreasing HR trend when difference is negative', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);

      const d1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const d2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const d3 = new Date();
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([
        {
          timestamp: d1,
          value: 78,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d2,
          value: 75,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d3,
          value: 70,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
      ]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis = await service.getHealthTrendAnalysis(userId, '7_DAYS');
      expect(analysis.heartRateTrend).toBe('DECREASING');
    });

    it('should handle 30_DAYS and 90_DAYS periods with elevated risk/stress profiles', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue({
        ...mockTwinDoc,
        currentCardioRiskScore: 65,
        currentStressScore: 75,
      } as unknown as IDigitalTwinDocument);

      const d1 = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      const d2 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const d3 = new Date();
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([
        {
          timestamp: d1,
          value: 68,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d2,
          value: 72,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d3,
          value: 76,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
      ]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis90 = await service.getHealthTrendAnalysis(userId, '90_DAYS');
      expect(analysis90.period).toBe('90_DAYS');
      expect(analysis90.heartRateTrend).toBe('INCREASING');
      expect(analysis90.stressTrend).toBe('INCREASING');
      expect(analysis90.cardioRiskTrend).toBe('INCREASING');

      const analysis30 = await service.getHealthTrendAnalysis(userId, '30_DAYS');
      expect(analysis30.period).toBe('30_DAYS');
    });

    it('should handle stable HR trend when readings difference and variance are small', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue({
        ...mockTwinDoc,
        currentCardioRiskScore: 35,
        currentStressScore: 45,
      } as unknown as IDigitalTwinDocument);

      const d1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const d2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const d3 = new Date();
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([
        {
          timestamp: d1,
          value: 72,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d2,
          value: 73,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d3,
          value: 72,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
      ]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis = await service.getHealthTrendAnalysis(userId, '7_DAYS');
      expect(analysis.heartRateTrend).toBe('STABLE');
      expect(analysis.stressTrend).toBe('STABLE');
      expect(analysis.cardioRiskTrend).toBe('STABLE');
    });

    it('should detect volatile heart rate trend when variance is high', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);

      const d1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const d2 = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const d3 = new Date();

      mockRepo.findHistoricalSensorReadings.mockResolvedValue([
        {
          timestamp: d1,
          value: 50,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d2,
          value: 110,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
        {
          timestamp: d3,
          value: 55,
          sensorType: 'HEART_RATE',
        } as unknown as ISensorReadingDocument,
      ]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis = await service.getHealthTrendAnalysis(userId, '7_DAYS');
      expect(analysis.heartRateTrend).toBe('VOLATILE');
    });

    it('should use default 7_DAYS period when period parameter is omitted', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findHistoricalSensorReadings.mockResolvedValue([]);
      mockRepo.findHistoricalCardioAssessments.mockResolvedValue([]);
      mockRepo.findHistoricalStressAssessments.mockResolvedValue([]);

      const analysis = await service.getHealthTrendAnalysis(userId);
      expect(analysis.period).toBe('7_DAYS');
    });
  });

  describe('getSnapshots', () => {
    it('should throw NotFoundError if user not found', async () => {
      mockRepo.findUserById.mockResolvedValue(null);
      await expect(service.getSnapshots(userId)).rejects.toThrow(NotFoundError);
    });

    it('should retrieve paginated snapshots and format them correctly', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findSnapshots.mockResolvedValue({
        items: [
          mockSnapshotDoc as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument,
        ],
        total: 1,
      });

      const result = await service.getSnapshots(userId, {
        page: 1,
        limit: 10,
        startDate: '2026-08-01',
        endDate: '2026-08-15',
        trigger:
          'TELEMETRY_SYNC' as unknown as import('../../../src/models/digital-twin-snapshot.model').SnapshotTriggerReason,
      });

      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0]?.overallHealthScore).toBe(88);
      expect(result.items[0]?.id).toBe('507f1f77bcf86cd799439019');
    });

    it('should handle pagination defaults when query is empty', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findByUserId.mockResolvedValue(mockTwinDoc);
      mockRepo.findSnapshots.mockResolvedValue({
        items: [],
        total: 0,
      });

      const result = await service.getSnapshots(userId);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
      expect(result.items).toEqual([]);
    });
  });

  describe('formatSnapshotDTO', () => {
    it('should format snapshot DTO with patientId when provided', () => {
      const snapWithPatient = {
        ...mockSnapshotDoc,
        patientId: new Types.ObjectId('507f1f77bcf86cd799439099'),
      };
      const formatted = service.formatSnapshotDTO(
        snapWithPatient as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument,
      );
      expect(formatted.patientId).toBe('507f1f77bcf86cd799439099');
      expect(formatted.version).toBe(2);
    });

    it('should format snapshot DTO with undefined patientId when absent', () => {
      const snapWithoutPatient = {
        ...mockSnapshotDoc,
        patientId: undefined,
      };
      const formatted = service.formatSnapshotDTO(
        snapWithoutPatient as unknown as import('../../../src/models/digital-twin-snapshot.model').IDigitalTwinSnapshotDocument,
      );
      expect(formatted.patientId).toBeUndefined();
    });
  });
});
