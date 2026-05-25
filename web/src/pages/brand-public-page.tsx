import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Spinner, Pagination } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { EventGrid } from '@/components/events/event-grid';
import { SearchInput, Select } from '@/components/ui';
import { useAuth } from '@/hooks/use-auth';
import { useBrandPublic } from '@/hooks/use-brand-public';
import { useBrandDashboard } from '@/hooks/use-brand-dashboard';
import { SORT_OPTIONS } from '@/constants/event.constants';
import { ACTIVE_STATUSES } from '@/constants/brand.constants';

const PER_PAGE = 9;

export function BrandPublicPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { brand, isLoading, error } = useBrandPublic(id);

  const { memberships, membershipsLoading } = useBrandDashboard(id);
  const currentUserMembership = memberships.find((m) => m.user.id === user?.id);
  const canManage =
    currentUserMembership?.role === 'owner' || currentUserMembership?.role === 'manager';

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('created_at');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!membershipsLoading && !isLoading && canManage) {
      navigate(`/dashboard/brands/${id}`, { replace: true });
    }
  }, [membershipsLoading, canManage, isLoading, id, navigate]);

  const activeEvents = useMemo(
    () => (brand?.events ?? []).filter((e) => ACTIVE_STATUSES.has(e.status)),
    [brand]
  );

  const filteredEvents = useMemo(() => {
    let result = [...activeEvents];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((e) => e.title.toLowerCase().includes(q));
    }

    if (sort === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'start_date') {
      result.sort((a, b) => {
        const dateA = a.start_date ? new Date(a.start_date).getTime() : 0;
        const dateB = b.start_date ? new Date(b.start_date).getTime() : 0;
        return dateA - dateB;
      });
    }

    return result;
  }, [activeEvents, search, sort]);

  const totalPages = Math.ceil(filteredEvents.length / PER_PAGE) || 1;
  const paginated = filteredEvents.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  if (isLoading || membershipsLoading || canManage) {
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
          <div className="flex items-start gap-4 pb-6 border-b border-neutral-100/80">
            {brand.logo_url ? (
              <div className="p-0.5 rounded-2xl bg-white border border-neutral-100 shadow-sm shrink-0">
                <img
                  src={brand.logo_url}
                  alt={brand.name}
                  className="w-16 h-16 rounded-[14px] object-cover"
                />
              </div>
            ) : (
              <div
                className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shrink-0 shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                {brand.name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 space-y-1">
              <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{brand.name}</h1>

              <a
                href={`https://${brand.subdomain}.eventify.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-colors"
              >
                {brand.subdomain}.eventify.com
              </a>

              {brand.description && (
                <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl pt-1">
                  {brand.description}
                </p>
              )}
            </div>
          </div>

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
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
              <Select
                options={SORT_OPTIONS}
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <EventGrid
              events={paginated}
              isLoading={false}
              error={null}
              hasActiveFilters={!!search.trim()}
              onRetry={() => {}}
              onClearFilters={() => {
                setSearch('');
                setPage(1);
              }}
            />

            {totalPages > 1 && (
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            )}
          </section>
        </main>
      </Container>
    </PageWrapper>
  );
}
