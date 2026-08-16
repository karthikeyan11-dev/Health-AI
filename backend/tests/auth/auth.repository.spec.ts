import { AuthRepository } from '../../src/modules/auth/auth.repository';
import { UserModel, UserRole } from '../../src/models/user.model';

const mockSave = jest.fn();

jest.mock('../../src/models/user.model', () => {
  function MockUserModel(this: unknown, data: Record<string, unknown>): Record<string, unknown> {
    return {
      ...data,
      save: mockSave,
    };
  }

  (MockUserModel as unknown as Record<string, jest.Mock>).findOne = jest.fn();
  (MockUserModel as unknown as Record<string, jest.Mock>).countDocuments = jest.fn();
  (MockUserModel as unknown as Record<string, jest.Mock>).findByIdAndUpdate = jest.fn();

  return {
    UserModel: MockUserModel,
    UserRole: {
      PATIENT: 'PATIENT',
      SYSTEM: 'SYSTEM',
    },
  };
});

describe('AuthRepository Unit Tests', () => {
  let repository: AuthRepository;

  beforeEach(() => {
    repository = new AuthRepository();
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user document by email', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        id: 'user_123',
        email: 'user@example.com',
      });
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findByEmail(' User@Example.com ');

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual({ id: 'user_123', email: 'user@example.com' });
    });

    it('should return null if user is not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.findByEmail('unknown@example.com');

      expect(result).toBeNull();
    });

    it('should log error and rethrow when findByEmail encounters a database failure', async () => {
      const dbError = new Error('Database connection failed');
      const mockExec = jest.fn().mockRejectedValue(dbError);
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.findByEmail('fail@example.com')).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find user document with passwordHash selected', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        id: 'user_123',
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
      });
      const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await repository.findByEmailWithPassword(' User@Example.com ');

      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'user@example.com' });
      expect(mockSelect).toHaveBeenCalledWith('+passwordHash');
      expect(mockExec).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'user_123',
        email: 'user@example.com',
        passwordHash: 'hashed_pw',
      });
    });

    it('should return null if user with password is not found', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await repository.findByEmailWithPassword('unknown@example.com');

      expect(result).toBeNull();
    });

    it('should log error and rethrow when findByEmailWithPassword encounters a database failure', async () => {
      const dbError = new Error('DB read error');
      const mockExec = jest.fn().mockRejectedValue(dbError);
      const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(repository.findByEmailWithPassword('fail@example.com')).rejects.toThrow(
        'DB read error',
      );
    });
  });

  describe('existsByEmail', () => {
    it('should return true if count > 0', async () => {
      const mockExec = jest.fn().mockResolvedValue(1);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.existsByEmail('existing@example.com');

      expect(UserModel.countDocuments).toHaveBeenCalledWith({ email: 'existing@example.com' });
      expect(result).toBe(true);
    });

    it('should return false if count is 0', async () => {
      const mockExec = jest.fn().mockResolvedValue(0);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const result = await repository.existsByEmail('new@example.com');

      expect(result).toBe(false);
    });

    it('should log error and rethrow when existsByEmail encounters a database failure', async () => {
      const dbError = new Error('DB count error');
      const mockExec = jest.fn().mockRejectedValue(dbError);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.existsByEmail('fail@example.com')).rejects.toThrow('DB count error');
    });
  });

  describe('createUser', () => {
    it('should create and save user document with normalized email', async () => {
      const userData = {
        email: ' Test@Example.com ',
        passwordHash: 'hashedpassword',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.PATIENT,
      };

      const savedUser = {
        id: 'mock_user_id',
        ...userData,
        email: 'test@example.com',
      };
      mockSave.mockResolvedValue(savedUser);

      const result = await repository.createUser(userData);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it('should handle undefined email gracefully during creation', async () => {
      const userData = {
        passwordHash: 'hashedpassword',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const savedUser = {
        id: 'mock_user_id',
        ...userData,
        email: undefined,
      };
      mockSave.mockResolvedValue(savedUser);

      const result = await repository.createUser(userData);

      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual(savedUser);
    });

    it('should log error and rethrow when createUser fails to save', async () => {
      const userData = {
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
      };
      mockSave.mockRejectedValue(new Error('Save failed'));

      await expect(repository.createUser(userData)).rejects.toThrow('Save failed');
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt for given user ID', async () => {
      const mockExec = jest.fn().mockResolvedValue({});
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      await repository.updateLastLogin('user_123');

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_123',
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
      expect(mockExec).toHaveBeenCalled();
    });

    it('should log error and rethrow when updateLastLogin encounters a database failure', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Update failed'));
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.updateLastLogin('user_123')).rejects.toThrow('Update failed');
    });
  });
});
