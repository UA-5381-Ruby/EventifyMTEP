import apiClient from '@/lib/api-client';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import {
  type UserRole,
  type CreateMembershipRequest,
  type PaginationParams,
} from '@/types/brand-memberships';

jest.mock('@/lib/api-client', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe('BrandMembershipsService', () => {
  const mockBrandId = 123;
  const mockMembershipId = 456;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBrandMemberships', () => {
    it('should send a GET request with correct pagination params', async () => {
      const mockResponse = {
        data: {
          items: [{ id: 1, role: 'admin' }],
          total: 1,
          page: 2,
          per_page: 10,
        },
      };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params: PaginationParams = { page: 2, per_page: 10 };
      const result = await BrandMembershipsService.getBrandMemberships(mockBrandId, params);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/api/v1/brands/${mockBrandId}/memberships?page=2&per_page=10`
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should send a GET request without query params when none are provided', async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params: PaginationParams = {};
      const result = await BrandMembershipsService.getBrandMemberships(mockBrandId, params);

      expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/brands/${mockBrandId}/memberships`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addBrandMember', () => {
    it('should send a POST request with the correct payload', async () => {
      const mockPayload: CreateMembershipRequest = {
        user_id: 789,
        role: 'editor' as UserRole,
      };
      const mockResponse = { data: { id: 1, ...mockPayload } };

      (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BrandMembershipsService.addBrandMember(mockBrandId, mockPayload);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/api/v1/brands/${mockBrandId}/memberships`,
        mockPayload
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('updateMemberRole', () => {
    it('should send a PATCH request to update the member role', async () => {
      const newRole = 'admin' as UserRole;
      const mockResponse = { data: { id: mockMembershipId, role: newRole } };

      (apiClient.patch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await BrandMembershipsService.updateMemberRole(
        mockBrandId,
        mockMembershipId,
        newRole
      );

      expect(apiClient.patch).toHaveBeenCalledWith(
        `/api/v1/brands/${mockBrandId}/memberships/${mockMembershipId}`,
        { role: newRole }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('removeMember', () => {
    it('should send a DELETE request to remove the member', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: {} });

      await BrandMembershipsService.removeMember(mockBrandId, mockMembershipId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/brands/${mockBrandId}/memberships/${mockMembershipId}`
      );
    });
  });
});
