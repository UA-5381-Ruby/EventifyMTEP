import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import authService from '@/services/auth-service';
import { MailCheck  } from 'lucide-react';

type ForgotPasswordState = 'form' | 'loading' | 'success';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [state, setState] = useState<ForgotPasswordState>('form');

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setState('loading');

    try {
      await authService.requestPasswordReset(email);
      setState('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed. Please try again.');
      setState('form');
    }
  };

  if (state === 'success') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
            <div className="p-8 sm:p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                <MailCheck className="w-16 h-16 text-blue-500" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
              <p className="text-neutral-600 mb-2">
                If an account exists for <strong>{email}</strong>, you will receive a password reset link in your inbox.
              </p>
              <p className="text-sm text-neutral-500 mb-6">
                The link will expire in 15 minutes. Check your spam folder if you don't see it.
              </p>

              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Back to Login
                </Button>
                <Button
                  onClick={() => {
                    setEmail('');
                    setError('');
                    setState('form');
                  }}
                  fullWidth
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
                >
                  Try Another Email
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
            <h1 className="text-2xl font-bold text-neutral-900 text-center mb-2">Forgot Password?</h1>
            <p className="text-sm text-neutral-600 text-center mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={state === 'loading'}
              />

              {error && (
                <p className="text-sm text-red-700 text-center" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                disabled={state === 'loading'}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
              >
                {state === 'loading' ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>

            <p className="mt-6 text-sm text-center text-neutral-600">
              Remember your password?{' '}
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
