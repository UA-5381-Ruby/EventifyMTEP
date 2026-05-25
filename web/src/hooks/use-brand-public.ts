import { useState, useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import type { BrandWithEvents } from '@/types/brand';

interface UseBrandPublicResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
}

export function useBrandPublic(id: string | undefined): UseBrandPublicResult {
  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(id ? null : 'Missing brand ID');

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    brandsService
      .getBrandById(Number(id))
      .then((data) => {
        if (isMounted) setBrand(data);
      })
      .catch(() => {
        if (isMounted) setError('Brand not found.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  return { brand, isLoading, error };
}
