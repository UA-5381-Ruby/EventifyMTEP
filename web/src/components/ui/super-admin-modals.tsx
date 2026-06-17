import { Modal } from '@/components/ui/modal';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export function DeleteUserModal({ isOpen, onClose, onConfirm, userName }: DeleteUserModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 bg-neutral-200 px-4 py-3 -mt-5 -mx-6 mb-4 rounded-t-xl">
          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54
              0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
              0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <h2 className="text-lg font-medium text-black">Delete User?</h2>
        </div>

        <div className="text-[15px] leading-relaxed text-black mb-6">
          <p>
            Are you sure you want to delete
            <span className="font-semibold"> {userName}</span>?
          </p>

          <p className="mt-2">
            This action will permanently remove the user and all associated memberships.
          </p>

          <p className="font-medium mt-2">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface DeleteBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  brandName: string;
}

export function DeleteBrandModal({ isOpen, onClose, onConfirm, brandName }: DeleteBrandModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 bg-neutral-200 px-4 py-3 -mt-5 -mx-6 mb-4 rounded-t-xl">
          <svg className="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54
              0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464
              0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>

          <h2 className="text-lg font-medium text-black">Delete Brand?</h2>
        </div>

        <div className="text-[15px] leading-relaxed text-black mb-6">
          <p>
            Are you sure you want to delete
            <span className="font-semibold"> {brandName}</span>?
          </p>

          <p className="mt-2">
            This action will permanently remove the brand together with all events and memberships.
          </p>

          <p className="font-medium mt-2">This action cannot be undone.</p>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 border border-red-600 text-red-600 hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  title = 'Success!',
  message = 'Operation completed successfully.',
}: SuccessModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="bg-[#dcdcdc] -mx-6 -my-5 px-8 py-16 rounded-xl flex flex-col items-center">
        <svg
          className="w-16 h-16 text-green-600 mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>

        <h2 className="text-3xl font-bold text-[#2b2d3c] text-center">{title}</h2>

        <p className="mt-4 text-lg text-center text-gray-700">{message}</p>

        <button
          onClick={onClose}
          className="mt-10 bg-[#2b2d3c] hover:bg-[#1f212c] text-white px-8 py-3 transition-colors"
        >
          Continue
        </button>
      </div>
    </Modal>
  );
}
