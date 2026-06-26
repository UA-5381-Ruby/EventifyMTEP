import { Container } from '@/components/layout';
import { Badge, Button } from '@/components/ui';

interface BrandPageHeaderProps {
  total: number | null;
  isLoading: boolean;
  search: string;
  onRemoveSearch: () => void;
  onCreateClick: () => void;
}

export function BrandPageHeader({
  total,
  isLoading,
  search,
  onRemoveSearch,
  onCreateClick,
}: BrandPageHeaderProps) {
  const subtitle = isLoading
    ? 'Loading…'
    : total !== null
      ? `${total} brand${total !== 1 ? 's' : ''} total`
      : '';

  return (
    <div className="bg-white border-b border-neutral-100">
      <Container>
        <div className="py-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Brands</h1>
            <p className="text-neutral-400 mt-1 text-sm">{subtitle}</p>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <Button onClick={onCreateClick} variant="primary" size="md">
              + Add new brand
            </Button>

            {search && (
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="inline-flex items-center gap-1.5 text-xs font-medium bg-primary-50 text-primary-700 border-primary-200 rounded-full px-3 py-1"
                >
                  Search: {search}
                  <button
                    onClick={onRemoveSearch}
                    className="text-primary-400 hover:text-primary-600 transition-colors ml-0.5 focus:outline-none"
                    aria-label="Remove search filter"
                  >
                    ✕
                  </button>
                </Badge>
              </div>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
