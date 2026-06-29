import { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';
import type { Brand } from '@/types/brand';
import { Button } from '@/components/ui';
import { MembersTable } from '../../components/admin/member/members-table.tsx';

import { useMembers } from '@/hooks/use-members.ts';
import { MembersToolbar } from '../../components/admin/member/members-toolbar.tsx';
import { MembersModals } from '../../components/admin/member/members-modals.tsx';

export const MembersPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; email: string } | null>(null);

  const {
    brandMembers,
    isLoading: isMembersLoading,
    error: membersError,
    setError: setMembersError,
    isRemoving,
    removeMember,
  } = useMembers(brand.id);

  const { isCurrentBrandManager } = useBrandMembership(String(brand.id));
  const isOwner = brandMembers.some((m) => m.user?.id === user?.id && m.role === 'owner');
  const canManage = isCurrentBrandManager || isOwner;

  const filteredMembers = useMemo(() => {
    return brandMembers.filter((member) => {
      const matchesRole = roleFilter === 'all' || member.role === roleFilter;
      const query = search.toLowerCase().trim();
      const userName = member.user?.name?.toLowerCase() || '';
      const userEmail = member.user?.email?.toLowerCase() || '';

      return matchesRole && (userName.includes(query) || userEmail.includes(query));
    });
  }, [brandMembers, search, roleFilter]);

  const openRemoveModal = (id: number, email: string) => {
    setMembersError(null);
    setMemberToRemove({ id, email });
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    const success = await removeMember(memberToRemove.id);
    if (success) setMemberToRemove(null);
  };

  return (
    <div className="max-w-(--breakpoint-xl) mx-auto animate-in fade-in duration-700 space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight text-black ml-1">Team Members</h1>
        {canManage && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-black text-white rounded-none px-8 py-2 text-[11px] font-black uppercase tracking-widest shadow-none border-none hover:bg-neutral-800 transition-all active:scale-95 cursor-pointer"
          >
            + Add Member
          </Button>
        )}
      </div>

      <MembersToolbar
        search={search}
        roleFilter={roleFilter}
        onSearchChange={setSearch}
        onRoleFilterChange={setRoleFilter}
      />

      {membersError && (
        <div className="p-4 bg-red-50 text-red-600 text-xs border border-red-100 ml-1 animate-shake">
          {membersError}
        </div>
      )}

      <MembersTable
        members={filteredMembers}
        isLoading={isMembersLoading}
        currentUserId={user?.id}
        canManage={canManage}
        onRemoveClick={openRemoveModal}
      />

      <MembersModals
        brandId={brand.id}
        isInviteOpen={isInviteModalOpen}
        onInviteClose={() => setIsInviteModalOpen(false)}
        memberToRemove={memberToRemove}
        onRemoveClose={() => setMemberToRemove(null)}
        onRemoveConfirm={handleConfirmRemove}
        isRemoving={isRemoving}
      />
    </div>
  );
};
