import type { Membership } from '@/types/brand-memberships';

interface MemberRowProps {
  member: Membership;
  currentUserId?: number;
  canManage: boolean;
  onRemove: (id: number, email: string) => void;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-En', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const MemberRow = ({ member, currentUserId, canManage, onRemove }: MemberRowProps) => {
  const isCurrentUser = member.user?.id === currentUserId;
  const isOwner = member.role === 'owner';

  return (
    <tr className="group hover:bg-neutral-50 transition-colors">
      <td className="px-8 py-5">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-400 group-hover:bg-black group-hover:text-white transition-all">
            {(member.user?.email || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-bold text-black">
              {member.user?.name || 'No Name'}
              {isCurrentUser && <span className="ml-1 text-neutral-400 font-medium">(You)</span>}
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
        {formatDate(member.created_at)}
      </td>
      <td className="px-8 py-5 text-right">
        {!isOwner && canManage ? (
          <button
            onClick={() => onRemove(member.id, member.user?.email || '')}
            className="text-[11px] font-black uppercase tracking-tighter text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
          >
            Remove
          </button>
        ) : (
          <span className="text-[10px] font-black uppercase text-neutral-200">Protected</span>
        )}
      </td>
    </tr>
  );
};
