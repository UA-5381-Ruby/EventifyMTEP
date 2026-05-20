import { Button } from '@/components/ui';

function buildPages(total: number, current: number): (number | 'gap')[] {
  return Array.from({ length: total }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === total || Math.abs(p - current) <= 1)
    .reduce<(number | 'gap')[]>((acc, p, i, arr) => {
      if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push('gap');
      acc.push(p);
      return acc;
    }, []);
}

interface EventPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function EventPagination({ page, totalPages, onPageChange }: EventPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(totalPages, page);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        ← Prev
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === 'gap' ? (
            <span key={`gap-${i}`} className="px-1 text-neutral-300 text-sm">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={[
                'w-8 h-8 rounded-md text-sm font-medium transition-colors',
                p === page ? 'bg-primary-500 text-white' : 'text-neutral-600 hover:bg-neutral-100',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next →
      </Button>
    </div>
  );
}
