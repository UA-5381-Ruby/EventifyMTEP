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

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page: currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPages(totalPages, currentPage);

  return (
    <div className="flex items-center justify-center gap-1 pt-6 border-t border-neutral-100/60">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="h-8 w-8 p-0 flex items-center justify-center text-neutral-400"
        aria-label="Previous page"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Button>

      {pages.map((p, index) => {
        if (p === 'gap') {
          return (
            <span
              key={`gap-${index}`}
              className="h-8 w-8 flex items-center justify-center text-xs text-neutral-400 select-none"
            >
              &hellip;
            </span>
          );
        }

        const isCurrent = p === currentPage;

        return (
          <Button
            key={p}
            size="sm"
            variant={isCurrent ? 'outline' : 'ghost'}
            onClick={() => onPageChange(p)}
            className={`h-8 w-8 p-0 text-xs font-medium rounded-lg transition-all duration-200 ${
              !isCurrent ? 'text-neutral-400 hover:text-neutral-800 hover:bg-neutral-50' : ''
            }`}
          >
            {p}
          </Button>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="h-8 w-8 p-0 flex items-center justify-center text-neutral-400"
        aria-label="Next page"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
}
