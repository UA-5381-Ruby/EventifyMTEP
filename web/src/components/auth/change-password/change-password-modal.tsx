import { type ChangeEvent } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import authService from '@/services/auth-service.ts';
import { useReduxState } from '@/hooks/use-redux-state';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ChangePasswordModal({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useReduxState('');
  const [newPassword, setNewPassword] = useReduxState('');
  const [confirmPassword, setConfirmPassword] = useReduxState('');

  const [showCurrentPassword, setShowCurrentPassword] = useReduxState(false);
  const [showNewPassword, setShowNewPassword] = useReduxState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useReduxState(false);

  const [error, setError] = useReduxState('');
  const [isSubmitting, setIsSubmitting] = useReduxState(false);

  const resetState = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!currentPassword) return (setError('Current password is required'), false);
    if (!newPassword) return (setError('New password is required'), false);
    if (newPassword.length < 6) return (setError('Password must be at least 6 characters'), false);
    if (!confirmPassword) return (setError('Please confirm your new password'), false);
    if (newPassword !== confirmPassword) return (setError('Passwords do not match'), false);
    if (newPassword === currentPassword)
      return (setError('New password must be different from current password'), false);
    return true;
  };

  const handleSave = async () => {
    setError('');
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      resetState();
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Change password"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={isSubmitting}
            className="font-normal"
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave} disabled={isSubmitting} className="font-medium">
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 py-2">
        <div className="space-y-1.5 relative">
          <Input
            label="Current password"
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isSubmitting}
            className="text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword((v) => !v)}
            className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
          >
            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="space-y-1.5 relative">
          <Input
            label="New password"
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isSubmitting}
            className="text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((v) => !v)}
            className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={showNewPassword ? 'Hide password' : 'Show password'}
          >
            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="space-y-1.5 relative">
          <Input
            label="Confirm new password"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={isSubmitting}
            className="text-sm pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
