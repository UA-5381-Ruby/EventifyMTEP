import apiClient from '@/lib/apiClient';
import {
  type CreateEventPayload,
  type UpdateUserPayload,
  type UpdateBrandPayload,
  type SuperadminMembershipPayload,
} from '@/types/superadmin';

export const SuperadminService = {
  async createEvent(payload: CreateEventPayload) {
    const response = await apiClient.post('/api/v1/events', payload);
    return response.data;
  },

  async approveEvent(eventId: string | number) {
    const response = await apiClient.post(`/api/v1/events/${eventId}/approve`);
    return response.data;
  },

  async rejectEvent(eventId: string | number) {
    const response = await apiClient.post(`/api/v1/events/${eventId}/reject`);
    return response.data;
  },

  async updateUser(userId: string | number, payload: UpdateUserPayload) {
    const response = await apiClient.patch(`/api/v1/users/${userId}`, payload);
    return response.data;
  },

  async deleteUser(userId: string | number): Promise<void> {
    await apiClient.delete(`/api/v1/users/${userId}`);
  },

  async updateBrand(brandId: string | number, payload: UpdateBrandPayload) {
    const response = await apiClient.patch(`/api/v1/brands/${brandId}`, payload);
    return response.data;
  },

  async deleteBrand(brandId: string | number): Promise<void> {
    await apiClient.delete(`/api/v1/brands/${brandId}`);
  },

  async getBrandMemberships(brandId: string | number, params?: Record<string, unknown>) {
    const response = await apiClient.get(`/api/v1/brands/${brandId}/memberships`, {
      params,
    });
    return response.data;
  },

  async addBrandMember(brandId: string | number, payload: SuperadminMembershipPayload) {
    const response = await apiClient.post(`/api/v1/brands/${brandId}/memberships`, payload);
    return response.data;
  },

  async updateBrandMember(brandId: string | number, membershipId: string | number, role: string) {
    const response = await apiClient.patch(
      `/api/v1/brands/${brandId}/memberships/${membershipId}`,
      { role }
    );
    return response.data;
  },

  async removeBrandMember(brandId: string | number, membershipId: string | number): Promise<void> {
    await apiClient.delete(`/api/v1/brands/${brandId}/memberships/${membershipId}`);
  },
};
