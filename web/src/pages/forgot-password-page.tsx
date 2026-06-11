import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@/components/ui';
import { MailCheck } from 'lucide-react';
import { AuthCard } from '@/components/auth/auth-card';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';
import authService from '@/services/auth-service';

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
      <AuthCard centered>
        <AuthIconHeader
          icon={<MailCheck className="w-16 h-16 text-blue-500" />}
          iconBg="bg-blue-50"
          title="Check Your Email"
          description={
            <>
              If an account exists for <strong>{email}</strong>, you will receive a password reset
              link in your inbox.
            </>
          }
        />
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
            onClick={() => { setEmail(''); setError(''); setState('form'); }}
            fullWidth
            variant="outline"
            className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
          >
            Try Another Email
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard>
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
    </AuthCard>
  );
}
