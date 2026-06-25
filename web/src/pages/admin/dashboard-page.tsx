import { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import type { Brand } from '@/types/brand';
import type { Event } from '@/types/event';
import { EventsService } from '@/services/events-service';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import { useBrandAccess } from '@/hooks/use-brand-access';
import { InviteMemberModal } from '@/components/admin/modals/invite-member-modal';
import { Button } from '@/components/ui';

import { StatCard, SectionHeader } from '../../components/admin/shared';
import { EventsTable } from '../../components/admin/event/events-table';
import { TeamList } from '../../components/admin/team-list';
import type {Membership} from "@/types/brand-memberships";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { brand } = useOutletContext<{ brand: Brand }>();

  const [events, setEvents] = useState<Event[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [eventStats, setEventStats] = useState({ total: 0, pending: 0 });
  const [teamMembers, setTeamMembers] = useState<Membership[]>([]);
  const [membersCount, setMembersCount] = useState(0);

  const { canManage } = useBrandAccess(String(brand.id));

  const previewMembers = teamMembers.slice(0, 3);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [recentEventsRes, allEventsStatsRes, membersRes] = await Promise.all([
          EventsService.getEvents({ brand_id: brand.id, per_page: 3 }),
          EventsService.getEvents({ brand_id: brand.id }),
          BrandMembershipsService.getBrandMemberships(brand.id, { per_page: 3 }),
        ]);

        if (!isMounted) return;

        setEvents(recentEventsRes?.data || []);

        setEventStats({
          total: allEventsStatsRes?.meta?.total || allEventsStatsRes?.data?.length || 0,
          pending: (allEventsStatsRes?.data || []).filter((e) => e.status === 'draft_on_review')
            .length,
        });

        setTeamMembers(membersRes?.data || []);
        setMembersCount(membersRes?.meta?.total_count ?? membersRes?.data?.length ?? 0);
      } catch (error) {
        console.error('Dashboard load error:', error);
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [brand.id]);

  return (
    <div className="max-w-(--breakpoint-xl) mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 space-y-12">
      <div className="flex justify-between items-end pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-black">{brand.name}</h1>
          <p className="text-neutral-500 font-medium">{brand.subdomain}.eventify.com</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/settings')}
          className="bg-black text-white rounded-none px-10 py-6 hover:bg-neutral-800 transition-all active:scale-95 border-none shadow-none"
        >
          Edit Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total events" value={eventStats.total} />
        <StatCard label="Pending Review" value={eventStats.pending} />
        <StatCard label="Team Members" value={membersCount} />
      </div>

      <section className="space-y-6">
        <SectionHeader title="Recent Events" linkTo="/dashboard/events" linkLabel="View All" />
        <EventsTable events={events} canManage={canManage} />
      </section>

      <section className="space-y-6 pb-20">
        <SectionHeader
          title="Team Preview"
          linkTo="/dashboard/members"
          linkLabel="Manage Members"
        />
        <div className="border border-neutral-200 p-8 bg-white relative min-h-[200px]">
          {canManage && (
            <div className="absolute top-8 right-8 z-10">
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="border border-neutral-400 px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-white hover:bg-black hover:text-white transition-all cursor-pointer active:scale-95"
              >
                Add Member
              </button>
            </div>
          )}
          <TeamList members={previewMembers} />
        </div>
      </section>

      <InviteMemberModal
        brandId={brand.id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
};
