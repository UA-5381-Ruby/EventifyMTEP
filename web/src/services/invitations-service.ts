import apiClient from '@/lib/api-client';

export const InvitationsService = {
  async sendInvitation(brandId: number, email: string, role: string): Promise<void> {
    await apiClient.post(`/api/v1/brands/${brandId}/invitations`, { email, role });
  },

  async acceptInvitation(brandId: number, token: string): Promise<void> {
    await apiClient.post(`/api/v1/brands/${brandId}/invitations/accept`, { token });
  },
};
