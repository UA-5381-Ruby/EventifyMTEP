import React, { useState, useEffect, useCallback } from 'react';
import { brandsService } from '@/services/brands-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { Brand } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';
import { useAuth } from '@/hooks/use-auth';
import { BrandContext } from './brand-context';

const fetchManagedBrands = async (): Promise<Brand[]> => {
  const response = await brandsService.getBrands({ scope: 'managed' });
  return response.data;
};

type BrandState = {
  brand: Brand | null;
  memberships: Membership[];
  isLoading: boolean;
};

const LOADING_STATE: BrandState = { brand: null, memberships: [], isLoading: true };
const EMPTY_STATE: BrandState = { brand: null, memberships: [], isLoading: false };

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [state, setState] = useState<BrandState>(LOADING_STATE);

  const loadData = useCallback(async (userId: number, brandId?: number) => {
    const run = async () => {
      setState(LOADING_STATE);
      try {
        const [brands, userMemberships] = await Promise.all([
          fetchManagedBrands(),
          BrandMembershipsService.getUserMemberships(userId),
        ]);

        const targetBrand =
          brands.length > 0
            ? brandId
              ? (brands.find((b: Brand) => b.id === brandId) ?? brands[0])
              : brands[0]
            : null;

        setState({ brand: targetBrand, memberships: userMemberships, isLoading: false });
      } catch (error) {
        console.error('Error fetching brand data:', error);
        setState(EMPTY_STATE);
      }
    };
    await run();
  }, []);

  useEffect(() => {
    if (isAuthLoading) return;

    const userId = user?.id;
    if (!userId) {
      void (async () => setState(EMPTY_STATE))();
      return;
    }

    void loadData(userId);
  }, [isAuthLoading, user, loadData]);

  const refreshBrand = useCallback(
    async (brandId?: number) => {
      const userId = user?.id;
      if (userId) await loadData(userId, brandId);
    },
    [user, loadData]
  );

  return (
    <BrandContext.Provider
      value={{
        brand: state.brand,
        hasBrand: !!state.brand,
        memberships: state.memberships,
        isLoading: state.isLoading,
        refreshBrand,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
}
