import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Input, Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { Eye, EyeOff } from 'lucide-react';
import authService from '@/services/auth-service';

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
  const [state, setState] = useState<ResetPasswordState>(() => (token ? 'form' : 'error'));
  const [validationError, setValidationError] = useState('');

  const validateForm = (): boolean => {
    if (!password) {
      setValidationError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setValidationError('Password must be at least 6 characters');
      return false;
    }
    if (!confirmPassword) {
      setValidationError('Please confirm your password');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setValidationError('');

    if (!validateForm()) {
      return;
    }

    setState('loading');

    try {
      await authService.confirmPasswordReset(token, password);
      setState('success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Password reset failed';
      setError(message);
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                <span className="text-3xl"></span>
              </div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">Password Reset!</h1>
              <p className="text-green-800 mb-6">
                Your password has been successfully reset. You can now log in with your new
                password.
              </p>
              <Button
                onClick={() => navigate('/login')}
                fullWidth
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (state === 'error') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                <span className="text-3xl"></span>
              </div>
              <h1 className="text-2xl font-bold text-red-900 mb-2">Invalid Link</h1>
              <p className="text-red-800 mb-6">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/forgot-password')}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Request New Link
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
                >
                  Back to Login
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
          <div className="p-8 sm:p-12">
            <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Reset Password</h1>
            <p className="text-sm text-neutral-600 text-center mb-6">
              Enter your new password below.
            </p>

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
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
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
                  {showPassword ? <EyeOff /> : <Eye />}
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
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
