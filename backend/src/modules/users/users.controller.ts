import { usersService, UsersService } from './users.service';
import type { TypedRequest, TypedResponse } from '@shared/types/express/express.types';
import { HttpErrors } from '../../shared/errors/httpErrors';
import { logger } from '@config/logger';

export class UsersController {
  constructor(private readonly service: UsersService = usersService) {}

  /**
   * GET /users
   * Returns user list filtered by optional query params.
   */
  public getUsers = async (
    req: TypedRequest<'getUsers'>,
    res: TypedResponse<'getUsers'>,
  ): Promise<TypedResponse<'getUsers'>> => {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 20;
      const role = req.query.role ? String(req.query.role) : undefined;
      const search = req.query.search ? String(req.query.search) : undefined;

      const result = await this.service.getUsers({ role, search }, page, limit);

      return res.status(200).json({
        success: true,
        message: 'Users list retrieved successfully',
        data: result.users,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'UsersController.getUsers - Error');
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
          message: 'Failed to retrieve users list',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };

  /**
   * GET /users/:userId
   * Returns user details by ID.
   */
  public getUserById = async (
    req: TypedRequest<'getUserById'>,
    res: TypedResponse<'getUserById'>,
  ): Promise<TypedResponse<'getUserById'>> => {
    try {
      const userId = req.params.userId;
      const user = await this.service.getUserById(userId);

      return res.status(200).json({
        success: true,
        message: 'User details retrieved successfully',
        data: user,
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    } catch (error) {
      logger.error({ err: error }, 'UsersController.getUserById - Error');
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
          message: 'Failed to retrieve user details',
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId: `req_${Math.random().toString(36).substring(2, 10)}`,
        },
      });
    }
  };
}

export const usersController = new UsersController();
