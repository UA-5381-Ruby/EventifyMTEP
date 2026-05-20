import { useState, type FormEvent, type ChangeEvent } from 'react';
import { Modal, Input, Button } from '@/components/ui';
import { EyeIcon, EyeOffIcon } from './icons/EyeIcon';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete: () => void;
}

export function ResetPasswordModal({ isOpen, onClose, onResetComplete }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Your password doesn't match");
      return;
    }

    onResetComplete();
  };

  const isFormValid = password.length > 0 && confirmPassword.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[360px] mx-auto text-center py-2">
        <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">Reset Password</h2>

        <p className="text-xs text-neutral-500 mb-8 leading-relaxed">
          Please enter your new password. We'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-neutral-600 pl-0.5">New Password</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter new password"
              value={password}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-[33px] text-neutral-400 hover:text-neutral-600 focus:outline-none"
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>

          <div className="space-y-1.5 relative">
            <label className="text-xs font-medium text-neutral-600 pl-0.5">Re-enter Password</label>
            <input
              type="password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setConfirmPassword(e.target.value);
                if (error) setError('');
              }}
              required
              className={`w-full px-3 h-11 text-sm rounded-xl border bg-white focus:outline-none transition-colors ${
                error
                  ? 'border-[#B70404] focus:border-[#B70404] text-[#B70404]'
                  : 'border-neutral-300 focus:border-blue-500 text-neutral-900 shadow-sm'
              }`}
            />
            {confirmPassword && (
              <button
                type="button"
                onClick={() => setConfirmPassword('')}
                className="absolute right-3 top-[35px] text-neutral-400 hover:text-neutral-600 focus:outline-none"
              >
                ✕
              </button>
            )}

            {error && (
              <p className="text-[11px] font-medium text-[#B70404] pl-0.5 pt-0.5">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            className={`h-11 text-sm font-medium rounded-xl transition-all mt-6 ${
              isFormValid
                ? 'bg-[#3337BF] text-white hover:bg-[#282b9e]'
                : 'bg-[#CECECE] text-neutral-500 cursor-not-allowed'
            }`}
            disabled={!isFormValid}
          >
            Reset password
          </Button>
        </form>
      </div>
    </Modal>
  );
}
