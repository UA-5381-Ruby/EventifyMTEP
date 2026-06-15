import { useState, type ChangeEvent } from 'react';
import { Input, Button, Modal } from '@/components/ui';
import { InvitationsService } from '@/services/invitations-service';

const ROLES = ['manager', 'member'];

interface Props {
  brandId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function InviteMemberModal({ brandId, isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setStatus('loading');
    setError('');
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
    setEmail('');
    setRole('member');
    setStatus('idle');
    setError('');
    onClose();
  };

  return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Invite team member">
        <p className="text-sm text-neutral-500 mb-4">
          They'll receive an email with a link to join.
        </p>

        <div className="space-y-4">
          <Input
              label="Email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              disabled={status === 'loading'}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-neutral-700">Role</label>
            <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={status === 'loading'}
                className="w-full h-10 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {status === 'success' && (
              <p className="text-sm text-green-700">Invitation sent successfully.</p>
          )}
          {status === 'error' && (
              <p className="text-sm text-red-700">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={handleClose} disabled={status === 'loading'}>
            Cancel
          </Button>
          <Button
              onClick={handleSubmit}
              disabled={status === 'loading' || !email.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {status === 'loading' ? 'Sending...' : 'Send invite'}
          </Button>
        </div>
      </Modal>
  );
}