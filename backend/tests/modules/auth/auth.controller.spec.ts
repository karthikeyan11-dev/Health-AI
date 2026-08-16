import { AuthController } from '../../../src/modules/auth/auth.controller';
import type { AuthService } from '../../../src/modules/auth/auth.service';
import {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from '../../../src/shared/errors/httpErrors';
import { UserRole } from '../../../src/models/user.model';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import type {
  AuthTokensResponse,
  RegisterResponse,
  UserProfileData,
} from '../../../src/modules/auth/auth.dto';

describe('AuthController Unit Tests', () => {
  let controller: AuthController;
  let mockService: jest.Mocked<AuthService>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockResponse: Partial<TypedResponse<'registerUser'>>;

  const mockUserProfile: UserProfileData = {
    id: '507f1f77bcf86cd799439011',
    email: 'karthikeyanm2209@gmail.com',
    firstName: 'Karthikeyan',
    lastName: 'M',
    phoneNumber: '+917339321071',
    age: 24,
    gender: 'MALE',
    role: UserRole.PATIENT,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    healthStatus: 'STABLE',
    primaryPhysician: 'Dr. Sarah Jenkins',
    connectedDevicesCount: 2,
    activeMonitoringStreams: 1,
    recentHeartRateBpm: 72,
    recentSpo2Percent: 98.5,
    recentTemperatureCelsius: 36.6,
    riskAssessmentScore: 'LOW_RISK',
    medicalNotes: 'Patient telemetry within normal baseline parameters.',
  };

  beforeEach(() => {
    mockService = {
      register: jest.fn(),
      verifyOtp: jest.fn(),
      login: jest.fn(),
      getUserProfile: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;

    controller = new AuthController(mockService);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should return 201 when registration succeeds', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
          firstName: 'Karthikeyan',
          lastName: 'M',
          age: 24,
          gender: 'MALE',
          role: 'PATIENT',
        },
      };

      const mockData: NonNullable<RegisterResponse['data']> = {
        email: 'karthikeyanm2209@gmail.com',
        expiresInSeconds: 300,
      };

      mockService.register.mockResolvedValue(mockData);

      await controller.register(
        mockReq as unknown as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'OTP verification code sent to your email',
          data: mockData,
        }),
      );
    });

    it('should handle validation failure when body is invalid', async () => {
      const mockReq = {
        body: {
          email: 'invalid-email',
        },
      };

      await controller.register(
        mockReq as unknown as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
          }),
        }),
      );
    });

    it('should handle ConflictError when user already exists', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
          firstName: 'Karthikeyan',
          lastName: 'M',
          age: 24,
          gender: 'MALE',
          role: 'PATIENT',
        },
      };

      mockService.register.mockRejectedValue(new ConflictError('User already exists'));

      await controller.register(
        mockReq as unknown as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CONFLICTERROR',
            message: 'User already exists',
          }),
        }),
      );
    });

    it('should return 500 when an unexpected exception occurs', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
          firstName: 'Karthikeyan',
          lastName: 'M',
          age: 24,
          gender: 'MALE',
          role: 'PATIENT',
        },
      };

      mockService.register.mockRejectedValue(new Error('Internal database fault'));

      await controller.register(
        mockReq as unknown as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Internal server error',
          }),
        }),
      );
    });
  });

  describe('verifyOtp', () => {
    it('should return 200 when OTP verification succeeds', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        },
      };

      mockService.verifyOtp.mockResolvedValue();

      await controller.verifyOtp(
        mockReq as unknown as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User created successfully',
        }),
      );
    });

    it('should handle validation failure when OTP is missing or short', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          otp: '12',
        },
      };

      await controller.verifyOtp(
        mockReq as unknown as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
          }),
        }),
      );
    });

    it('should handle BadRequestError when OTP is expired or invalid', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        },
      };

      mockService.verifyOtp.mockRejectedValue(new BadRequestError('Verification code expired'));

      await controller.verifyOtp(
        mockReq as unknown as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'Verification code expired',
          }),
        }),
      );
    });

    it('should return 500 when an unexpected error occurs during verifyOtp', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          otp: '123456',
        },
      };

      mockService.verifyOtp.mockRejectedValue(new Error('System error'));

      await controller.verifyOtp(
        mockReq as unknown as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('login', () => {
    it('should return 200 with tokens when credentials are valid', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
        },
      };

      const mockTokens: AuthTokensResponse = {
        accessToken: 'access_token_xyz',
        refreshToken: 'refresh_token_xyz',
        tokenType: 'Bearer',
        expiresIn: 3600,
      };

      mockService.login.mockResolvedValue(mockTokens);

      await controller.login(
        mockReq as unknown as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(mockTokens);
    });

    it('should handle validation failure when login body is missing fields', async () => {
      const mockReq = {
        body: {
          email: 'invalid',
        },
      };

      await controller.login(
        mockReq as unknown as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should handle UnauthorizedError when credentials are invalid', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'WrongPassword',
        },
      };

      mockService.login.mockRejectedValue(new UnauthorizedError('Invalid credentials'));

      await controller.login(
        mockReq as unknown as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'UNAUTHORIZEDERROR',
            message: 'Invalid credentials',
          }),
        }),
      );
    });

    it('should return 500 when login throws unexpected internal error', async () => {
      const mockReq = {
        body: {
          email: 'karthikeyanm2209@gmail.com',
          password: 'Karthi@1111',
        },
      };

      mockService.login.mockRejectedValue(new Error('Internal auth error'));

      await controller.login(
        mockReq as unknown as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getProfile', () => {
    it('should return 200 with user profile details when authenticated', async () => {
      const mockReq = {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'karthikeyanm2209@gmail.com',
          role: 'PATIENT',
        },
      };

      mockService.getUserProfile.mockResolvedValue(mockUserProfile);

      await controller.getProfile(
        mockReq as unknown as TypedRequest<'getProfile'>,
        mockResponse as unknown as TypedResponse<'getProfile'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Profile details retrieved successfully',
          data: mockUserProfile,
        }),
      );
      expect(mockService.getUserProfile).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should handle NotFoundError when profile is missing in DB', async () => {
      const mockReq = {
        user: {
          id: '507f1f77bcf86cd799439099',
          email: 'missing@example.com',
          role: 'PATIENT',
        },
      };

      mockService.getUserProfile.mockRejectedValue(
        new NotFoundError('User profile not found in database'),
      );

      await controller.getProfile(
        mockReq as unknown as TypedRequest<'getProfile'>,
        mockResponse as unknown as TypedResponse<'getProfile'>,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOTFOUNDERROR',
            message: 'User profile not found in database',
          }),
        }),
      );
    });

    it('should return 500 when unexpected error occurs during profile fetch', async () => {
      const mockReq = {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'karthikeyanm2209@gmail.com',
          role: 'PATIENT',
        },
      };

      mockService.getUserProfile.mockRejectedValue(new Error('Profile fetch failure'));

      await controller.getProfile(
        mockReq as unknown as TypedRequest<'getProfile'>,
        mockResponse as unknown as TypedResponse<'getProfile'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });
});
