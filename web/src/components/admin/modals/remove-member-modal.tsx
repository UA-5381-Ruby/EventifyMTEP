import { Modal, Button, Spinner } from '@/components/ui';
import { X } from 'lucide-react';

interface RemoveMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  userEmail: string;
}

export const RemoveMemberModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  userEmail,
}: RemoveMemberModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-10 max-w-md w-full relative border border-neutral-200 rounded-none animate-in fade-in zoom-in-95 duration-200 shadow-none">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 cursor-pointer text-neutral-400 hover:text-black transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-4 tracking-tight text-black">Remove Member</h2>

        <p className="text-sm text-neutral-500 mb-10 leading-relaxed">
          Are you sure you want to remove <span className="font-bold text-black">{userEmail}</span>{' '}
          from the team? They will lose all access to this brand dashboard.
        </p>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-none px-8 h-12 bg-neutral-100 hover:bg-neutral-200 text-black border-none font-bold uppercase text-[10px] tracking-widest shadow-none"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-none bg-black text-white px-8 h-12 min-w-[140px] border-none font-bold uppercase text-[10px] tracking-widest shadow-none hover:bg-neutral-800 transition-all active:scale-95"
          >
            {isLoading ? <Spinner className="w-4 h-4" /> : 'Remove Member'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
