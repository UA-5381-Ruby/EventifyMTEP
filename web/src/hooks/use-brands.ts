import { useState, useEffect, useCallback } from 'react';
import { brandsService } from '@/services/brands-service';
import type { Brand } from '@/types/brand';

interface UseBrandsResult {
  brands: Brand[];
  total: number | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

interface BrandQueryParams {
  page: number;
  per_page: number;
  sort?: string;
  q?: string;
}

interface BrandWithCount extends Brand {
  events_count?: number;
}

export function useBrands(params: BrandQueryParams): UseBrandsResult {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let isMounted = true;

    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await brandsService.getAllBrands();

        if (!isMounted) return;

        let result = [...data];

        if (params.q) {
          const q = params.q.toLowerCase();
          result = result.filter(
            (b) =>
              b.name.toLowerCase().includes(q) ||
              b.subdomain.toLowerCase().includes(q) ||
              (b.description || '').toLowerCase().includes(q)
          );
        }

        if (params.sort === 'name') {
          result.sort((a, b) => a.name.localeCompare(b.name));
        } else if (params.sort === 'events_count') {
          result.sort(
            (a, b) =>
              ((b as BrandWithCount).events_count ?? 0) - ((a as BrandWithCount).events_count ?? 0)
          );
        }
        setTotal(result.length);

        const start = (params.page - 1) * params.per_page;
        setBrands(result.slice(start, start + params.per_page));
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
  }, [params.page, params.per_page, params.sort, params.q, tick]);

  return { brands, total, isLoading, error, refetch };
}
