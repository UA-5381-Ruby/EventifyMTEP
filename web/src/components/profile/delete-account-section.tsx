import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { UserService } from '@/services/user-service';
import { useNavigate } from 'react-router-dom';

interface DeleteAccountSectionProps {
  userId: number;
}

export function DeleteAccountSection({ userId }: DeleteAccountSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await UserService.deleteUser(userId);
      navigate('/login');
    } catch (error) {
      console.error('Delete failed', error);
      setIsDeleting(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="max-w-lg">
      <h3 className="text-lg font-semibold text-neutral-900 mb-1">Delete account</h3>
      <p className="text-sm text-neutral-500 mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <Button
        variant="outline"
        className="text-error-600 border-error-200 hover:bg-error-50"
        onClick={() => setIsModalOpen(true)}
      >
        Delete account
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !isDeleting && setIsModalOpen(false)}
        title="Delete Account"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Yes, delete my account
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          Are you absolutely sure you want to permanently delete your account? This action cannot be
          undone and you will lose access to all your brands and events.
        </p>
      </Modal>
    </div>
  );
}
