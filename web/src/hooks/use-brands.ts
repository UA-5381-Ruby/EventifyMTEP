import { useState, useEffect, useCallback } from 'react';
import { brandsService } from '@/services/brands-service';
import type { Brand, BrandScope } from '@/types/brand';

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
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const { page, per_page, sort, q, scope } = params;

  const refetch = useCallback(() => setTick((t) => t + 1), []);

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
  }, [page, per_page, sort, q, scope, tick]);

  return { brands, total, isLoading, error, refetch };
}
