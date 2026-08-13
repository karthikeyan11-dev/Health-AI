import { AuthController } from '../../src/modules/auth/auth.controller';
import type { AuthService } from '../../src/modules/auth/auth.service';
import {
  ConflictError,
  BadRequestError,
  UnauthorizedError,
} from '../../src/shared/errors/httpErrors';
import { UserRole } from '../../src/models/user.model';
import type { TypedRequest, TypedResponse } from '../../src/shared/types';

describe('AuthController Unit Tests', () => {
  let controller: AuthController;
  let mockService: jest.Mocked<AuthService>;
  let mockRequest: Partial<TypedRequest<'registerUser'>>;
  let mockResponse: Partial<TypedResponse<'registerUser'>>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    mockService = {
      register: jest.fn(),
      verifyOtp: jest.fn(),
      login: jest.fn(),
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
    it('should return 201 with success envelope when registration succeeds', async () => {
      mockRequest = {
        body: {
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
          role: UserRole.PATIENT,
        },
      };

      mockService.register.mockResolvedValue({
        email: 'user@example.com',
        expiresInSeconds: 300,
      });

      await controller.register(
        mockRequest as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'OTP verification code sent to your email',
          data: {
            email: 'user@example.com',
            expiresInSeconds: 300,
          },
        }),
      );
    });

    it('should return 400 when validation fails due to invalid email', async () => {
      mockRequest = {
        body: {
          email: 'invalid-email',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
        },
      };

      await controller.register(
        mockRequest as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'Invalid email address format',
          }),
        }),
      );
    });

    it('should handle ConflictError thrown by service', async () => {
      mockRequest = {
        body: {
          email: 'existing@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
        },
      };

      mockService.register.mockRejectedValue(new ConflictError('User with email already exists'));

      await controller.register(
        mockRequest as TypedRequest<'registerUser'>,
        mockResponse as TypedResponse<'registerUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'CONFLICTERROR',
            message: 'User with email already exists',
          }),
        }),
      );
    });

    it('should handle unhandled error thrown by service with 500', async () => {
      mockRequest = {
        body: {
          email: 'user@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          age: 34,
          gender: 'MALE',
        },
      };

      mockService.register.mockRejectedValue(new Error('Unexpected DB error'));

      await controller.register(
        mockRequest as TypedRequest<'registerUser'>,
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
    it('should return 200 with user data when OTP verification succeeds', async () => {
      const verifyReq = {
        body: {
          email: 'user@example.com',
          otp: '123456',
        },
      };

      mockService.verifyOtp.mockResolvedValue(undefined);

      await controller.verifyOtp(
        verifyReq as TypedRequest<'verifyOtp'>,
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

    it('should return 400 when validation fails due to invalid OTP length', async () => {
      const verifyReq = {
        body: {
          email: 'user@example.com',
          otp: '123',
        },
      };

      await controller.verifyOtp(
        verifyReq as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'OTP must be exactly 6 digits',
          }),
        }),
      );
    });

    it('should handle BadRequestError thrown by service (e.g. OTP is Invalid)', async () => {
      const verifyReq = {
        body: {
          email: 'user@example.com',
          otp: '654321',
        },
      };

      mockService.verifyOtp.mockRejectedValue(new BadRequestError('OTP is Invalid'));

      await controller.verifyOtp(
        verifyReq as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'OTP is Invalid',
          }),
        }),
      );
    });

    it('should handle unhandled error thrown by service with 500', async () => {
      const verifyReq = {
        body: {
          email: 'user@example.com',
          otp: '123456',
        },
      };

      mockService.verifyOtp.mockRejectedValue(new Error('Redis connection failure'));

      await controller.verifyOtp(
        verifyReq as TypedRequest<'verifyOtp'>,
        mockResponse as unknown as TypedResponse<'verifyOtp'>,
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

  describe('login', () => {
    it('should return 200 with tokens when authentication succeeds', async () => {
      const loginReq = {
        body: {
          email: 'user@example.com',
          password: 'P@ssw0rd123!',
        },
      };

      const tokens = {
        accessToken: 'access_token_sample',
        refreshToken: 'refresh_token_sample',
        tokenType: 'Bearer' as const,
        expiresIn: 3600,
      };

      mockService.login.mockResolvedValue(tokens);

      await controller.login(
        loginReq as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(tokens);
    });

    it('should return 400 when login validation fails due to invalid email', async () => {
      const loginReq = {
        body: {
          email: 'invalid-email',
          password: 'P@ssw0rd123!',
        },
      };

      await controller.login(
        loginReq as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'Invalid email address format',
          }),
        }),
      );
    });

    it('should handle UnauthorizedError thrown by service with 401 response envelope', async () => {
      const loginReq = {
        body: {
          email: 'user@example.com',
          password: 'WrongPassword!',
        },
      };

      mockService.login.mockRejectedValue(new UnauthorizedError('Invalid credentials'));

      await controller.login(
        loginReq as TypedRequest<'loginUser'>,
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

    it('should handle unhandled service error with 500 response envelope', async () => {
      const loginReq = {
        body: {
          email: 'user@example.com',
          password: 'P@ssw0rd123!',
        },
      };

      mockService.login.mockRejectedValue(new Error('Internal database exception'));

      await controller.login(
        loginReq as TypedRequest<'loginUser'>,
        mockResponse as unknown as TypedResponse<'loginUser'>,
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
});
