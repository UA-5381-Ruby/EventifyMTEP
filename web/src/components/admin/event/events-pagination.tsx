interface EventsPaginationProps {
  currentCount: number;
  totalCount: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  perPage: number;
  onPageChange: (newPage: number | ((prev: number) => number)) => void;
}

export const EventsPagination = ({
  currentCount,
  totalCount,
  page,
  totalPages,
  isLoading,
  perPage,
  onPageChange,
}: EventsPaginationProps) => {
  return (
    <div className="p-4 px-8 border border-t-0 border-neutral-200 flex justify-between items-center bg-white text-[10px] font-black uppercase tracking-widest text-neutral-400">
      <span>
        Showing {currentCount} of {totalCount} events
      </span>
      <div className="flex gap-6">
        <button
          onClick={() => onPageChange((p) => Math.max(1, p - 1))}
          disabled={page === 1 || isLoading}
          className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors uppercase animate-none"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange((p) => p + 1)}
          disabled={page >= totalPages || currentCount < perPage || isLoading}
          className="hover:text-black cursor-pointer disabled:opacity-20 transition-colors uppercase animate-none"
        >
          Next
        </button>
      </div>
    </div>
  );
};
