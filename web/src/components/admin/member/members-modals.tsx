import { InviteMemberModal } from '@/components/admin/modals/invite-member-modal.tsx';
import { RemoveMemberModal } from '@/components/admin/modals/remove-member-modal.tsx';

interface MemberToRemove {
  id: number;
  email: string;
}

interface MembersModalsProps {
  brandId: number;
  isInviteOpen: boolean;
  onInviteClose: () => void;
  memberToRemove: MemberToRemove | null;
  onRemoveClose: () => void;
  onRemoveConfirm: () => Promise<void>;
  isRemoving: boolean;
}

export const MembersModals = ({
  brandId,
  isInviteOpen,
  onInviteClose,
  memberToRemove,
  onRemoveClose,
  onRemoveConfirm,
  isRemoving,
}: MembersModalsProps) => {
  return (
    <>
      <InviteMemberModal brandId={brandId} isOpen={isInviteOpen} onClose={onInviteClose} />

      <RemoveMemberModal
        isOpen={!!memberToRemove}
        onClose={onRemoveClose}
        onConfirm={async () => await onRemoveConfirm()} // Явний виклик як Promise
        isLoading={isRemoving}
        userEmail={memberToRemove?.email || ''}
      />
    </>
  );
};
