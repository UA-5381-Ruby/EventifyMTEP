import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthCard } from '@/components/auth/auth-card';
import { useResendVerification } from '@/hooks/use-resend-verification';
import { VerifyEmailLoading } from '@/components/auth/verify-email/verify-email-loading';
import { VerifyEmailSuccess } from '@/components/auth/verify-email/verify-email-success';
import { VerifyEmailError } from '@/components/auth/verify-email/verify-email-error';
import { VerifyEmailExpired } from '@/components/auth/verify-email/verify-email-expired';
import authService from '@/services/auth-service';
import { useReduxState } from '@/hooks/use-redux-state';

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [state, setState] = useReduxState<VerificationState>(token ? 'loading' : 'error');
  const [errorMessage, setErrorMessage] = useReduxState(token ? '' : 'No verification token provided.');

  const { resendState, handleResend } = useResendVerification(token);

  useEffect(() => {
    if (!token) return;

    authService
      .confirmEmail(token)
      .then(() => {
        setState('success');
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Verification failed';
        setErrorMessage(message);
        setState(message.toLowerCase().includes('expired') ? 'expired' : 'error');
      });
  }, [token]);

  const resendProps = { resendState, onResend: handleResend };

  return (
    <AuthCard centered>
      {state === 'loading' && <VerifyEmailLoading />}
      {state === 'success' && <VerifyEmailSuccess {...resendProps} />}
      {state === 'error' && <VerifyEmailError message={errorMessage} {...resendProps} />}
      {state === 'expired' && <VerifyEmailExpired {...resendProps} />}
    </AuthCard>
  );
}
