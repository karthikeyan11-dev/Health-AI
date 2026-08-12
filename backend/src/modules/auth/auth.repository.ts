import { UserModel, type IUserDocument, type IUser } from '@models/user.model';

/**
 * Repository layer abstraction handling database operations on the `users` collection.
 */
export class AuthRepository {
  /**
   * Finds a user document by normalized email address.
   */
  public async findByEmail(email: string): Promise<IUserDocument | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return UserModel.findOne({ email: normalizedEmail }).exec();
  }

  /**
   * Checks whether a user with the given email already exists in MongoDB.
   */
  public async existsByEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const count = await UserModel.countDocuments({ email: normalizedEmail }).exec();
    return count > 0;
  }

  /**
   * Creates and persists a new user document in MongoDB.
   */
  public async createUser(userData: Partial<IUser>): Promise<IUserDocument> {
    const user = new UserModel({
      ...userData,
      email: userData.email?.trim().toLowerCase(),
    });
    return user.save();
  }
}

export const authRepository = new AuthRepository();
