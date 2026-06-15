import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '@/components/ui';
import { Eye, EyeOff } from 'lucide-react';
import { AuthCard } from '@/components/auth/auth-card';

import authService from '@/services/auth-service';
import { ResetPasswordSuccess } from '@/components/auth/reset-password/reset-password-success.tsx';
import { ResetPasswordError } from '@/components/auth/reset-password/reset-password-error.tsx';

type ResetPasswordState = 'form' | 'loading' | 'success' | 'error';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(() => (token ? '' : 'No reset token provided.'));
  const [validationError, setValidationError] = useState('');
  const [state, setState] = useState<ResetPasswordState>(() => (token ? 'form' : 'error'));

  const validateForm = (): boolean => {
    if (!password) return (setValidationError('Password is required'), false);
    if (password.length < 6)
      return (setValidationError('Password must be at least 6 characters'), false);
    if (!confirmPassword) return (setValidationError('Please confirm your password'), false);
    if (password !== confirmPassword) return (setValidationError('Passwords do not match'), false);
    return true;
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (!validateForm()) return;

    setState('loading');
    try {
      await authService.confirmPasswordReset(token, password);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Password reset failed');
      setState('error');
    }
  };

  if (state === 'success')
    return (
      <AuthCard centered>
        <ResetPasswordSuccess />
      </AuthCard>
    );
  if (state === 'error')
    return (
      <AuthCard centered>
        <ResetPasswordError message={error} />
      </AuthCard>
    );

  return (
    <AuthCard>
      <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Reset Password</h1>
      <p className="text-sm text-neutral-600 text-center mb-6">Enter your new password below.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5 relative">
          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={state === 'loading'}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        <div className="space-y-1.5 relative">
          <Input
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            disabled={state === 'loading'}
            className="pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-sm"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>

        {(error || validationError) && (
          <p className="text-sm text-red-700 text-center" role="alert">
            {error || validationError}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          disabled={state === 'loading'}
          className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
        >
          {state === 'loading' ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>

      <p className="mt-6 text-sm text-center text-neutral-600">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Back to Login
        </button>
      </p>
    </AuthCard>
  );
}
