import type { TypedRequest, TypedResponse } from '@shared/types';
import { HttpErrors, BadRequestError } from '@shared/errors';
import {
  validateRegisterRequest,
  validateVerifyOtpRequest,
  validateLoginRequest,
} from '@verification/auth.verification';
import { authService, AuthService } from './auth.service';
import { logger } from '@config/logger';

/**
 * Controller handling HTTP requests for user registration, email OTP verification, and authentication.
 */
export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  /**
   * POST /register and POST /auth/register
   * Validates request DTO and initiates registration OTP flow.
   */
  public register = async (
    req: TypedRequest<'registerUser'>,
    res: TypedResponse<'registerUser'>,
  ): Promise<TypedResponse<'registerUser'>> => {
    try {
      const parseResult = validateRegisterRequest(req.body);
      if (!parseResult.success) {
        const issues = parseResult.error.issues;
        const firstErrorMessage = issues[0]?.message;
        logger.warn({ issues }, 'AuthController.register - Validation failed');
        throw new BadRequestError(firstErrorMessage);
      }

      const result = await this.service.register(parseResult.data);

      return res.status(201).json({
        success: true,
        message: 'OTP verification code sent to your email',
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'AuthController.register - Exception occurred');

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
          message: 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * POST /verify-otp and POST /auth/verify-otp
   * Validates submitted OTP code and creates permanent user account.
   */
  public verifyOtp = async (
    req: TypedRequest<'verifyOtp'>,
    res: TypedResponse<'verifyOtp'>,
  ): Promise<TypedResponse<'verifyOtp'>> => {
    try {
      const parseResult = validateVerifyOtpRequest(req.body);
      if (!parseResult.success) {
        const issues = parseResult.error.issues;
        const firstErrorMessage = issues[0]?.message;
        logger.warn({ issues }, 'AuthController.verifyOtp - Validation failed');
        throw new BadRequestError(firstErrorMessage);
      }

      await this.service.verifyOtp(parseResult.data);

      return res.status(200).json({
        success: true,
        message: 'User created successfully',
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'AuthController.verifyOtp - Exception occurred');

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
          message: 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * POST /login and POST /auth/login
   * Validates user credentials, authenticates password, and issues JWT access/refresh tokens.
   */
  public login = async (
    req: TypedRequest<'loginUser'>,
    res: TypedResponse<'loginUser'>,
  ): Promise<TypedResponse<'loginUser'>> => {
    try {
      const parseResult = validateLoginRequest(req.body);
      if (!parseResult.success) {
        const issues = parseResult.error.issues;
        const firstErrorMessage = issues[0]?.message;
        logger.warn({ issues }, 'AuthController.login - Validation failed');
        throw new BadRequestError(firstErrorMessage);
      }

      const result = await this.service.login(parseResult.data);

      return res.status(200).json(result);
    } catch (error) {
      logger.error({ err: error }, 'AuthController.login - Exception occurred');

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
          message: 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /auth/profile
   * Returns current user profile details.
   */
  public getProfile = async (
    req: TypedRequest<'getProfile'>,
    res: TypedResponse<'getProfile'>,
  ): Promise<TypedResponse<'getProfile'>> => {
    try {
      const userId = req.user?.id;
      const profile = await this.service.getUserProfile(userId);
      return res.status(200).json({
        success: true,
        message: 'Profile details retrieved successfully',
        data: profile,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'AuthController.getProfile - Exception occurred');
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
          message: 'Internal server error',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const authController = new AuthController();
