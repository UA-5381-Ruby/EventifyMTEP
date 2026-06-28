import { useEffect, useCallback } from 'react';
import { brandsService } from '@/services/brands-service';
import type { Brand, BrandScope } from '@/types/brand';
import { useReduxState } from '@/hooks/use-redux-state';

interface BrandQueryParams {
  page: number;
  per_page: number;
  sort?: string;
  q?: string;
  scope?: BrandScope;
}

interface UseBrandsResult {
  brands: Brand[];
  total: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useBrands(params: BrandQueryParams): UseBrandsResult {
  const [brands, setBrands] = useReduxState<Brand[]>([]);
  const [total, setTotal] = useReduxState<number | null>(null);
  const [isLoading, setIsLoading] = useReduxState(true);
  const [error, setError] = useReduxState<string | null>(null);
  const [tick, setTick] = useReduxState(0);

  const { page, per_page, sort, q, scope } = params;

  const refetch = useCallback(() => setTick((t) => t + 1), [setTick]);

  useEffect(() => {
    let isMounted = true;

    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await brandsService.getBrands({
          page,
          per_page,
          sort,
          q,
          scope,
        });

        if (!isMounted) return;

        setBrands(response.data);
        setTotal(response.meta.total_count);
      } catch {
        if (isMounted) setError('Failed to load brands.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchBrands();

    return () => {
      isMounted = false;
    };
  }, [page, per_page, sort, q, scope, tick, setBrands, setError, setIsLoading, setTotal]);

  return { brands, total, isLoading, error, refetch };
}
