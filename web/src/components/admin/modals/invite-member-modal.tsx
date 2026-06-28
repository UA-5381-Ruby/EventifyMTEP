import React from 'react';
import { Modal, Input, Button, Spinner, Alert } from '@/components/ui';
import { InvitationsService } from '@/services/invitations-service';
import { X } from 'lucide-react';
import { useReduxState } from '@/hooks/use-redux-state';

interface InviteMemberModalProps {
  brandId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal = ({ brandId, isOpen, onClose }: InviteMemberModalProps) => {
  const [email, setEmail] = useReduxState('');
  const [role, setRole] = useReduxState('member');
  const [status, setStatus] = useReduxState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useReduxState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setError(null);

    try {
      await InvitationsService.sendInvitation(brandId, email, role);

      setStatus('success');
      setEmail('');

      setTimeout(() => {
        setStatus('idle');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
      setStatus('error');
    }
  };

  const handleClose = () => {
    if (status !== 'loading') {
      setEmail('');
      setRole('member');
      setStatus('idle');
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white p-10 max-w-md w-full relative">
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 cursor-pointer hover:opacity-70 transition-opacity"
          disabled={status === 'loading'}
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-8">Invite New Member</h2>

        {status === 'error' && (
          <Alert variant="warning" className="mb-6">
            {error}
          </Alert>
        )}

        {status === 'success' && (
          <Alert variant="success" className="mb-6 bg-green-50 text-green-700 border-green-200">
            Invitation sent successfully!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="rounded-none border-gray-400 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 font-medium">Assign Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={status === 'loading' || status === 'success'}
              className="w-full border border-neutral-400 rounded-none h-11 px-3 outline-none focus:border-black bg-white text-sm font-medium disabled:opacity-50"
            >
              <option value="member">Member</option>
              <option value="manager">Manager</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={status === 'loading'}
              className="rounded-none px-8 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={status === 'loading' || status === 'success' || !email.trim()}
              className="rounded-none bg-black text-white px-8 h-12 min-w-[140px] hover:bg-neutral-800"
            >
              {status === 'loading' ? <Spinner /> : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
