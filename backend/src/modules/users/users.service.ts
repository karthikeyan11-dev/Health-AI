import { usersRepository, UsersRepository, type UserQueryFilter } from './users.repository';
import { NotFoundError } from '../../shared/errors/httpErrors';
import type { User } from './users.dto';
import { logger } from '@config/logger';

export class UsersService {
  constructor(private readonly repo: UsersRepository = usersRepository) {}

  /**
   * Retrieves paginated list of users with total count metadata.
   */
  public async getUsers(
    filter: UserQueryFilter,
    page = 1,
    limit = 20,
  ): Promise<{ users: User[]; total: number; page: number; limit: number }> {
    try {
      const [userDocs, total] = await Promise.all([
        this.repo.findUsersPaginated(filter, page, limit),
        this.repo.countUsers(filter),
      ]);

      const users: User[] = userDocs.map((doc) => ({
        id: doc.id,
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
        phoneNumber: doc.phoneNumber,
        age: doc.age,
        gender: doc.gender,
        role: doc.role,
        isActive: doc.isActive,
        isEmailVerified: doc.isEmailVerified,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : undefined,
      }));

      return { users, total, page, limit };
    } catch (error) {
      logger.error({ err: error, filter, page, limit }, 'UsersService.getUsers - Error');
      throw error;
    }
  }

  /**
   * Retrieves single user document by ID.
   */
  public async getUserById(userId: string): Promise<User> {
    try {
      const doc = await this.repo.findById(userId);
      if (!doc) {
        throw new NotFoundError('User not found');
      }

      return {
        id: doc.id,
        email: doc.email,
        firstName: doc.firstName,
        lastName: doc.lastName,
        phoneNumber: doc.phoneNumber,
        age: doc.age,
        gender: doc.gender,
        role: doc.role,
        isActive: doc.isActive,
        isEmailVerified: doc.isEmailVerified,
        createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: doc.updatedAt ? new Date(doc.updatedAt).toISOString() : new Date().toISOString(),
        lastLoginAt: doc.lastLoginAt ? new Date(doc.lastLoginAt).toISOString() : undefined,
      };
    } catch (error) {
      logger.error({ err: error, userId }, 'UsersService.getUserById - Error');
      throw error;
    }
  }
}

export const usersService = new UsersService();
