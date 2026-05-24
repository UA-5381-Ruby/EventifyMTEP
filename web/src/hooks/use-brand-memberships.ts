import { useState, useCallback } from 'react';
import axios from 'axios';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { Membership, UserRole, PaginationParams } from '@/types/brand-memberships';

export function useBrandMemberships(brandId: string | number) {
  const [members, setMembers] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchMembers = useCallback(
    async (params: PaginationParams = { page: 1, per_page: 10 }) => {
      setIsLoading(true);
      try {
        const response = await BrandMembershipsService.getBrandMemberships(
          brandId.toString(),
          params
        );
        setMembers(response.data);
        setTotalCount(response.meta.total_count);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || 'Failed to fetch members');
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [brandId]
  );

  const addMember = async (email: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const newMember = await BrandMembershipsService.addBrandMember(brandId.toString(), {
        user_id: email,
        role,
      });

      setMembers((prev) => [...prev, newMember]);
      setTotalCount((prev) => prev + 1);
      return newMember;
    } catch (err: unknown) {
      let message = 'An unexpected error occurred';

      if (axios.isAxiosError(err)) {
        const apiError = err.response?.data?.errors;

        if (err.response?.status === 404) {
          message = `User with email "${email}" not found in the system.`;
        } else if (apiError) {
          message =
            typeof apiError === 'object'
              ? Object.entries(apiError as Record<string, string[]>)
                  .map(([key, val]) => `${key} ${val}`)
                  .join(', ')
              : String(apiError);
        }
      } else if (err instanceof Error) {
        message = err.message;
      }

      setError(message);
      throw new Error(message, { cause: err });
    } finally {
      setIsLoading(false);
    }
  };

  return { members, isLoading, error, totalCount, fetchMembers, addMember, setError };
}
