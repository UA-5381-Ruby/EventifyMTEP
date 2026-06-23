import React, { useState, useEffect, useCallback } from 'react';
import { brandsService } from '@/services/brands-service';
import type { Brand } from '@/types/brand';
import { BrandContext } from './brand-context';

const fetchManagedBrands = async (): Promise<Brand[]> => {
  const response = await brandsService.getBrands({ scope: 'managed' });
  return response.data;
};

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBrand = useCallback(async (brandId?: number) => {
    setIsLoading(true);
    try {
      const brands = await fetchManagedBrands();
      if (brands && brands.length > 0) {
        const targetBrand = brandId
          ? brands.find((b: Brand) => b.id === brandId) || brands[0]
          : brands[0];
        setBrand(targetBrand);
      }
    } catch (error) {
      console.error('Error fetching user brands:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    async function initializeBrand() {
      try {
        const brands = await fetchManagedBrands();
        if (brands && brands.length > 0) {
          setBrand(brands[0]);
        }
      } catch (error) {
        console.error('Error fetching user brands:', error);
      } finally {
        setIsLoading(false);
      }
    }

    void initializeBrand();
  }, []);

  return (
    <BrandContext.Provider value={{ brand, hasBrand: !!brand, isLoading, refreshBrand }}>
      {children}
    </BrandContext.Provider>
  );
}
