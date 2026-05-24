import { Card, Pagination } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { EventFilters } from '@/components/events/event-filters';
import { EventGrid } from '@/components/events/event-grid';
import { BrandDashboardHeader } from '@/components/brands/brand-dashboard-header';
import { BrandStatCard } from '@/components/brands/brand-stat-card';
import { BrandColorPalette } from '@/components/brands/brand-color-palette';
import { useEventFilters } from '@/hooks/use-event-filters';
import { ACTIVE_STATUSES, ITEMS_PER_PAGE, PENDING_STATUSES } from '@/constants/brand.constants';
import type { BrandWithEvents } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';

interface BrandViewProps {
  brand: BrandWithEvents;
  memberships: Membership[];
  membershipsLoading: boolean;
  canManage: boolean;
  onEdit: () => void;
  extraActions?: React.ReactNode;
}

export function BrandView({
                            brand,
                            memberships,
                            membershipsLoading,
                            canManage,
                            onEdit,
                            extraActions,
                          }: BrandViewProps) {
  const filters = useEventFilters({
    events: brand.events,
    itemsPerPage: ITEMS_PER_PAGE,
  });

  const activeCount = brand.events.filter((e) =>
    ACTIVE_STATUSES.has((e.status || '').toLowerCase())
  ).length;
  const pendingReviewCount = brand.events.filter((e) =>
    PENDING_STATUSES.includes((e.status || '').toLowerCase())
  ).length;
  const primaryColor = brand.primary_color || '#6366f1';
  const secondaryColor = brand.secondary_color || '#a855f7';
  const ownerName = memberships.find((m) => m.role === 'owner')?.user.name;

  return (
    <PageWrapper>
      <Container className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-[0.05] transition-all duration-700"
          style={{ background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
        />

        <main className="relative z-10 py-10 pb-24 max-w-6xl mx-auto space-y-10">
          <BrandDashboardHeader
            brand={brand}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onEdit={onEdit}
            canEdit={canManage}
          />

          <Card
            variant="bordered"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden bg-white divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 p-0 rounded-2xl shadow-sm"
          >
            <BrandStatCard
              label="Total Events"
              value={String(brand.events.length)}
              sub={`${activeCount} active`}
              subVariant={activeCount > 0 ? 'green' : 'neutral'}
            />
            <BrandStatCard
              label="Active Events"
              value={String(activeCount)}
              sub={activeCount > 0 ? 'Live now' : 'None live'}
              subVariant={activeCount > 0 ? 'green' : 'neutral'}
            />
            <BrandStatCard
              label="Team Members"
              value={membershipsLoading ? '—' : String(memberships.length)}
              sub={ownerName ? `Owner: ${ownerName}` : 'No owner assigned'}
              isLoading={membershipsLoading}
            />
            <BrandStatCard
              label="Pending Review"
              value={String(pendingReviewCount)}
              sub={pendingReviewCount > 0 ? 'Needs attention' : 'All clear'}
              subVariant={pendingReviewCount > 0 ? 'amber' : 'neutral'}
            />
          </Card>

          <Card variant="bordered" className="overflow-hidden bg-white p-0 rounded-2xl shadow-sm">
            <BrandColorPalette
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              primaryRaw={brand.primary_color}
              secondaryRaw={brand.secondary_color}
            />
          </Card>

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-neutral-800">Events</h4>
              {extraActions}
            </div>
            <EventFilters
              search={filters.search}
              status={filters.status}
              sort={filters.sort}
              pendingCount={pendingReviewCount}
              onSearchChange={filters.handleSearchChange}
              onStatusChange={filters.handleStatusChange}
              onSortChange={filters.handleSortChange}
            />
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
