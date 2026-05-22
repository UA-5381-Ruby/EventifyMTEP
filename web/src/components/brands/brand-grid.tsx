import { Alert, Button, Spinner } from '@/components/ui';
import { BrandCard } from './brand-card';
import type { Brand } from '@/types/brand';

interface BrandGridProps {
  brands: Brand[];
  isLoading: boolean;
  error: string | null;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onClearFilters: () => void;
}

export function BrandGrid({
  brands,
  isLoading,
  error,
  hasActiveFilters,
  onRetry,
  onClearFilters,
}: BrandGridProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="error" title="Failed to load brands" className="my-4">
        <div className="flex items-center justify-between gap-4 mt-2">
          <span className="text-sm">{error}</span>
          <Button variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      </Alert>
    );
  }

  if (brands.length === 0) {
    return (
      <div className="py-20 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/30">
        <p className="text-xs text-neutral-400 font-light tracking-wide">
          {hasActiveFilters ? 'No brands match your search.' : 'No brands yet.'}
        </p>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="mt-3 text-xs text-neutral-500"
          >
            Clear filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {brands.map((brand) => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  );
}
