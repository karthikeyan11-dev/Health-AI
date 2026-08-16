import { UsersService } from '../../../src/modules/users/users.service';
import type { UsersRepository } from '../../../src/modules/users/users.repository';
import { NotFoundError } from '../../../src/shared/errors/httpErrors';
import { UserRole } from '../../../src/models/user.model';
import { Gender } from '../../../src/models/patient.model';

describe('UsersService Unit Tests', () => {
  let service: UsersService;
  let mockRepo: jest.Mocked<UsersRepository>;

  const mockUserDoc = {
    id: '507f1f77bcf86cd799439011',
    email: 'karthikeyanm2209@gmail.com',
    firstName: 'Karthikeyan',
    lastName: 'M',
    phoneNumber: '+917339321071',
    age: 24,
    gender: Gender.MALE,
    role: UserRole.PATIENT,
    isActive: true,
    isEmailVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  beforeEach(() => {
    mockRepo = {
      findUsersPaginated: jest.fn(),
      countUsers: jest.fn(),
      findById: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    service = new UsersService(mockRepo);
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return mapped user DTO list with total count and page metadata', async () => {
      mockRepo.findUsersPaginated.mockResolvedValue([
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findUsersPaginated>>[number],
      ]);
      mockRepo.countUsers.mockResolvedValue(1);

      const result = await service.getUsers({ role: 'PATIENT' }, 1, 10);

      expect(result.users.length).toBe(1);
      expect(result.users[0]!.email).toBe('karthikeyanm2209@gmail.com');
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockRepo.findUsersPaginated).toHaveBeenCalledWith({ role: 'PATIENT' }, 1, 10);
      expect(mockRepo.countUsers).toHaveBeenCalledWith({ role: 'PATIENT' });
    });

    it('should handle default page and limit parameters and document null dates', async () => {
      const userWithoutDates = {
        ...mockUserDoc,
        createdAt: undefined,
        updatedAt: undefined,
        lastLoginAt: undefined,
      };

      mockRepo.findUsersPaginated.mockResolvedValue([
        userWithoutDates as unknown as Awaited<
          ReturnType<typeof mockRepo.findUsersPaginated>
        >[number],
      ]);
      mockRepo.countUsers.mockResolvedValue(1);

      const result = await service.getUsers({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.users[0]!.createdAt).toBeDefined();
      expect(result.users[0]!.updatedAt).toBeDefined();
      expect(result.users[0]!.lastLoginAt).toBeUndefined();
    });

    it('should rethrow error when repository query fails', async () => {
      mockRepo.findUsersPaginated.mockRejectedValue(new Error('Mongo error'));

      await expect(service.getUsers({}, 1, 10)).rejects.toThrow('Mongo error');
    });
  });

  describe('getUserById', () => {
    it('should return user DTO when valid userId is found', async () => {
      mockRepo.findById.mockResolvedValue(
        mockUserDoc as unknown as Awaited<ReturnType<typeof mockRepo.findById>>,
      );

      const user = await service.getUserById('507f1f77bcf86cd799439011');

      expect(user.id).toBe('507f1f77bcf86cd799439011');
      expect(user.email).toBe('karthikeyanm2209@gmail.com');
      expect(user.role).toBe(UserRole.PATIENT);
    });

    it('should handle null dates in getUserById', async () => {
      const userWithoutDates = {
        ...mockUserDoc,
        createdAt: undefined,
        updatedAt: undefined,
        lastLoginAt: undefined,
      };

      mockRepo.findById.mockResolvedValue(
        userWithoutDates as unknown as Awaited<ReturnType<typeof mockRepo.findById>>,
      );

      const user = await service.getUserById('507f1f77bcf86cd799439011');

      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      expect(user.lastLoginAt).toBeUndefined();
    });

    it('should throw NotFoundError when user does not exist in database', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(service.getUserById('507f1f77bcf86cd799439099')).rejects.toThrow(NotFoundError);
    });

    it('should rethrow error when repository findById fails', async () => {
      mockRepo.findById.mockRejectedValue(new Error('DB failure'));

      await expect(service.getUserById('507f1f77bcf86cd799439011')).rejects.toThrow('DB failure');
    });
  });
});
