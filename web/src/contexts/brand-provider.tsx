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

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async (brandId?: number) => {
    if (!user?.id) {
      setBrand(null);
      setMemberships([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [brands, userMemberships] = await Promise.all([
        fetchManagedBrands(),
        BrandMembershipsService.getUserMemberships(user.id),
      ]);

      setMemberships(userMemberships);

      if (brands && brands.length > 0) {
        const targetBrand = brandId
          ? brands.find((b: Brand) => b.id === brandId) || brands[0]
          : brands[0];
        setBrand(targetBrand);
      } else {
        setBrand(null);
      }
    } catch (error) {
      console.error('Error fetching brand data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) return;
    void loadData();
  }, [isAuthLoading, loadData]);

  const refreshBrand = useCallback((brandId?: number) => loadData(brandId), [loadData]);

  return (
    <BrandContext.Provider value={{ brand, hasBrand: !!brand, memberships, isLoading, refreshBrand }}>
      {children}
    </BrandContext.Provider>
  );
}