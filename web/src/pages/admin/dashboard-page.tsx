import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import type { Brand } from '@/types/brand';
import type { Event } from '@/types/event';
import { EventsService } from '@/services/events-service';
import { useBrandMemberships } from '@/hooks/use-brand-memberships';
import { InviteMemberModal } from '@/pages/admin/invite-member-modal.tsx';
import { Button } from '@/components/ui';

export const DashboardPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [eventStats, setEventStats] = useState({ total: 0, pending: 0 });

  const {
    members,
    isLoading: isMembersLoading,
    error: membersError,
    addMember,
    fetchMembers,
    totalCount: membersCount,
  } = useBrandMemberships(brand.id);

  const userRole = 'owner';
  const canManage = userRole === 'owner' || userRole === 'manager';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const eventsRes = await EventsService.getEvents({ brand_id: brand.id, per_page: 3 });
        setEvents(eventsRes?.data || []);
        setEventStats({
          total: eventsRes?.meta?.total || 0,
          pending: (eventsRes?.data || []).filter((e) => e.status === 'draft_on_review').length,
        });

        await fetchMembers({ page: 1, per_page: 3 });
      } catch (error) {
        console.error('Dashboard load error:', error);
      }
    };

    loadDashboardData();
  }, [brand.id, fetchMembers]);

  return (
    <div className="max-w-(--breakpoint-xl) mx-auto animate-in fade-in slide-in-from-bottom-2 duration-1000 space-y-12">
      <div className="flex justify-between items-end pb-2">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-black">{brand.name}</h1>
          <p className="text-neutral-500 font-medium">{brand.subdomain}.eventify.com</p>
        </div>
        <Button className="bg-black text-white rounded-none px-10 py-6 hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer border-none shadow-none">
          Edit Brand
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total events" value={eventStats.total} />
        <StatCard label="Pending Review" value={eventStats.pending} />
        <StatCard label="Team Members" value={membersCount} />
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Recent Events</h2>
          <Link
            to="/dashboard/events"
            className="text-sm font-semibold text-neutral-400 hover:text-black transition-colors underline decoration-neutral-200 underline-offset-4"
          >
            View All
          </Link>
        </div>
        <div className="border border-neutral-200 overflow-hidden bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-[11px] uppercase tracking-widest text-neutral-500 border-b border-neutral-200">
                <th className="px-6 py-4 font-bold">Event Name</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {events.length > 0 ? (
                events.map((event) => (
                  <tr key={event.id} className="group hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-5 font-bold text-neutral-900">{event.title}</td>
                    <td className="px-6 py-5 text-neutral-500 text-sm">
                      {new Date(event.start_date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-[10px] font-black uppercase px-2 py-1 bg-neutral-100 text-neutral-600">
                        {event.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {canManage ? (
                        <button className="text-xs font-black uppercase tracking-tighter hover:underline cursor-pointer">
                          Manage
                        </button>
                      ) : (
                        <span className="text-neutral-300 text-xs uppercase font-bold">Locked</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-neutral-400 text-sm">
                    No recent events.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-6 pb-20">
        <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
          <h2 className="text-2xl font-bold tracking-tight">Team Preview</h2>
          <Link
            to="/dashboard/members"
            className="text-sm font-semibold text-neutral-400 hover:text-black underline decoration-neutral-200 underline-offset-4"
          >
            Manage Members
          </Link>
        </div>

        <div className="border border-neutral-200 p-8 bg-white relative min-h-[200px]">
          {/* Кнопка тепер завжди в одному місці (зверху справа) */}
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

          {/* Список йде ВНИЗ (flex-col) */}
          <div className="flex flex-col gap-6 max-w-2xl">
            {members.length > 0 ? (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 group/item animate-in fade-in slide-in-from-left-2 duration-300"
                >
                  <div className="w-12 h-12 bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-400 group-hover/item:bg-black group-hover/item:text-white transition-all duration-300">
                    {(member.user?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{member.user?.email}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-neutral-400 text-sm py-4">No team members yet.</div>
            )}
          </div>
        </div>
      </section>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={addMember}
        isLoading={isMembersLoading}
        error={membersError}
      />
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: number | undefined }) => {
  const displayValue = value ?? 0;
  return (
    <div className="border border-neutral-200 p-8 space-y-4 hover:border-black transition-colors group cursor-default bg-white">
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-400 group-hover:text-black transition-colors">
        {label}
      </p>
      <p className="text-6xl font-bold tracking-tighter transition-transform duration-500 group-hover:translate-x-1">
        {displayValue.toString().padStart(2, '0')}
      </p>
    </div>
  );
};
