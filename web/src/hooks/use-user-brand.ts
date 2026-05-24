// hooks/use-user-brand.ts
import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import type { Brand } from '@/types/brand';

export function useUserBrand() {
  const [brand, setBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const brands = await brandsService.getUserBrands();
        if (brands && brands.length > 0) {
          setBrand(brands[0]);
        }
      } catch (error) {
        console.error('Error fetching user brands:', error);
      } finally {
        setIsLoading(false);
      }
    }
    checkAccess();
  }, []);

  return { brand, hasBrand: !!brand, isLoading };
}
