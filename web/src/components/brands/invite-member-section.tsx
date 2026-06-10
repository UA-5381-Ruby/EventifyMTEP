import { useState, type ChangeEvent } from 'react';
import { Input, Button } from '@/components/ui';
import { InvitationsService } from '@/services/invitations-service';

const ROLES = ['manager', 'member'];

interface Props {
  brandId: number;
}

export function InviteMemberSection({ brandId }: Props) {
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
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
      setStatus('error');
    }
  };

  return (
    <div className="border border-gray-200 rounded-xl p-6 space-y-4">
      <div>
        <h3 className="text-base font-medium text-neutral-900">Invite team member</h3>
        <p className="text-sm text-neutral-500">They'll receive an email with a link to join.</p>
      </div>

      <div className="flex gap-3 items-end">
        <div className="flex-1">
          <Input
            label="Email"
            type="email"
            placeholder="colleague@example.com"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            disabled={status === 'loading'}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium text-neutral-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            disabled={status === 'loading'}
            className="h-10 px-3 rounded-lg border border-neutral-200 text-sm text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={status === 'loading' || !email.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white h-10"
        >
          {status === 'loading' ? 'Sending...' : 'Send invite'}
        </Button>
      </div>

      {status === 'success' && (
        <p className="text-sm text-green-700">Invitation sent to {email || 'the address'}.</p>
      )}
      {status === 'error' && (
        <p className="text-sm text-red-700">{error}</p>
      )}
    </div>
  );
}