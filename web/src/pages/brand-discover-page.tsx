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
import { useAuth } from '@/hooks/use-auth';
import apiClient from '@/lib/api-client';
import { DeleteBrandModal } from '@/components/ui/super-admin-modals';

export function BrandDiscoverPage() {
  const { user } = useAuth();
  const isSuperAdmin = Boolean(user?.is_superadmin);

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);
  const [isDeleting, setIsDeleting] = useState(false);

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    brandId: string | number;
    brandName: string;
  }>({
    isOpen: false,
    brandId: '',
    brandName: '',
  });

  const { brands, total, isLoading, error, refetch } = useBrands({
    page,
    per_page: PER_PAGE,
    sort,
    scope: 'discover',
    ...(search.trim() ? { q: search.trim() } : {}),
  });

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

  const openDeleteModal = (brandId: string | number, brandName: string) => {
    setDeleteModal({
      isOpen: true,
      brandId,
      brandName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      brandId: '',
      brandName: '',
    });
  };

  const confirmDeleteBrand = async () => {
    if (!deleteModal.brandId) return;
    console.log(
      'Повний URL запиту:',
      apiClient.defaults.baseURL + `/api/v1/brands/${deleteModal.brandId}`
    );
    try {
      setIsDeleting(true);
      await apiClient.delete(`/api/v1/brands/${deleteModal.brandId}`);

      closeDeleteModal();
      refetch();
    } catch (err) {
      console.error('Failed to delete brand:', err);
      alert('Could not delete brand. Please try again.');
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

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
          <div className="py-8 space-y-6">
            {isSuperAdmin && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg shadow-sm">
                <p className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Super Admin Mode
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  You have full access. You can manage brands directly from this list.
                </p>
              </div>
            )}

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
              isLoading={isLoading || isDeleting}
              error={error}
              hasActiveFilters={!!search}
              onRetry={refetch}
              onClearFilters={clearFilters}
              isSuperAdmin={isSuperAdmin}
              onDelete={isSuperAdmin ? openDeleteModal : undefined}
            />

            {!isLoading && totalPages > 1 && (
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
      <DeleteBrandModal
        isOpen={deleteModal.isOpen}
        brandName={deleteModal.brandName}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteBrand}
        isDeleting={isDeleting}
      />
    </PageWrapper>
  );
}
