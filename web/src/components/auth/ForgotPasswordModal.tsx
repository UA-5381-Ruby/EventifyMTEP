import { useState, type ChangeEvent } from 'react';
import { Modal, Input, Button } from '@/components/ui';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onNavigateToLogin: () => void;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  onSuccess,
  onNavigateToLogin,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email.trim()) {
      onSuccess(email);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-[360px] mx-auto text-center py-2">
        <h2 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">Forgot Password</h2>

        <p className="text-xs text-neutral-500 mb-8 leading-relaxed">
          Please enter your email address associated with your account. We'll send you a link to
          reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          <div className="relative">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              required
            />
            {email && (
              <button
                type="button"
                onClick={() => setEmail('')}
                className="absolute right-3 top-[14px] text-neutral-400 hover:text-neutral-600 transition-colors focus:outline-none"
                aria-label="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            className={`h-11 text-sm font-medium rounded-xl transition-all ${
              email.trim()
                ? 'bg-[#3337BF] text-white hover:bg-[#282b9e]'
                : 'bg-[#CECECE] text-neutral-500 cursor-not-allowed'
            }`}
            disabled={!email.trim()}
          >
            Send
          </Button>
        </form>

        <div className="mt-6">
          <button
            type="button"
            onClick={onNavigateToLogin}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-800 transition-colors underline underline-offset-4"
          >
            Return to sign in
          </button>
        </div>
      </div>
    </Modal>
  );
}
