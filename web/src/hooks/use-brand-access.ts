import { useState, useEffect } from 'react';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { Membership } from '@/types/brand-memberships';

interface UseBrandAccessResult {
  canManage: boolean;
  memberships: Membership[];
  isLoading: boolean;
}

export function useBrandAccess(
  id: string | undefined,
  userId: number | undefined
): UseBrandAccessResult {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    BrandMembershipsService.getBrandMemberships(Number(id), {})
      .then((data) => {
        if (isMounted) setMemberships(data.data);
      })
      .catch(() => {
        if (isMounted) setMemberships([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const currentUserMembership = memberships.find((m) => m.user.id === userId);
  const canManage =
    currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'manager';

  return { canManage, memberships, isLoading };
}
