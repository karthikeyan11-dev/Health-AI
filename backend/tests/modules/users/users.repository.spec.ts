import { UsersRepository } from '../../../src/modules/users/users.repository';
import { UserModel } from '../../../src/models/user.model';

jest.mock('../../../src/models/user.model');

describe('UsersRepository Unit Tests', () => {
  let repository: UsersRepository;

  beforeEach(() => {
    repository = new UsersRepository();
    jest.clearAllMocks();
  });

  describe('findUsersPaginated', () => {
    it('should query MongoDB with filters, skip, and limit', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ id: 'usr_1' }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      (UserModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findUsersPaginated(
        { role: 'PATIENT', isActive: true, search: 'Karthik' },
        2,
        10,
      );

      expect(result).toEqual([{ id: 'usr_1' }]);
      expect(UserModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'PATIENT',
          isActive: true,
          $or: expect.arrayContaining([{ firstName: expect.any(RegExp) }]),
        }),
      );
      expect(mockSkip).toHaveBeenCalledWith(10);
      expect(mockLimit).toHaveBeenCalledWith(10);
    });

    it('should use default page 1 and limit 20 when parameters are omitted', async () => {
      const mockExec = jest.fn().mockResolvedValue([{ id: 'usr_1' }]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      (UserModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      const result = await repository.findUsersPaginated({});

      expect(result).toEqual([{ id: 'usr_1' }]);
      expect(UserModel.find).toHaveBeenCalledWith({});
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(20);
    });

    it('should rethrow error when UserModel.find throws an exception', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Query failed'));
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      (UserModel.find as jest.Mock).mockReturnValue({ sort: mockSort });

      await expect(repository.findUsersPaginated({}, 1, 10)).rejects.toThrow('Query failed');
    });
  });

  describe('countUsers', () => {
    it('should return matching user count from MongoDB with filters', async () => {
      const mockExec = jest.fn().mockResolvedValue(5);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const count = await repository.countUsers({
        role: 'PATIENT',
        isActive: false,
        search: 'Karthik',
      });

      expect(count).toBe(5);
      expect(UserModel.countDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'PATIENT',
          isActive: false,
          $or: expect.arrayContaining([{ email: expect.any(RegExp) }]),
        }),
      );
    });

    it('should query count with empty filter', async () => {
      const mockExec = jest.fn().mockResolvedValue(10);
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      const count = await repository.countUsers({});

      expect(count).toBe(10);
      expect(UserModel.countDocuments).toHaveBeenCalledWith({});
    });

    it('should rethrow error when countDocuments fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Count failure'));
      (UserModel.countDocuments as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.countUsers({})).rejects.toThrow('Count failure');
    });
  });

  describe('findById', () => {
    it('should return user document by ID', async () => {
      const mockExec = jest.fn().mockResolvedValue({ id: '507f1f77bcf86cd799439011' });
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      const user = await repository.findById('507f1f77bcf86cd799439011');

      expect(user).toEqual({ id: '507f1f77bcf86cd799439011' });
    });

    it('should return null when error is thrown', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('DB failure'));
      (UserModel.findById as jest.Mock).mockReturnValue({ exec: mockExec });

      const user = await repository.findById('507f1f77bcf86cd799439011');

      expect(user).toBeNull();
    });
  });

  describe('createUser', () => {
    it('should normalize email and save new user document', async () => {
      const saveMock = jest.fn().mockResolvedValue({ id: 'usr_new', email: 'user@example.com' });
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      const user = await repository.createUser({
        email: '  User@Example.com ',
        firstName: 'John',
        lastName: 'Doe',
      });

      expect(user).toEqual({ id: 'usr_new', email: 'user@example.com' });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should handle undefined email in createUser', async () => {
      const saveMock = jest.fn().mockResolvedValue({ id: 'usr_no_email' });
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      const user = await repository.createUser({
        firstName: 'NoEmailUser',
      });

      expect(user).toEqual({ id: 'usr_no_email' });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should rethrow error when user save fails', async () => {
      const saveMock = jest.fn().mockRejectedValue(new Error('Validation error'));
      (UserModel as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      await expect(repository.createUser({ email: 'test@example.com' })).rejects.toThrow(
        'Validation error',
      );
    });
  });

  describe('updateUser', () => {
    it('should call findByIdAndUpdate and return updated user document', async () => {
      const mockExec = jest.fn().mockResolvedValue({ id: 'usr_1', firstName: 'Updated' });
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      const updated = await repository.updateUser('usr_1', { firstName: 'Updated' });

      expect(updated).toEqual({ id: 'usr_1', firstName: 'Updated' });
      expect(UserModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'usr_1',
        { $set: { firstName: 'Updated' } },
        { new: true },
      );
    });

    it('should rethrow error when findByIdAndUpdate fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Update failed'));
      (UserModel.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.updateUser('usr_1', {})).rejects.toThrow('Update failed');
    });
  });

  describe('deleteUser', () => {
    it('should return true when document was found and deleted', async () => {
      const mockExec = jest.fn().mockResolvedValue({ id: 'usr_1' });
      (UserModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: mockExec });

      const success = await repository.deleteUser('usr_1');

      expect(success).toBe(true);
      expect(UserModel.findByIdAndDelete).toHaveBeenCalledWith('usr_1');
    });

    it('should return false when no document matched for deletion', async () => {
      const mockExec = jest.fn().mockResolvedValue(null);
      (UserModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: mockExec });

      const success = await repository.deleteUser('usr_missing');

      expect(success).toBe(false);
    });

    it('should rethrow error when findByIdAndDelete fails', async () => {
      const mockExec = jest.fn().mockRejectedValue(new Error('Delete error'));
      (UserModel.findByIdAndDelete as jest.Mock).mockReturnValue({ exec: mockExec });

      await expect(repository.deleteUser('usr_1')).rejects.toThrow('Delete error');
    });
  });
});
