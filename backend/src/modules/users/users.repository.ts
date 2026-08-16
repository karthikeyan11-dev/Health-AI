import { UserModel, type IUserDocument, type IUser } from '@models/user.model';
import { logger } from '@config/logger';

export interface UserQueryFilter {
  role?: string;
  isActive?: boolean;
  search?: string;
}

export class UsersRepository {
  /**
   * Fetches paginated user records from MongoDB.
   */
  public async findUsersPaginated(
    filter: UserQueryFilter,
    page = 1,
    limit = 20,
  ): Promise<IUserDocument[]> {
    try {
      const query: Record<string, unknown> = {};

      if (filter.role) {
        query.role = filter.role;
      }
      if (filter.isActive !== undefined) {
        query.isActive = filter.isActive;
      }
      if (filter.search) {
        const searchRegex = new RegExp(filter.search.trim(), 'i');
        query.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
      }

      const skip = (page - 1) * limit;
      return await UserModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
    } catch (error) {
      logger.error(
        { err: error, filter, page, limit },
        'UsersRepository.findUsersPaginated - Error',
      );
      throw error;
    }
  }

  /**
   * Counts total matching user records in MongoDB.
   */
  public async countUsers(filter: UserQueryFilter): Promise<number> {
    try {
      const query: Record<string, unknown> = {};

      if (filter.role) {
        query.role = filter.role;
      }
      if (filter.isActive !== undefined) {
        query.isActive = filter.isActive;
      }
      if (filter.search) {
        const searchRegex = new RegExp(filter.search.trim(), 'i');
        query.$or = [{ firstName: searchRegex }, { lastName: searchRegex }, { email: searchRegex }];
      }

      return await UserModel.countDocuments(query).exec();
    } catch (error) {
      logger.error({ err: error, filter }, 'UsersRepository.countUsers - Error');
      throw error;
    }
  }

  /**
   * Finds user document by ID.
   */
  public async findById(userId: string): Promise<IUserDocument | null> {
    try {
      return await UserModel.findById(userId).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'UsersRepository.findById - Error');
      return null;
    }
  }

  /**
   * Creates a new user document.
   */
  public async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
    try {
      const normalizedEmail = userData.email?.trim().toLowerCase();
      const user = new UserModel({
        ...userData,
        email: normalizedEmail,
      });
      return await user.save();
    } catch (error) {
      logger.error({ err: error, email: userData.email }, 'UsersRepository.createUser - Error');
      throw error;
    }
  }

  /**
   * Updates an existing user document by ID.
   */
  public async updateUser(
    userId: string,
    updateData: Partial<IUser>,
  ): Promise<IUserDocument | null> {
    try {
      return await UserModel.findByIdAndUpdate(userId, { $set: updateData }, { new: true }).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'UsersRepository.updateUser - Error');
      throw error;
    }
  }

  /**
   * Deletes a user document by ID.
   */
  public async deleteUser(userId: string): Promise<boolean> {
    try {
      const result = await UserModel.findByIdAndDelete(userId).exec();
      return result !== null;
    } catch (error) {
      logger.error({ err: error, userId }, 'UsersRepository.deleteUser - Error');
      throw error;
    }
  }
}

export const usersRepository = new UsersRepository();
