import { PatientsController } from '../../../src/modules/patients/patients.controller';
import type { PatientsService } from '../../../src/modules/patients/patients.service';
import { NotFoundError } from '../../../src/shared/errors/httpErrors';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import type { PatientOverviewData } from '../../../src/modules/patients/patients.dto';

describe('PatientsController Unit Tests', () => {
  let controller: PatientsController;
  let mockService: jest.Mocked<PatientsService>;
  let mockRequest: Partial<TypedRequest<'getPatientOverview'>>;
  let mockResponse: Partial<TypedResponse<'getPatientOverview'>>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockOverviewData: PatientOverviewData = {
    patientInfo: {
      id: '507f1f77bcf86cd799439011',
      firstName: 'Karthikeyan',
      lastName: 'M',
      email: 'karthikeyanm2209@gmail.com',
      age: 24,
      gender: 'MALE',
      healthStatus: 'OPTIMAL',
    },
    deviceInfo: {
      deviceId: 'ESP32_TELEMETRY_01',
      deviceType: 'ESP32-WROOM-32',
      status: 'ONLINE',
      lastSeen: new Date().toISOString(),
    },
    latestVitals: {
      heartRateBpm: 72,
      spo2Percent: 98.5,
      temperatureCelsius: 36.6,
      timestamp: new Date().toISOString(),
    },
    latestCardiovascularRisk: {
      riskScore: 18.5,
      riskLevel: 'LOW',
      timestamp: new Date().toISOString(),
    },
    latestStressAssessment: {
      stressScore: 22.0,
      stressLevel: 'LOW',
      timestamp: new Date().toISOString(),
    },
    digitalTwinState: {
      overallHealthScore: 92.5,
      healthState: 'OPTIMAL',
      lastUpdated: new Date().toISOString(),
    },
    recentRecommendations: [],
    vitalSignTrend: [],
    healthRiskSummary: {
      optimalPercent: 70,
      stablePercent: 20,
      elevatedPercent: 8,
      atRiskPercent: 2,
    },
    recentActivity: [],
  };

  beforeEach(() => {
    mockService = {
      getPatientOverview: jest.fn(),
    } as unknown as jest.Mocked<PatientsService>;

    controller = new PatientsController(mockService);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('getPatientOverview', () => {
    it('should return 200 with patient overview data when authenticated', async () => {
      mockRequest = {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'karthikeyanm2209@gmail.com',
          role: 'PATIENT',
        },
      };

      mockService.getPatientOverview.mockResolvedValue(mockOverviewData);

      await controller.getPatientOverview(
        mockRequest as TypedRequest<'getPatientOverview'>,
        mockResponse as TypedResponse<'getPatientOverview'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Patient health overview retrieved successfully',
          data: mockOverviewData,
        }),
      );
      expect(mockService.getPatientOverview).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 401 when req.user is undefined', async () => {
      mockRequest = {
        user: undefined,
      };

      await controller.getPatientOverview(
        mockRequest as TypedRequest<'getPatientOverview'>,
        mockResponse as TypedResponse<'getPatientOverview'>,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZEDERROR',
            message: 'Authentication required to access patient overview',
          }),
        }),
      );
    });

    it('should handle NotFoundError when patient record is missing', async () => {
      mockRequest = {
        user: {
          id: '507f1f77bcf86cd799439099',
          email: 'missing@example.com',
          role: 'PATIENT',
        },
      };

      mockService.getPatientOverview.mockRejectedValue(new NotFoundError('User record not found'));

      await controller.getPatientOverview(
        mockRequest as TypedRequest<'getPatientOverview'>,
        mockResponse as TypedResponse<'getPatientOverview'>,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOTFOUNDERROR',
            message: 'User record not found',
          }),
        }),
      );
    });

    it('should return 500 when an unexpected internal error occurs', async () => {
      mockRequest = {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'karthikeyanm2209@gmail.com',
          role: 'PATIENT',
        },
      };

      mockService.getPatientOverview.mockRejectedValue(new Error('Database connection lost'));

      await controller.getPatientOverview(
        mockRequest as TypedRequest<'getPatientOverview'>,
        mockResponse as TypedResponse<'getPatientOverview'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve patient overview',
          }),
        }),
      );
    });
  });
});
