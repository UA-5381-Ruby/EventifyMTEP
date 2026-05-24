import React, { useState } from 'react';
import { Modal, Input, Button, Spinner, Alert } from '@/components/ui';
import type { UserRole, Membership } from '@/types/brand-memberships';
import { X } from 'lucide-react';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: UserRole) => Promise<Membership>;
  isLoading: boolean;
  error: string | null;
}

export const InviteMemberModal = ({
  isOpen,
  onClose,
  onInvite,
  isLoading,
  error,
}: InviteMemberModalProps) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onInvite(email, role);
      setEmail('');
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white p-10 max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6 cursor-pointer">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-8">Invite New Member</h2>
        {error && (
          <Alert variant="warning" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 font-medium">Email Address</label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border-gray-400 h-11"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-gray-500 font-medium">Assign Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full border border-neutral-400 rounded-none h-11 px-3 outline-none focus:border-black bg-white text-sm font-medium"
            >
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-none px-8 h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-none bg-black text-white px-8 h-12 min-w-[140px]"
            >
              {isLoading ? <Spinner /> : 'Send Invite'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
