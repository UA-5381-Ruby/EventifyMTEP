import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Pagination } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { EventGrid } from '@/components/events/event-grid';
import { SearchInput, Select } from '@/components/ui';
import { BrandHeader } from '@/components/brands/brand-header';
import { useAuth } from '@/hooks/use-auth';
import { useBrandPublic } from '@/hooks/use-brand-public';
import { useBrandAccess } from '@/hooks/use-brand-access';
import { useEventFilters } from '@/hooks/use-event-filters';
import { SORT_OPTIONS } from '@/constants/event.constants';
import { ACTIVE_STATUSES, ITEMS_PER_PAGE } from '@/constants/brand.constants';

export function BrandPublicPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { brand, isLoading, error } = useBrandPublic(id);
  const { canManage, isLoading: accessLoading } = useBrandAccess(id, user?.id);

  const activeEvents = (brand?.events ?? []).filter((e) =>
    ACTIVE_STATUSES.has((e.status || '').toLowerCase())
  );

  const filters = useEventFilters({
    events: activeEvents,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    if (!accessLoading && !isLoading && canManage) {
      navigate(`/dashboard/brands/${id}`, { replace: true });
    }
  }, [accessLoading, canManage, isLoading, id, navigate]);

  if (isLoading || accessLoading || canManage) {
    return (
      <PageWrapper>
        <div className="flex h-96 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  if (error || !brand) {
    return (
      <PageWrapper>
        <Container className="py-12">
          <Alert variant="error" title="Error">
            {error ?? 'Brand does not exist.'}
          </Alert>
        </Container>
      </PageWrapper>
    );
  }

  const primaryColor = brand.primary_color || '#6366f1';
  const secondaryColor = brand.secondary_color || '#a855f7';

  return (
    <PageWrapper>
      <Container className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-[0.05]"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        />

        <main className="relative z-10 py-10 pb-24 max-w-6xl mx-auto space-y-10">
          <BrandHeader
            name={brand.name}
            subdomain={brand.subdomain}
            description={brand.description}
            logoUrl={brand.logo_url}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-800">
                Events
                {activeEvents.length > 0 && (
                  <span className="ml-2 text-xs font-medium text-neutral-400">
                    {activeEvents.length} active
                  </span>
                )}
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SearchInput
                placeholder="Search events…"
                value={filters.search}
                onChange={filters.handleSearchChange}
              />
              <Select
                options={SORT_OPTIONS}
                value={filters.sort}
                onChange={filters.handleSortChange}
              />
            </div>

            <EventGrid
              events={filters.paginated}
              isLoading={false}
              error={null}
              hasActiveFilters={filters.hasActiveFilters}
              onRetry={() => {}}
              onClearFilters={filters.clearFilters}
            />

            {filters.totalPages > 1 && (
              <Pagination
                page={filters.page}
                totalPages={filters.totalPages}
                onPageChange={filters.setPage}
              />
            )}
          </section>
        </main>
      </Container>
    </PageWrapper>
  );
}
