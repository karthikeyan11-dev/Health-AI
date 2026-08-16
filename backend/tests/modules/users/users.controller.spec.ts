import { UsersController } from '../../../src/modules/users/users.controller';
import type { UsersService } from '../../../src/modules/users/users.service';
import { NotFoundError, BadRequestError } from '../../../src/shared/errors/httpErrors';
import type { TypedRequest, TypedResponse } from '../../../src/shared/types/express/express.types';
import type { User } from '../../../src/modules/users/users.dto';

describe('UsersController Unit Tests', () => {
  let controller: UsersController;
  let mockService: jest.Mocked<UsersService>;
  let mockResponse: Partial<TypedResponse<'getUsers'>>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  const mockUser: User = {
    id: '507f1f77bcf86cd799439011',
    email: 'karthikeyanm2209@gmail.com',
    firstName: 'Karthikeyan',
    lastName: 'M',
    phoneNumber: '+917339321071',
    age: 24,
    gender: 'MALE',
    role: 'PATIENT',
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    mockService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
    } as unknown as jest.Mocked<UsersService>;

    controller = new UsersController(mockService);

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockResponse = {
      status: statusMock,
    };
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return 200 with list of users when service succeeds', async () => {
      const mockReq = {
        query: {
          page: '2',
          limit: '10',
          role: 'PATIENT',
          search: 'Karthik',
        },
      };

      mockService.getUsers.mockResolvedValue({
        users: [mockUser],
        total: 1,
        page: 2,
        limit: 10,
      });

      await controller.getUsers(
        mockReq as unknown as TypedRequest<'getUsers'>,
        mockResponse as TypedResponse<'getUsers'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'Users list retrieved successfully',
          data: [mockUser],
        }),
      );
      expect(mockService.getUsers).toHaveBeenCalledWith(
        { role: 'PATIENT', search: 'Karthik' },
        2,
        10,
      );
    });

    it('should use default page 1 and limit 20 when query parameters are omitted', async () => {
      const mockReq = {
        query: {},
      };

      mockService.getUsers.mockResolvedValue({
        users: [mockUser],
        total: 1,
        page: 1,
        limit: 20,
      });

      await controller.getUsers(
        mockReq as unknown as TypedRequest<'getUsers'>,
        mockResponse as TypedResponse<'getUsers'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(mockService.getUsers).toHaveBeenCalledWith(
        { role: undefined, search: undefined },
        1,
        20,
      );
    });

    it('should return error status code when service throws HttpErrors', async () => {
      const mockReq = { query: {} };
      mockService.getUsers.mockRejectedValue(new BadRequestError('Invalid query params'));

      await controller.getUsers(
        mockReq as unknown as TypedRequest<'getUsers'>,
        mockResponse as TypedResponse<'getUsers'>,
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'BADREQUESTERROR',
            message: 'Invalid query params',
          }),
        }),
      );
    });

    it('should return 500 when getUsers service throws an unknown error', async () => {
      const mockReq = { query: {} };
      mockService.getUsers.mockRejectedValue(new Error('Internal database error'));

      await controller.getUsers(
        mockReq as unknown as TypedRequest<'getUsers'>,
        mockResponse as TypedResponse<'getUsers'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve users list',
          }),
        }),
      );
    });
  });

  describe('getUserById', () => {
    it('should return 200 with user details when valid userId is requested', async () => {
      const mockReq = {
        params: { userId: '507f1f77bcf86cd799439011' },
      };

      mockService.getUserById.mockResolvedValue(mockUser);

      await controller.getUserById(
        mockReq as unknown as TypedRequest<'getUserById'>,
        mockResponse as TypedResponse<'getUserById'>,
      );

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: 'User details retrieved successfully',
          data: mockUser,
        }),
      );
      expect(mockService.getUserById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should return 404 when user is not found in database', async () => {
      const mockReq = {
        params: { userId: '507f1f77bcf86cd799439099' },
      };

      mockService.getUserById.mockRejectedValue(new NotFoundError('User not found'));

      await controller.getUserById(
        mockReq as unknown as TypedRequest<'getUserById'>,
        mockResponse as TypedResponse<'getUserById'>,
      );

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'NOTFOUNDERROR',
            message: 'User not found',
          }),
        }),
      );
    });

    it('should return 500 when an unexpected internal error occurs', async () => {
      const mockReq = {
        params: { userId: '507f1f77bcf86cd799439011' },
      };

      mockService.getUserById.mockRejectedValue(new Error('Unexpected system error'));

      await controller.getUserById(
        mockReq as unknown as TypedRequest<'getUserById'>,
        mockResponse as TypedResponse<'getUserById'>,
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to retrieve user details',
          }),
        }),
      );
    });
  });
});
