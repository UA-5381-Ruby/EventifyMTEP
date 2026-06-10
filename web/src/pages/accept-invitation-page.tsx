import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { InvitationsService } from '@/services/invitations-service';

type State = 'loading' | 'success' | 'error' | 'no_account';

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const hasAccepted = useRef(false);

  useEffect(() => {
    if (hasAccepted.current) return;
    hasAccepted.current = true;

    const accept = async () => {
      const token = searchParams.get('token');
      const brandId = searchParams.get('brand_id');

      if (!token || !brandId) {
        setErrorMessage('Invalid invitation link.');
        setState('error');
        return;
      }

      try {
        await InvitationsService.acceptInvitation(Number(brandId), token);
        setState('success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation';
        if (message.toLowerCase().includes('no account')) {
          setState('no_account');
        } else {
          setErrorMessage(message);
          setState('error');
        }
      }
    };

    accept();
  }, [searchParams]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-8 sm:p-12 text-center">

          {state === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Accepting invitation...</p>
            </>
          )}

          {state === 'success' && (
            <>
              <div className="text-4xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-green-900 mb-2">You're in!</h1>
              <p className="text-green-800 mb-6">You've successfully joined the brand.</p>
              <Button onClick={() => navigate('/brands')} fullWidth className="bg-blue-600 text-white">
                Go to brands
              </Button>
            </>
          )}

          {state === 'no_account' && (
            <>
              <div className="text-4xl mb-4">👤</div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create an account first</h1>
              <p className="text-neutral-600 mb-6">
                Register with the email address the invitation was sent to, then click the link again.
              </p>
              <Button
                onClick={() => navigate(`/registration?invite=${searchParams.get('token')}&brand_id=${searchParams.get('brand_id')}`)}
                fullWidth
                className="bg-blue-600 text-white"
              >
                Register
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <h1 className="text-2xl font-bold text-red-900 mb-2">Invalid link</h1>
              <p className="text-red-800 mb-6">{errorMessage}</p>
              <Button onClick={() => navigate('/login')} fullWidth variant="outline">
                Back to login
              </Button>
            </>
          )}

        </div>
      </div>
    </PageWrapper>
  );
}
