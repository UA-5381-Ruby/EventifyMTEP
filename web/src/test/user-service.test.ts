import type { AxiosResponse } from 'axios';
import { UserService } from '@/services/user-service';
import apiClient from '@/lib/api-client';
import type { User, UpdateUserRequest } from '@/types/user';

jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  parseApiError: jest.fn((err) => {
    throw err;
  }),
}));

describe('UserService', () => {
  const mockUser: User = {
    id: 123,
    name: 'John Doe',
    email: 'john@example.com',
    is_superadmin: false,
  };

  const mockAdminUser: User = {
    id: 456,
    name: 'Admin User',
    email: 'admin@example.com',
    is_superadmin: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should fetch all users from GET /api/v1/users', async () => {
      const mockUsers: User[] = [mockUser, mockAdminUser];
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockUsers,
      } as AxiosResponse);

      const result = await UserService.getAllUsers();

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users');
      expect(result).toEqual(mockUsers);
    });

    it('should return an empty array when no users exist', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: [],
      } as AxiosResponse);

      const result = await UserService.getAllUsers();

      expect(result).toEqual([]);
    });

    it('should throw an error when the request fails', async () => {
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getAllUsers()).rejects.toThrow('Network error');
    });
  });

  describe('getUserById', () => {
    it('should fetch a user by ID from GET /api/v1/users/:id', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockUser,
      } as AxiosResponse);

      const result = await UserService.getUserById('123');

      expect(apiClient.get).toHaveBeenCalledWith('/api/v1/users/123');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error when user is not found (404)', async () => {
      const error = new Error('Not Found');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(UserService.getUserById('non-existent')).rejects.toThrow('Not Found');
    });

    it('should handle superadmin users correctly', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue({
        data: mockAdminUser,
      } as AxiosResponse);

      const result = await UserService.getUserById('456');

      expect(result.is_superadmin).toBe(true);
    });
  });

  describe('updateUser', () => {
    it('should update user with PATCH /api/v1/users/:id', async () => {
      const updatePayload: UpdateUserRequest = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };
      const updatedUser: User = { ...mockUser, ...updatePayload };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: updatedUser,
      } as AxiosResponse);

      const result = await UserService.updateUser('123', updatePayload);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/123', updatePayload);
      expect(result).toEqual(updatedUser);
    });

    it('should update only the name field', async () => {
      const updatePayload: UpdateUserRequest = { name: 'Updated Name' };
      const updatedUser: User = { ...mockUser, name: 'Updated Name' };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: updatedUser,
      } as AxiosResponse);

      const result = await UserService.updateUser('123', updatePayload);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/123', updatePayload);
      expect(result.name).toBe('Updated Name');
    });

    it('should update only the email field', async () => {
      const updatePayload: UpdateUserRequest = {
        email: 'newemail@example.com',
      };
      const updatedUser: User = { ...mockUser, email: 'newemail@example.com' };

      (apiClient.patch as jest.Mock).mockResolvedValue({
        data: updatedUser,
      } as AxiosResponse);

      const result = await UserService.updateUser('123', updatePayload);

      expect(apiClient.patch).toHaveBeenCalledWith('/api/v1/users/123', updatePayload);
      expect(result.email).toBe('newemail@example.com');
    });

    it('should throw an error when permission is denied (403)', async () => {
      const error = new Error('Forbidden');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      const updatePayload: UpdateUserRequest = { name: 'Hacker' };

      await expect(UserService.updateUser('123', updatePayload)).rejects.toThrow('Forbidden');
    });

    it('should throw an error when user is not found (404)', async () => {
      const error = new Error('Not Found');
      (apiClient.patch as jest.Mock).mockRejectedValue(error);

      const updatePayload: UpdateUserRequest = { name: 'New Name' };

      await expect(UserService.updateUser('non-existent', updatePayload)).rejects.toThrow(
        'Not Found'
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user with DELETE /api/v1/users/:id', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await UserService.deleteUser('123');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/v1/users/123');
    });

    it('should throw an error when permission is denied (403)', async () => {
      const error = new Error('Forbidden');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(UserService.deleteUser('123')).rejects.toThrow('Forbidden');
    });

    it('should throw an error when user is not found (404)', async () => {
      const error = new Error('Not Found');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(UserService.deleteUser('non-existent')).rejects.toThrow('Not Found');
    });

    it('should successfully delete multiple users in sequence', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      await UserService.deleteUser('1');
      await UserService.deleteUser('2');

      expect(apiClient.delete).toHaveBeenCalledTimes(2);
      expect(apiClient.delete).toHaveBeenNthCalledWith(1, '/api/v1/users/1');
      expect(apiClient.delete).toHaveBeenNthCalledWith(2, '/api/v1/users/2');
    });
  });
});
