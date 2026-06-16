import { useState } from 'react';
import { PageWrapper, Container } from '@/components/layout';
import { Pagination } from '@/components/ui';
import { BrandPageHeader } from '@/components/brands/brand-page-header';
import { BrandFilters } from '@/components/brands/brand-filters';
import { BrandGrid } from '@/components/brands/brand-grid';
import { CreateBrandModal } from '@/components/brands/create-brand-modal';
import { useBrands } from '@/hooks/use-brands';
import { useCreateBrand } from '@/hooks/use-create-brand';
import { PER_PAGE } from '@/constants/ui.constants';

export function BrandListPage() {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);

  const params = {
    page,
    per_page: PER_PAGE,
    sort,
    ...(search.trim() ? { q: search.trim() } : {}),
  };

  const { brands, total, isLoading, error, refetch } = useBrands(params);

  const createBrand = useCreateBrand(() => {
    refetch();
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
          onCreateClick={createBrand.openModal}
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

      <CreateBrandModal
        isOpen={createBrand.isOpen}
        fields={createBrand.fields}
        isSaving={createBrand.isSaving}
        saveError={createBrand.saveError}
        onClose={createBrand.closeModal}
        onSave={createBrand.handleSave}
        onChange={createBrand.handleFieldChange}
      />
    </PageWrapper>
  );
}