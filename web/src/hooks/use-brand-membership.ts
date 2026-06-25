import { useBrand } from '@/contexts/brand-context';

export const useBrandMembership = (targetBrandId?: string) => {
  const { memberships, isLoading } = useBrand();

  const isAnyBrandManager = memberships.some((m) => m.role === 'owner' || m.role === 'manager');
  const isCurrentBrandManager = targetBrandId
    ? memberships.some(
        (m) => m.brand_id === Number(targetBrandId) && (m.role === 'owner' || m.role === 'manager')
      )
    : false;

  return { memberships, isLoading, isAnyBrandManager, isCurrentBrandManager };
};
