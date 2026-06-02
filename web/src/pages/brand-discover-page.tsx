import { useState } from 'react';
import { PageWrapper, Container } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { BrandPageHeader } from '@/components/brands/brand-page-header';
import { BrandFilters } from '@/components/brands/brand-filters';
import { BrandGrid } from '@/components/brands/brand-grid';
import { useBrands } from '@/hooks/use-brands';
import { PER_PAGE } from '@/constants/ui.constants';

export function BrandDiscoverPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);

  const { brands, total, isLoading, error, refetch } = useBrands({
    page,
    per_page: PER_PAGE,
    sort,
    scope: 'discover',
    ...(search.trim() ? { q: search.trim() } : {}),
  });

  const totalPages = total != null ? Math.ceil(total / PER_PAGE) : 1;

  function resetPage() {
    setPage(1);
  }

  function clearFilters() {
    setSearch('');
    setPage(1);
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-neutral-50">
        <BrandPageHeader
          total={total}
          isLoading={isLoading}
          search={search}
          onRemoveSearch={() => {
            setSearch('');
            resetPage();
          }}
        />

        <Container>
          <div className="py-8">
            <BrandFilters
              search={search}
              sort={sort}
              onSearchChange={(e) => {
                setSearch(e.target.value);
                resetPage();
              }}
              onSortChange={(e) => {
                setSort(e.target.value);
                resetPage();
              }}
            />

            <BrandGrid
              brands={brands}
              isLoading={isLoading}
              error={error}
              hasActiveFilters={!!search}
              onRetry={refetch}
              onClearFilters={clearFilters}
            />

            {!isLoading && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </div>
        </Container>
      </div>
    </PageWrapper>
  );
}
