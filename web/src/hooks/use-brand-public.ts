import { useEffect } from 'react';
import { brandsService } from '@/services/brands-service';
import type { BrandWithEvents } from '@/types/brand';
import { useReduxState } from '@/hooks/use-redux-state';

interface UseBrandPublicResult {
  brand: BrandWithEvents | null;
  isLoading: boolean;
  error: string | null;
}

export function useBrandPublic(id: string | undefined): UseBrandPublicResult {
  const [brand, setBrand] = useReduxState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useReduxState(!!id);
  const [error, setError] = useReduxState<string | null>(id ? null : 'Missing brand ID');

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
