import { PatientsService } from '../../../src/modules/patients/patients.service';
import type { PatientsRepository } from '../../../src/modules/patients/patients.repository';
import { NotFoundError } from '../../../src/shared/errors/httpErrors';
import { SensorType } from '../../../src/models/sensor-reading.model';
import { CardiovascularRiskLevel } from '../../../src/models/cardiovascular-assessment.model';
import { StressLevel } from '../../../src/models/stress-assessment.model';
import { TwinHealthState } from '../../../src/models/digital-twin.model';
import {
  RecommendationCategory,
  RecommendationPriority,
} from '../../../src/models/recommendation.model';
import { DeviceStatus } from '../../../src/models/device.model';

describe('PatientsService Unit Tests', () => {
  let service: PatientsService;
  let mockRepo: jest.Mocked<PatientsRepository>;

  const mockUser = {
    _id: { toString: (): string => '507f1f77bcf86cd799439011' },
    id: '507f1f77bcf86cd799439011',
    firstName: 'Karthikeyan',
    lastName: 'M',
    email: 'karthikeyanm2209@gmail.com',
    age: 24,
    gender: 'MALE',
  };

  const mockDevice = {
    id: 'dev_123',
    deviceId: 'ESP32_TELEMETRY_01',
    name: 'Smart Health Band',
    deviceType: 'ESP32-WROOM-32',
    status: DeviceStatus.ONLINE,
    lastSeenAt: new Date(),
  };

  const mockHrReading = {
    sensorType: SensorType.HEART_RATE,
    value: 72,
    timestamp: new Date(),
  };

  const mockSpo2Reading = {
    sensorType: SensorType.SPO2,
    value: 98.5,
    timestamp: new Date(),
  };

  const mockTempReading = {
    sensorType: SensorType.TEMPERATURE,
    value: 36.6,
    timestamp: new Date(),
  };

  const mockCardioAssessment = {
    id: 'cardio_123',
    riskScore: 18.5,
    riskLevel: CardiovascularRiskLevel.LOW,
    timestamp: new Date(),
  };

  const mockStressAssessment = {
    id: 'stress_123',
    stressScore: 22.0,
    stressLevel: StressLevel.LOW,
    timestamp: new Date(),
  };

  const mockDigitalTwin = {
    overallHealthScore: 92.5,
    healthState: TwinHealthState.OPTIMAL,
    updatedAt: new Date(),
  };

  const mockRecommendation = {
    id: 'rec_123',
    userId: { toString: (): string => '507f1f77bcf86cd799439011' },
    category: RecommendationCategory.LIFESTYLE,
    title: 'Hydration Target Achieved',
    description: 'Drink 2.5 liters of water daily.',
    priority: RecommendationPriority.MEDIUM,
    isAcknowledged: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findUserById: jest.fn(),
      findPatientByUserId: jest.fn(),
      findDeviceByUserId: jest.fn(),
      findLatestReading: jest.fn(),
      findRecentReadings: jest.fn(),
      findLatestCardiovascularAssessment: jest.fn(),
      findLatestStressAssessment: jest.fn(),
      findDigitalTwin: jest.fn(),
      findActiveRecommendations: jest.fn(),
    } as unknown as jest.Mocked<PatientsRepository>;

    service = new PatientsService(mockRepo);
    jest.clearAllMocks();
  });

  describe('getPatientOverview', () => {
    it('should compile complete patient overview data when valid user ID and all DB records exist', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUser as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findDeviceByUserId.mockResolvedValue(
        mockDevice as unknown as Awaited<ReturnType<typeof mockRepo.findDeviceByUserId>>,
      );
      mockRepo.findLatestReading.mockImplementation(
        (
          _userId: string,
          type: SensorType,
        ): Promise<Awaited<ReturnType<typeof mockRepo.findLatestReading>>> => {
          if (type === SensorType.HEART_RATE)
            return Promise.resolve(
              mockHrReading as unknown as Awaited<ReturnType<typeof mockRepo.findLatestReading>>,
            );
          if (type === SensorType.SPO2)
            return Promise.resolve(
              mockSpo2Reading as unknown as Awaited<ReturnType<typeof mockRepo.findLatestReading>>,
            );
          if (type === SensorType.TEMPERATURE)
            return Promise.resolve(
              mockTempReading as unknown as Awaited<ReturnType<typeof mockRepo.findLatestReading>>,
            );
          return Promise.resolve(null);
        },
      );
      mockRepo.findRecentReadings.mockResolvedValue([
        mockHrReading,
        mockSpo2Reading,
        mockTempReading,
      ] as unknown as Awaited<ReturnType<typeof mockRepo.findRecentReadings>>);
      mockRepo.findLatestCardiovascularAssessment.mockResolvedValue(
        mockCardioAssessment as unknown as Awaited<
          ReturnType<typeof mockRepo.findLatestCardiovascularAssessment>
        >,
      );
      mockRepo.findLatestStressAssessment.mockResolvedValue(
        mockStressAssessment as unknown as Awaited<
          ReturnType<typeof mockRepo.findLatestStressAssessment>
        >,
      );
      mockRepo.findDigitalTwin.mockResolvedValue(
        mockDigitalTwin as unknown as Awaited<ReturnType<typeof mockRepo.findDigitalTwin>>,
      );
      mockRepo.findActiveRecommendations.mockResolvedValue([
        mockRecommendation,
      ] as unknown as Awaited<ReturnType<typeof mockRepo.findActiveRecommendations>>);

      const result = await service.getPatientOverview('507f1f77bcf86cd799439011');

      expect(result.patientInfo.email).toBe('karthikeyanm2209@gmail.com');
      expect(result.deviceInfo.deviceId).toBe('ESP32_TELEMETRY_01');
      expect(result.latestVitals.heartRateBpm).toBe(72);
      expect(result.latestCardiovascularRisk.riskLevel).toBe('LOW');
      expect(result.latestStressAssessment.stressScore).toBe(22.0);
      expect(result.digitalTwinState.overallHealthScore).toBe(92.5);
      expect(result.recentRecommendations.length).toBe(1);
      expect(result.recentActivity.length).toBe(3);
    });

    it('should fall back to defaults when optional DB records are null or undefined', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUser as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findDeviceByUserId.mockResolvedValue(null);
      mockRepo.findLatestReading.mockResolvedValue(null);
      mockRepo.findRecentReadings.mockResolvedValue([
        { sensorType: 'OTHER' as SensorType, value: 50, timestamp: new Date() },
      ] as unknown as Awaited<ReturnType<typeof mockRepo.findRecentReadings>>);
      mockRepo.findLatestCardiovascularAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.findDigitalTwin.mockResolvedValue(null);
      mockRepo.findActiveRecommendations.mockResolvedValue([
        {
          id: 'rec_no_dates',
          userId: { toString: (): string => '507f1f77bcf86cd799439011' },
          category: RecommendationCategory.LIFESTYLE,
          title: 'Hydration Target Achieved',
          description: 'Drink 2.5 liters of water daily.',
          priority: RecommendationPriority.MEDIUM,
          isAcknowledged: false,
          createdAt: undefined,
          updatedAt: undefined,
        },
      ] as unknown as Awaited<ReturnType<typeof mockRepo.findActiveRecommendations>>);

      const result = await service.getPatientOverview('507f1f77bcf86cd799439011');

      expect(result.patientInfo.healthStatus).toBe('STABLE');
      expect(result.deviceInfo.deviceId).toBe('UNREGISTERED');
      expect(result.deviceInfo.status).toBe('OFFLINE');
      expect(result.latestVitals.heartRateBpm).toBe(0);
      expect(result.latestCardiovascularRisk.riskScore).toBe(0);
      expect(result.latestStressAssessment.stressScore).toBe(0);
      expect(result.digitalTwinState.overallHealthScore).toBe(100);
      expect(result.recentRecommendations[0]!.createdAt).toBeDefined();
      expect(result.recentRecommendations[0]!.updatedAt).toBeDefined();
      expect(result.recentActivity.length).toBe(0);
    });

    it('should handle device record without name and without lastSeenAt timestamp', async () => {
      mockRepo.findUserById.mockResolvedValue(
        mockUser as unknown as Awaited<ReturnType<typeof mockRepo.findUserById>>,
      );
      mockRepo.findDeviceByUserId.mockResolvedValue({
        id: 'dev_no_name',
        deviceId: 'ESP32_UNNAMED',
        deviceType: 'ESP32-TELEMETRY',
        status: DeviceStatus.ONLINE,
        lastSeenAt: undefined,
      } as unknown as Awaited<ReturnType<typeof mockRepo.findDeviceByUserId>>);
      mockRepo.findLatestReading.mockResolvedValue(null);
      mockRepo.findRecentReadings.mockResolvedValue([]);
      mockRepo.findLatestCardiovascularAssessment.mockResolvedValue(null);
      mockRepo.findLatestStressAssessment.mockResolvedValue(null);
      mockRepo.findDigitalTwin.mockResolvedValue(null);
      mockRepo.findActiveRecommendations.mockResolvedValue([]);

      const result = await service.getPatientOverview('507f1f77bcf86cd799439011');

      expect(result.deviceInfo.deviceId).toBe('ESP32_UNNAMED');
      expect(result.recentActivity.length).toBe(1);
      expect(result.recentActivity[0]!.title).toBe('ESP32_UNNAMED Synchronized');
    });

    it('should throw NotFoundError if user record is missing in database', async () => {
      mockRepo.findUserById.mockResolvedValue(null);

      await expect(service.getPatientOverview('507f1f77bcf86cd799439099')).rejects.toThrow(
        NotFoundError,
      );
    });

    it('should rethrow errors when repository throws database exception', async () => {
      mockRepo.findUserById.mockRejectedValue(new Error('Mongo connection failure'));

      await expect(service.getPatientOverview('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Mongo connection failure',
      );
    });
  });
});
