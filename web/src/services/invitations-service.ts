import apiClient, { parseApiError } from '@/lib/api-client';

export const InvitationsService = {
  async sendInvitation(brandId: number, email: string, role: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/brands/${brandId}/invitations`, { email, role });
    } catch (err) {
      parseApiError(err);
    }
  },

  async acceptInvitation(brandId: number, token: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/brands/${brandId}/invitations/accept`, { token });
    } catch (err) {
      parseApiError(err);
    }
  },
};
