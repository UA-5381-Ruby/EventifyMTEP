import apiClient, { parseApiError } from '@/lib/api-client';
import type { User, UpdateUserRequest, UserProfile } from '@/types/user';

export const UserService = {
  /**
   * Retrieves a list of all users.
   * Typically used for administrative dashboards or directory listings.
   * @returns Array of all users
   * @throws Error if the request fails
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const response = await apiClient.get<User[]>('/api/v1/users');
      return response.data;
    } catch (err) {
      return parseApiError(err);
    }
  },

  /**
   * Retrieves detailed profile information for a specific user.
   * @param id The ID of the user to retrieve
   * @returns The user profile
   * @throws Error if user is not found (404) or request fails
   */
  async getUserById(id: number | string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/api/v1/users/${id}`);
      return response.data;
    } catch (err) {
      parseApiError(err);
    }
  },

  /**
   * Updates user details (name, email).
   * Only the resource owner or a superadmin has permission to perform this action.
   * @param id The ID of the user to update
   * @param payload The fields to update
   * @returns The updated user profile
   * @throws Error if permission is denied (403) or user is not found (404)
   */
  async updateUser(id: number | string, payload: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.patch<User>(`/api/v1/users/${id}`, payload);
      return response.data;
    } catch (err) {
      parseApiError(err);
    }
  },

  /**
   * Permanently removes a user account.
   * Restricted to the account owner or a superadmin.
   * @param id The ID of the user to delete
   * @throws Error if permission is denied (403) or user is not found (404)
   */
  async deleteUser(id: number | string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/users/${id}`);
    } catch (err) {
      parseApiError(err);
    }
  },
};

// Legacy function for backward compatibility
export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>('/api/v1/users/me');
    return response.data;
  } catch (err) {
    throw parseApiError(err);
  }
};
