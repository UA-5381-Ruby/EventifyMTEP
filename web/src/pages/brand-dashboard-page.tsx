import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Button, Input, Textarea, Card, Alert, Spinner, Modal, Pagination } from '@/components/ui';
import { Container, PageWrapper } from '@/components/layout';
import { EventGrid } from '@/components/events/event-grid';
import { EventFilters } from '@/components/events/event-filters';
import { useEventFilters } from '@/hooks/use-event-filters';

import { brandsService } from '@/services/brands-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import type { BrandWithEvents, BrandEvent } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';

const ITEMS_PER_PAGE = 6;
const ACTIVE_STATUSES = new Set(['published', 'published_unverified', 'published_on_review']);

function deriveBrandStats(events: BrandEvent[]) {
  const activeCount = events.filter((e) =>
    ACTIVE_STATUSES.has((e.status || '').toLowerCase())
  ).length;

  const pendingReviewCount = events.filter((e) =>
    ['draft_on_review', 'published_on_review'].includes((e.status || '').toLowerCase())
  ).length;

  return { activeCount, pendingReviewCount };
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subVariant?: 'green' | 'amber' | 'neutral';
  isLoading?: boolean;
}

function StatCard({ label, value, sub, subVariant = 'neutral', isLoading = false }: StatCardProps) {
  const subColor = {
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100/50',
    amber: 'text-amber-600 bg-amber-50 border-amber-100/50',
    neutral: 'text-neutral-500 bg-neutral-50 border-neutral-100/80',
  }[subVariant];

  return (
    <div className="flex flex-col justify-between gap-3 px-6 py-5 transition-colors duration-200 hover:bg-neutral-50/40">
      <div className="space-y-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
          {label}
        </span>
        <div className="flex items-center h-8">
          {isLoading ? (
            <div className="h-5 w-12 rounded-md bg-neutral-100 animate-pulse" />
          ) : (
            <span className="text-2xl font-bold text-neutral-900 tracking-tight truncate block">
              {value}
            </span>
          )}
        </div>
      </div>
      <div>
        <span
          className={`inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-md border ${subColor}`}
        >
          {sub}
        </span>
      </div>
    </div>
  );
}

interface BrandColorPaletteProps {
  primaryColor: string;
  secondaryColor: string;
  primaryRaw?: string;
  secondaryRaw?: string;
}

function BrandColorPalette({
  primaryColor,
  secondaryColor,
  primaryRaw,
  secondaryRaw,
}: BrandColorPaletteProps) {
  const colorChip = (color: string, hex: string | undefined, label: string) => (
    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-neutral-50/80 border border-neutral-200/50 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <span
        className="w-3.5 h-3.5 rounded-md border border-neutral-950/10 shrink-0 shadow-sm"
        style={{ backgroundColor: color }}
      />
      <span className="text-xs font-mono font-bold text-neutral-700 uppercase tracking-tight">
        {hex || '—'}
      </span>
      <span className="text-[10px] text-neutral-400 font-sans border-l border-neutral-200 pl-2 ml-0.5">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col justify-between gap-4 px-6 py-5 transition-colors duration-200 hover:bg-neutral-50/40">
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">
          Brand Palette
        </span>
        <div className="flex flex-wrap items-center gap-2 h-auto sm:h-8">
          {colorChip(primaryColor, primaryRaw, 'Primary')}
          <span className="text-neutral-300 text-xs hidden sm:inline">·</span>
          {colorChip(secondaryColor, secondaryRaw, 'Secondary')}
        </div>
      </div>
    </div>
  );
}

interface BrandEditModalProps {
  isOpen: boolean;
  name: string;
  description: string;
  onClose: () => void;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSave: () => void;
}

function BrandEditModal({
  isOpen,
  name,
  description,
  onClose,
  onNameChange,
  onDescriptionChange,
  onSave,
}: BrandEditModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit brand settings"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-normal">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} className="text-xs font-medium">
            Save changes
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <Input label="Brand name" value={name} onChange={onNameChange} className="text-sm" />
        <Textarea
          label="Description"
          rows={4}
          value={description}
          onChange={onDescriptionChange}
          className="text-sm resize-none"
        />
      </div>
    </Modal>
  );
}

export function BrandProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [brand, setBrand] = useState<BrandWithEvents | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [membershipsLoading, setMembershipsLoading] = useState(true);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  const filters = useEventFilters({
    events: brand?.events ?? [],
    itemsPerPage: ITEMS_PER_PAGE,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAll = async () => {
      if (!id) {
        setError('Missing brand ID');
        setIsLoading(false);
        return;
      }

      const brandId = Number(id);

      const [brandResult, membershipsResult] = await Promise.allSettled([
        brandsService.getBrandById(brandId),
        BrandMembershipsService.getBrandMemberships(brandId, {}),
      ]);

      if (!isMounted) return;

      if (brandResult.status === 'fulfilled') {
        setBrand(brandResult.value);
        setEditName(brandResult.value.name);
        setEditDesc(brandResult.value.description || '');
      } else {
        setError('Brand not found.');
      }

      if (membershipsResult.status === 'fulfilled') {
        setMemberships(membershipsResult.value.data);
      }

      setIsLoading(false);
      setMembershipsLoading(false);
    };

    fetchAll();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
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

  const { activeCount, pendingReviewCount } = deriveBrandStats(brand.events);
  const primaryColor = brand.primary_color || '#6366f1';
  const secondaryColor = brand.secondary_color || '#a855f7';
  const ownerName = memberships.find((m) => m.role === 'owner')?.user.name;

  const handleSave = async () => {
    try {
      const updated = await brandsService.updateBrand(brand.id, {
        name: editName,
        description: editDesc,
      });
      setBrand((prev) => (prev ? { ...prev, ...updated } : null));
      setIsEditOpen(false);
    } catch {
      alert('Update failed.');
    }
  };

  return (
    <PageWrapper>
      <Container className="relative overflow-hidden">
        <div
          className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none opacity-[0.05] transition-all duration-700"
          style={{
            background: `radial-gradient(circle, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        />

        <main className="relative z-10 py-10 pb-24 max-w-6xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 pb-6 border-b border-neutral-100/80">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/brands')}
                aria-label="Go back"
                className="mt-1 h-8 w-8 p-0 flex items-center justify-center rounded-xl border border-neutral-200/40 bg-white shadow-sm hover:bg-neutral-50"
              >
                <svg
                  className="w-4 h-4 text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </Button>

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
                  className="w-16 h-16 rounded-2xl text-white font-bold text-2xl flex items-center justify-center shrink-0 tracking-wider shadow-sm"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                  }}
                >
                  {brand.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0 space-y-1">
                <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">{brand.name}</h1>

                <a
                  href={`https://${brand.subdomain}.eventify.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 inline-flex items-center gap-1.5 transition-colors"
                >
                  <svg
                    className="w-3.5 h-3.5 stroke-primary-500 shrink-0"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                  </svg>
                  {brand.subdomain}.eventify.com
                </a>

                {brand.description && (
                  <p className="text-sm text-neutral-500 leading-relaxed max-w-2xl pt-1">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditOpen(true)}
              className="font-medium border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 shadow-sm rounded-xl px-4"
            >
              Edit brand settings
            </Button>
          </div>

          <Card
            variant="bordered"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 overflow-hidden bg-white divide-y lg:divide-y-0 lg:divide-x divide-neutral-100 p-0 rounded-2xl shadow-sm"
          >
            <StatCard
              label="Total Events"
              value={String(brand.events.length)}
              sub={`${activeCount} active`}
              subVariant={activeCount > 0 ? 'green' : 'neutral'}
            />
            <StatCard
              label="Active Events"
              value={String(activeCount)}
              sub={activeCount > 0 ? 'Live now' : 'None live'}
              subVariant={activeCount > 0 ? 'green' : 'neutral'}
            />
            <StatCard
              label="Team Members"
              value={membershipsLoading ? '—' : String(memberships.length)}
              sub={ownerName ? `Owner: ${ownerName}` : 'No owner assigned'}
              isLoading={membershipsLoading}
            />
            <StatCard
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
            <h2 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">Events</h2>

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

      <BrandEditModal
        isOpen={isEditOpen}
        name={editName}
        description={editDesc}
        onClose={() => setIsEditOpen(false)}
        onNameChange={(e) => setEditName(e.target.value)}
        onDescriptionChange={(e) => setEditDesc(e.target.value)}
        onSave={handleSave}
      />
    </PageWrapper>
  );
}
