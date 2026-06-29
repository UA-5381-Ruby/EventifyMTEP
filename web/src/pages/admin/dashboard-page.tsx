import { useOutletContext } from 'react-router-dom';
import type { Brand } from '@/types/brand';
import { useBrandAccess } from '@/hooks/use-brand-access';
import { StatCard, SectionHeader } from '../../components/admin/shared';
import { EventsTable } from '../../components/admin/event/events-table';

import { useDashboardData } from '@/hooks/use-dashboard-data.ts';
import { BrandHeader } from '../../components/admin/brand/brand-header.tsx';
import { TeamSection } from '../../components/admin/brand/team-section.tsx';

export const DashboardPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const { canManage } = useBrandAccess(String(brand.id));

  const { events, eventStats, teamMembers, membersCount } = useDashboardData(brand.id);
  const previewMembers = teamMembers.slice(0, 3);

  return (
    <div className="max-w-(--breakpoint-xl) mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 space-y-12">
      <BrandHeader brand={brand} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total events" value={eventStats.total} />
        <StatCard label="Pending Review" value={eventStats.pending} />
        <StatCard label="Team Members" value={membersCount} />
      </div>

      <section className="space-y-6">
        <SectionHeader title="Recent Events" linkTo="/dashboard/events" linkLabel="View All" />
        <EventsTable events={events} canManage={canManage} />
      </section>

      <TeamSection brandId={brand.id} members={previewMembers} canManage={canManage} />
    </div>
  );
};
