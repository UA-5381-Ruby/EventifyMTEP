import apiClient from '@/services/apiClient';
import {
    type UserRole,
    type Membership,
    type CreateMembershipRequest,
    type PaginationParams,
    type PaginatedResponse,
} from '../types/brandMemberships';

export const BrandMembershipsService = {
    /**
     * Retrieves a list of users associated with the brand.
     * @param brandId The ID of the brand
     * @param params Pagination parameters (page, per_page)
     * @returns Paginated list of memberships
     */
    async getBrandMemberships(
        brandId: string,
        params: PaginationParams
    ): Promise<PaginatedResponse<Membership>> {
        // (query string)
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.per_page) queryParams.append('per_page', params.per_page.toString());

        const queryString = queryParams.toString();
        const endpoint = `/api/v1/brands/${brandId}/memberships${queryString ? `?${queryString}` : ''}`;

        const response = await apiClient.get<PaginatedResponse<Membership>>(endpoint);
        return response.data;
    },

    /**
     * Invites or adds a user to a brand with a specific role.
     * @param brandId The ID of the brand
     * @param payload User ID and role to assign
     * @returns The created membership
     */
    async addBrandMember(
        brandId: string,
        payload: CreateMembershipRequest
    ): Promise<Membership> {
        const response = await apiClient.post<Membership>(
            `/api/v1/brands/${brandId}/memberships`,
            payload
        );
        return response.data;
    },

    /**
     * Updates the role of an existing member.
     * @param brandId The ID of the brand
     * @param membershipId The ID of the membership to update
     * @param role The new role to assign (must be valid UserRole)
     * @returns The updated membership
     */
    async updateMemberRole(
        brandId: string,
        membershipId: string,
        role: UserRole
    ): Promise<Membership> {
        // Відправляємо дані у форматі { brand_membership: { role: '...' } } або як вимагає ваш бекенд
        const payload = { role };

        const response = await apiClient.patch<Membership>(
            `/api/v1/brands/${brandId}/memberships/${membershipId}`,
            payload
        );
        return response.data;
    },

    /**
     * Revokes a user's access to the brand.
     * @param brandId The ID of the brand
     * @param membershipId The ID of the membership to remove
     */
    async removeMember(brandId: string, membershipId: string): Promise<void> {
        await apiClient.delete(
            `/api/v1/brands/${brandId}/memberships/${membershipId}`
        );
    },
};