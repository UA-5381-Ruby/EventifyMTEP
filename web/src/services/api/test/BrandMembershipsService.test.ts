import apiClient from '@/lib/apiClient';
import { BrandMembershipsService } from '@/services/BrandMembershipsService'; // Змініть шлях на ваш реальний
import {
  type UserRole,
  type CreateMembershipRequest,
  type PaginationParams,
} from '@/types/brandMemberships';

// Мокаємо apiClient, щоб він не робив реальних HTTP-запитів
jest.mock('@/services/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

describe('BrandMembershipsService', () => {
  const mockBrandId = 'brand-123';
  const mockMembershipId = 'mem-456';

  // Очищаємо моки перед кожним тестом, щоб вони не впливали один на одного
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBrandMemberships', () => {
    it('повинен відправляти GET-запит з правильними параметрами пагінації', async () => {
      const mockResponse = {
        data: {
          items: [{ id: '1', role: 'admin' }],
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

    it('повинен відправляти GET-запит без query-параметрів, якщо вони не передані', async () => {
      const mockResponse = { data: { items: [], total: 0 } };
      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const params: PaginationParams = {};
      const result = await BrandMembershipsService.getBrandMemberships(mockBrandId, params);

      // Оскільки параметри пусті, рядок запиту не повинен додаватися
      expect(apiClient.get).toHaveBeenCalledWith(`/api/v1/brands/${mockBrandId}/memberships`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addBrandMember', () => {
    it('повинен відправляти POST-запит з правильним payload', async () => {
      const mockPayload: CreateMembershipRequest = {
        user_id: 'user-789',
        role: 'editor' as UserRole,
      };
      const mockResponse = { data: { id: 'new-mem', ...mockPayload } };

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
    it('повинен відправляти PATCH-запит для оновлення ролі', async () => {
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
    it('повинен відправляти DELETE-запит для видалення учасника', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue({ data: {} });

      await BrandMembershipsService.removeMember(mockBrandId, mockMembershipId);

      expect(apiClient.delete).toHaveBeenCalledWith(
        `/api/v1/brands/${mockBrandId}/memberships/${mockMembershipId}`
      );
    });
  });
});
