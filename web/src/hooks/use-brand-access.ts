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
  const brandId = id && !Number.isNaN(Number(id)) ? Number(id) : null;

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(brandId !== null);

  useEffect(() => {
    if (brandId === null) return;
    let isMounted = true;

    BrandMembershipsService.getBrandMemberships(brandId, {})
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
  }, [brandId]);

  const currentUserMembership = memberships.find((m) => m.user.id === userId);
  const canManage =
    (currentUserMembership?.role as string) === 'owner' ||
    (currentUserMembership?.role as string) === 'manager';

  return { canManage, memberships, isLoading };
}
