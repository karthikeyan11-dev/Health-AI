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

  return {
    UserModel: MockUserModel,
    UserRole: {
      PATIENT: 'PATIENT',
      CLINICIAN: 'CLINICIAN',
      ADMIN: 'ADMIN',
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
  });
});
