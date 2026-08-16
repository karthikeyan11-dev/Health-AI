import { UserModel, type IUserDocument, type IUser } from '@models/user.model';
import { logger } from '@config/logger';

/**
 * Repository layer abstraction handling database operations on the `users` collection.
 */
export class AuthRepository {
  /**
   * Finds a user document by normalized email address.
   */
  public async findByEmail(email: string): Promise<IUserDocument | null> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      logger.debug({ email: normalizedEmail }, 'AuthRepository.findByEmail - Executing query');
      return await UserModel.findOne({ email: normalizedEmail }).exec();
    } catch (error) {
      logger.error({ err: error, email }, 'AuthRepository.findByEmail - Database error occurred');
      throw error;
    }
  }

  /**
   * Finds a user document by normalized email address including hidden passwordHash.
   */
  public async findByEmailWithPassword(email: string): Promise<IUserDocument | null> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      logger.debug(
        { email: normalizedEmail },
        'AuthRepository.findByEmailWithPassword - Executing query with passwordHash',
      );
      return await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash').exec();
    } catch (error) {
      logger.error(
        { err: error, email },
        'AuthRepository.findByEmailWithPassword - Database error occurred',
      );
      throw error;
    }
  }

  /**
   * Checks whether a user with the given email already exists in MongoDB.
   */
  public async existsByEmail(email: string): Promise<boolean> {
    try {
      const normalizedEmail = email.trim().toLowerCase();
      logger.debug(
        { email: normalizedEmail },
        'AuthRepository.existsByEmail - Executing count query',
      );
      const count = await UserModel.countDocuments({ email: normalizedEmail }).exec();
      return count > 0;
    } catch (error) {
      logger.error({ err: error, email }, 'AuthRepository.existsByEmail - Database error occurred');
      throw error;
    }
  }

  /**
   * Creates and persists a new user document in MongoDB.
   */
  public async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
    try {
      const normalizedEmail = userData.email?.trim().toLowerCase();
      logger.debug({ email: normalizedEmail }, 'AuthRepository.createUser - Persisting new user');
      const user = new UserModel({
        ...userData,
        email: normalizedEmail,
      });
      return await user.save();
    } catch (error) {
      logger.error(
        { err: error, email: userData.email },
        'AuthRepository.createUser - Database error occurred',
      );
      throw error;
    }
  }

  /**
   * Finds a user document by ID.
   */
  public async findById(userId: string): Promise<IUserDocument | null> {
    try {
      return await UserModel.findById(userId).exec();
    } catch (error) {
      logger.error({ err: error, userId }, 'AuthRepository.findById - Database error occurred');
      return null;
    }
  }

  /**
   * Updates lastLoginAt timestamp for the specified user ID.
   */
  public async updateLastLogin(userId: string): Promise<void> {
    try {
      logger.debug({ userId }, 'AuthRepository.updateLastLogin - Updating last login timestamp');
      await UserModel.findByIdAndUpdate(userId, { lastLoginAt: new Date() }).exec();
    } catch (error) {
      logger.error(
        { err: error, userId },
        'AuthRepository.updateLastLogin - Database error occurred',
      );
      throw error;
    }
  }
}

export const authRepository = new AuthRepository();
