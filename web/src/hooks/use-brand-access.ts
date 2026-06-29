import { useBrand } from '@/contexts/brand-context';

export function useBrandAccess(id: string | undefined) {
  const { memberships: myMemberships, isLoading } = useBrand();
  const brandId = id && !Number.isNaN(Number(id)) ? Number(id) : null;

  const currentUserMembership = myMemberships.find((m) => m.brand_id === brandId);
  const canManage =
    currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'manager';

  return { canManage, isLoading };
}
