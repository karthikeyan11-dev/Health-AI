import { AuthRepository } from '../../../src/modules/auth/auth.repository';
import { UserModel } from '../../../src/models/user.model';

jest.mock('../../../src/models/user.model');

describe('AuthRepository Unit Tests', () => {
  let repository: AuthRepository;

  beforeEach(() => {
    repository = new AuthRepository();
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user document by normalized email', async () => {
      const mockExec = jest.fn().mockResolvedValue({ email: 'karthikeyanm2209@gmail.com' });
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      const user = await repository.findByEmail('  KarthikeyanM2209@gmail.com ');

      expect(user).toEqual({ email: 'karthikeyanm2209@gmail.com' });
      expect(UserModel.findOne).toHaveBeenCalledWith({ email: 'karthikeyanm2209@gmail.com' });
    });

    it('should rethrow error when UserModel.findOne throws an exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('DB failure'));
      (UserModel.findOne as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow('DB failure');
    });
  });

  describe('findByEmailWithPassword', () => {
    it('should find user with passwordHash select field', async () => {
      const mockExec = jest.fn().mockResolvedValue({
        email: 'karthikeyanm2209@gmail.com',
        passwordHash: '$2a$10$hashedpassword',
      });
      const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: mockSelect });

      const user = await repository.findByEmailWithPassword('karthikeyanm2209@gmail.com');

      expect(user).toEqual({
        email: 'karthikeyanm2209@gmail.com',
        passwordHash: '$2a$10$hashedpassword',
      });
      expect(mockSelect).toHaveBeenCalledWith('+passwordHash');
    });

    it('should rethrow error when findByEmailWithPassword fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Query error'));
      const mockSelect = jest.fn().mockReturnValue({ exec: mockExec });
      (UserModel.findOne as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(repository.findByEmailWithPassword('test@example.com')).rejects.toThrow(
        'Query error',
      );
    });
  });

  describe('existsByEmail', () => {
    it('should return true when count > 0', async () => {
      const mockExec = jest.fn().mockResolvedValue(1);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const exists = await repository.existsByEmail('karthikeyanm2209@gmail.com');

      expect(exists).toBe(true);
    });

    it('should return false when count === 0', async () => {
      const mockExec = jest.fn().mockResolvedValue(0);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const exists = await repository.existsByEmail('new@example.com');

      expect(exists).toBe(false);
    });

    it('should rethrow error when countDocuments throws exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Count error'));
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.existsByEmail('test@example.com')).rejects.toThrow('Count error');
    });
  });

  describe('createUser', () => {
    it('should normalize email and save new user document', async () => {
      const mockSave = jest
        .fn()
        .mockResolvedValue({ id: 'usr_1', email: 'karthikeyanm2209@gmail.com' });
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
      }));

      const user = await repository.createUser({
        email: '  KarthikeyanM2209@gmail.com ',
        firstName: 'Karthikeyan',
      });

      expect(user).toEqual({ id: 'usr_1', email: 'karthikeyanm2209@gmail.com' });
      expect(mockSave).toHaveBeenCalled();
    });

    it('should rethrow error when user save fails', async () => {
      const mockSave = jest.fn().mockRejectedValue(new Error('Validation exception'));
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave,
      }));

      await expect(repository.createUser({ email: 'test@example.com' })).rejects.toThrow(
        'Validation exception',
      );
    });
  });

  describe('findById', () => {
    it('should return user document by ID', async () => {
      const mockExec = jest.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011' });
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      const user = await repository.findById('507f1f77bcf86cd799439011');

      expect(user).toEqual({ id: '507f1f77bcf86cd799439011' });
    });

    it('should return null when UserModel.findById throws error', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Find error'));
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      const user = await repository.findById('507f1f77bcf86cd799439011');

      expect(user).toBeNull();
    });
  });

  describe('updateLastLogin', () => {
    it('should update lastLoginAt for given user ID', async () => {
      const mockExec = jest.fn().mockResolvedValue({});
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      await repository.updateLastLogin('507f1f77bcf86cd799439011');

      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        expect.objectContaining({ lastLoginAt: expect.any(Date) }),
      );
    });

    it('should rethrow error when findByIdAndUpdate fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Update error'));
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.updateLastLogin('507f1f77bcf86cd799439011')).rejects.toThrow(
        'Update error',
      );
    });
  });
});
