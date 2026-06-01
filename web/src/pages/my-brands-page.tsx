import React from 'react';
import { useState } from 'react';
import { PageWrapper, Container } from '@/components/layout';
import { Pagination, Tabs } from '@/components/ui';
import { BrandPageHeader } from '@/components/brands/brand-page-header';
import { BrandFilters } from '@/components/brands/brand-filters';
import { BrandGrid } from '@/components/brands/brand-grid';
import { useBrands } from '@/hooks/use-brands';
import { PER_PAGE } from '@/constants/ui.constants';
import { BRAND_TABS } from '@/constants/brand.constants';
import type { Tab } from '@/types/brand.ts';

export function MyBrandsPage() {
  const [tab, setTab] = useState<Tab>('managed');

  const [managedSearch, setManagedSearch] = useState('');
  const [managedSort, setManagedSort] = useState('created_at');
  const [managedPage, setManagedPage] = useState(1);

  const [subscribedSearch, setSubscribedSearch] = useState('');
  const [subscribedSort, setSubscribedSort] = useState('created_at');
  const [subscribedPage, setSubscribedPage] = useState(1);

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
    </PageWrapper>
  );
}
