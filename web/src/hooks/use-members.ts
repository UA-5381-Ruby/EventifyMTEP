import { useState, useEffect, useCallback } from 'react';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { Membership } from '@/types/brand-memberships';

export const useMembers = (brandId: number) => {
  const [brandMembers, setBrandMembers] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await BrandMembershipsService.getBrandMemberships(brandId, {
        page: 1,
        per_page: 15,
      });
      setBrandMembers(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadMembers();
  }, [loadMembers]);

  const removeMember = async (membershipId: number) => {
    setIsRemoving(true);
    setError(null);
    try {
      await BrandMembershipsService.removeMember(brandId, membershipId);
      setBrandMembers((prev) => prev.filter((m) => m.id !== membershipId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      return false;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    brandMembers,
    isLoading,
    error,
    setError,
    isRemoving,
    removeMember,
  };
};
