import { useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useBrandMembership } from '@/hooks/use-brand-membership';
import { BrandMembershipsService } from '@/services/brand-memberships-service';
import { InviteMemberModal } from '@/components/admin/modals/invite-member-modal.tsx';
import { RemoveMemberModal } from '@/components/admin/modals/remove-member-modal.tsx';
import type { Brand } from '@/types/brand';
import type { Membership } from '@/types/brand-memberships';
import { Button } from '@/components/ui';
import { MembersTable } from '../../components/admin/member/members-table.tsx';
import { useReduxState } from '@/hooks/use-redux-state';

export const MembersPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const { user } = useAuth();

  const [brandMembers, setBrandMembers] = useReduxState<Membership[]>([]);
  const [isMembersLoading, setIsMembersLoading] = useReduxState(true);
  const [membersError, setMembersError] = useReduxState<string | null>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useReduxState(false);
  const [memberToRemove, setMemberToRemove] = useReduxState<{ id: number; email: string } | null>(
    null
  );
  const [isRemoving, setIsRemoving] = useReduxState(false);

  const { isCurrentBrandManager } = useBrandMembership(String(brand.id));
  const isOwner = brandMembers.some((m) => m.user?.id === user?.id && m.role === 'owner');
  const canManage = isCurrentBrandManager || isOwner;

  const loadMembers = useCallback(async () => {
    setIsMembersLoading(true);
    setMembersError(null);
    try {
      const response = await BrandMembershipsService.getBrandMemberships(brand.id, {
        page: 1,
        per_page: 50,
      });
      setBrandMembers(response.data || []);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsMembersLoading(false);
    }
  }, [brand.id, setBrandMembers, setIsMembersLoading, setMembersError]);

  useEffect(() => {
    Promise.resolve().then(() => {
      void loadMembers();
    });
  }, [loadMembers]);

  const openRemoveModal = (id: number, email: string) => {
    setMembersError(null);
    setMemberToRemove({ id, email });
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;
    setIsRemoving(true);
    try {
      await BrandMembershipsService.removeMember(brand.id, memberToRemove.id);
      setBrandMembers((prev) => prev.filter((m) => m.id !== memberToRemove.id));
      setMemberToRemove(null);
    } catch (err) {
      setMembersError(err instanceof Error ? err.message : 'Failed to remove member');
    } finally {
      setIsRemoving(false);
    }
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

      {membersError && (
        <div className="p-4 bg-red-50 text-red-600 text-xs border border-red-100 ml-1 animate-shake">
          {membersError}
        </div>
      )}

      <MembersTable
        members={brandMembers}
        isLoading={isMembersLoading}
        currentUserId={user?.id}
        canManage={canManage}
        onRemoveClick={openRemoveModal}
      />

      <InviteMemberModal
        brandId={brand.id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />

      <RemoveMemberModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemove}
        isLoading={isRemoving}
        userEmail={memberToRemove?.email || ''}
      />
    </div>
  );
};
