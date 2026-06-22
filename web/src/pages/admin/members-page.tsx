import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useBrandMemberships } from '@/hooks/use-brand-memberships';
import { InviteMemberModal } from '@/components/admin/modals/invite-member-modal.tsx';
import { RemoveMemberModal } from '@/components/admin/modals/remove-member-modal.tsx';
import type { Brand } from '@/types/brand';
import { Button, Spinner } from '@/components/ui';

export const MembersPage = () => {
  const { brand } = useOutletContext<{ brand: Brand }>();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const [memberToRemove, setMemberToRemove] = useState<{ id: string; email: string } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const { members, isLoading, error, fetchMembers, addMember, removeMember, setError } =
    useBrandMemberships(brand.id);

  useEffect(() => {
    fetchMembers({ page: 1, per_page: 10 });
  }, [brand.id, fetchMembers]);

  const openRemoveModal = (id: string, email: string) => {
    setMemberToRemove({ id, email });
    setError(null);
  };

  const handleConfirmRemove = async () => {
    if (!memberToRemove) return;

    setIsRemoving(true);
    try {
      await removeMember(memberToRemove.id);
      setMemberToRemove(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="max-w-(--breakpoint-xl) mx-auto animate-in fade-in duration-700 space-y-8">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-bold tracking-tight text-black ml-1 text-center">
          Team Members
        </h1>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-black text-white rounded-none px-8 py-2 text-[11px] font-black uppercase tracking-widest shadow-none border-none hover:bg-neutral-800 transition-all active:scale-95"
        >
          + Add Member
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 text-xs border border-red-100 ml-1 animate-shake">
          {error}
        </div>
      )}

      <div className="border border-neutral-200 bg-white overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-100 border-b border-neutral-200 text-[11px] uppercase tracking-widest text-neutral-500 font-black">
              <th className="px-8 py-4 font-bold">User</th>
              <th className="px-4 py-4 font-bold text-center">Role</th>
              <th className="px-4 py-4 font-bold">Joined date</th>
              <th className="px-8 py-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {isLoading && members.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center">
                  <Spinner />
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="group hover:bg-neutral-50 transition-colors">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-400 group-hover:bg-black group-hover:text-white transition-all">
                        {(member.user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-black">
                          {member.user?.name || 'No Name'}
                          {member.role === 'owner' && (
                            <span className="ml-1 text-neutral-400 font-medium">(You)</span>
                          )}
                        </p>
                        <p className="text-xs text-neutral-400">{member.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5 text-center">
                    <span className="inline-block border border-neutral-300 px-6 py-1 text-[10px] font-black uppercase tracking-widest text-neutral-600 bg-white min-w-[100px]">
                      {member.role}
                    </span>
                  </td>
                  <td className="px-4 py-5 text-sm text-neutral-500 font-medium">
                    {new Date().toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-8 py-5 text-right">
                    {member.role !== 'owner' ? (
                      <button
                        onClick={() => openRemoveModal(member.id, member.user.email)}
                        className="text-[11px] font-black uppercase tracking-tighter text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-neutral-200">
                        Protected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={addMember}
        isLoading={isLoading}
        error={error}
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
