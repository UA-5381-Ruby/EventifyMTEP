import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Membership } from '@/types/brand-memberships';
import { BrandMembershipsService } from '@/services/brand-memberships-service';

export const useBrandMembership = (targetBrandId?: string) => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(!!user?.id);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const loadMembershipsData = async () => {
      try {
        setIsLoading(true);
        const data = await BrandMembershipsService.getUserMemberships(user.id);
        setMemberships(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    loadMembershipsData();
  }, [user?.id]);
  const isAnyBrandManager = memberships.some((m) => m.role === 'admin' || m.role === 'owner');

  const isCurrentBrandManager = targetBrandId
    ? memberships.some(
        (m) => m.brand_id === Number(targetBrandId) && (m.role === 'admin' || m.role === 'owner')
      )
    : false;

  return {
    memberships,
    isLoading,
    error,
    isAnyBrandManager,
    isCurrentBrandManager,
  };
};
