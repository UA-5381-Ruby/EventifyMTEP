import React from 'react';
import { PageWrapper, Container } from '@/components/layout';
import { Pagination, Tabs } from '@/components/ui';
import { BrandPageHeader } from '@/components/brands/brand-page-header';
import { BrandFilters } from '@/components/brands/brand-filters';
import { BrandGrid } from '@/components/brands/brand-grid';
import { CreateBrandModal } from '@/components/brands/create-brand-modal';
import { useBrands } from '@/hooks/use-brands';
import { useCreateBrand } from '@/hooks/use-create-brand';
import { PER_PAGE } from '@/constants/ui.constants';
import { BRAND_TABS } from '@/constants/brand.constants';
import type { Tab } from '@/types/brand.ts';
import { useReduxState } from '@/hooks/use-redux-state';

export function MyBrandsPage() {
  const [tab, setTab] = useReduxState<Tab>('managed');

  const [managedSearch, setManagedSearch] = useReduxState('');
  const [managedSort, setManagedSort] = useReduxState('created_at');
  const [managedPage, setManagedPage] = useReduxState(1);

  const [subscribedSearch, setSubscribedSearch] = useReduxState('');
  const [subscribedSort, setSubscribedSort] = useReduxState('created_at');
  const [subscribedPage, setSubscribedPage] = useReduxState(1);

  const managed = useBrands({
    page: managedPage,
    per_page: PER_PAGE,
    sort: managedSort,
    scope: 'managed',
    ...(managedSearch.trim() ? { q: managedSearch.trim() } : {}),
  });

  const subscribed = useBrands({
    page: subscribedPage,
    per_page: PER_PAGE,
    sort: subscribedSort,
    scope: 'subscribed',
    ...(subscribedSearch.trim() ? { q: subscribedSearch.trim() } : {}),
  });

  const isManagedTab = tab === 'managed';

  const active = isManagedTab
    ? { search: managedSearch, sort: managedSort, page: managedPage, data: managed }
    : { search: subscribedSearch, sort: subscribedSort, page: subscribedPage, data: subscribed };

  const createBrand = useCreateBrand(() => {
    active.data.refetch();
  });

  const totalPages = active.data.total != null ? Math.ceil(active.data.total / PER_PAGE) : 1;

  function resetPage() {
    if (isManagedTab) {
      setManagedPage(1);
    } else {
      setSubscribedPage(1);
    }
  }

  function clearFilters() {
    if (isManagedTab) {
      setManagedSearch('');
      setManagedPage(1);
    } else {
      setSubscribedSearch('');
      setSubscribedPage(1);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (isManagedTab) {
      setManagedSearch(e.target.value);
    } else {
      setSubscribedSearch(e.target.value);
    }
    resetPage();
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (isManagedTab) {
      setManagedSort(e.target.value);
    } else {
      setSubscribedSort(e.target.value);
    }
    resetPage();
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-neutral-50">
        <BrandPageHeader
          total={active.data.total}
          isLoading={active.data.isLoading}
          search={active.search}
          onRemoveSearch={() => {
            if (isManagedTab) {
              setManagedSearch('');
            } else {
              setSubscribedSearch('');
            }
            resetPage();
          }}
          onCreateClick={createBrand.openModal}
        />

        <Container>
          <div className="py-8 space-y-6">
            <Tabs tabs={BRAND_TABS} activeValue={tab} onChange={(value) => setTab(value as Tab)} />

            <BrandFilters
              search={active.search}
              sort={active.sort}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
            />

            <BrandGrid
              brands={active.data.brands}
              isLoading={active.data.isLoading}
              error={active.data.error}
              hasActiveFilters={!!active.search}
              onRetry={active.data.refetch}
              onClearFilters={clearFilters}
            />

            {!active.data.isLoading && (
              <Pagination
                page={active.page}
                totalPages={totalPages}
                onPageChange={isManagedTab ? setManagedPage : setSubscribedPage}
              />
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
