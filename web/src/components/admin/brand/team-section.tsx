import { useState } from 'react';
import type { Membership } from '@/types/brand-memberships';
import { SectionHeader } from '../shared.tsx';
import { TeamList } from '../member/team-list.tsx';
import { InviteMemberModal } from '@/components/admin/modals/invite-member-modal';

interface TeamSectionProps {
  brandId: number;
  members: Membership[];
  canManage: boolean;
}

export const TeamSection = ({ brandId, members, canManage }: TeamSectionProps) => {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  return (
    <section className="space-y-6 pb-20">
      <SectionHeader title="Team Preview" linkTo="/dashboard/members" linkLabel="Manage Members" />
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
        <TeamList members={members} />
      </div>

      <InviteMemberModal
        brandId={brandId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </section>
  );
};
