import type { Membership } from '@/types/brand-memberships';
import { Spinner } from '@/components/ui';
import { MemberRow } from './member-row.tsx';

interface MembersTableProps {
  members: Membership[];
  isLoading: boolean;
  currentUserId?: number;
  canManage: boolean;
  onRemoveClick: (id: number, email: string) => void;
}

export const MembersTable = ({
  members,
  isLoading,
  currentUserId,
  canManage,
  onRemoveClick,
}: MembersTableProps) => {
  return (
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
          {isLoading ? (
            <tr>
              <td colSpan={4} className="py-20 text-center">
                <Spinner />
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={4} className="py-20 text-center text-neutral-400">
                No team members found.
              </td>
            </tr>
          ) : (
            members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                canManage={canManage}
                onRemove={onRemoveClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
