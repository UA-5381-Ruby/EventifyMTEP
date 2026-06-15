import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { InvitationsService } from '@/services/invitations-service';
import { tokenStorage } from '@/lib/api-client';
import { useState } from 'react';

type Status = 'loading' | 'success' | 'error' | 'no_account';

interface PageState {
  status: Status;
  errorMessage: string;
}

function getInitialState(token: string | null, brandId: string | null): PageState {
  if (!token || !brandId) {
    return { status: 'error', errorMessage: 'Invalid invitation link.' };
  }
  return { status: 'loading', errorMessage: '' };
}

export function AcceptInvitationPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');
  const brandId = searchParams.get('brand_id');

  const [pageState, setPageState] = useState<PageState>(() => getInitialState(token, brandId));
  const hasAccepted = useRef(false);

  useEffect(() => {
    if (hasAccepted.current) return;
    if (!token || !brandId) return;

    hasAccepted.current = true;

    if (!tokenStorage.get()) {
      const returnUrl = `/accept-invitation?token=${encodeURIComponent(token)}&brand_id=${brandId}`;
      navigate(`/login?redirect=${encodeURIComponent(returnUrl)}`, { replace: true });
      return;
    }

    const accept = async () => {
      try {
        await InvitationsService.acceptInvitation(Number(brandId), token);
        setPageState({ status: 'success', errorMessage: '' });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to accept invitation';
        if (message.toLowerCase().includes('no account')) {
          setPageState({ status: 'no_account', errorMessage: '' });
        } else {
          setPageState({ status: 'error', errorMessage: message });
        }
      }
    };

    accept();
  }, [token, brandId, navigate]);

  const { status, errorMessage } = pageState;

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-gray-200 p-8 sm:p-12 text-center">
          {status === 'loading' && (
            <>
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Accepting invitation...</p>
            </>
          )}

          {status === 'success' && (
            <>
              <h1 className="text-2xl font-bold text-green-900 mb-2">You're in!</h1>
              <p className="text-green-800 mb-6">You've successfully joined the brand.</p>
              <Button
                onClick={() => navigate('/brands')}
                fullWidth
                className="bg-blue-600 text-white"
              >
                Go to brands
              </Button>
            </>
          )}

          {status === 'no_account' && (
            <>
              <div className="text-4xl mb-4">👤</div>
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create an account first</h1>
              <p className="text-neutral-600 mb-6">
                Register with the email address the invitation was sent to, then click the link
                again.
              </p>
              <Button
                onClick={() => navigate(`/registration?invite=${token}&brand_id=${brandId}`)}
                fullWidth
                className="bg-blue-600 text-white"
              >
                Register
              </Button>
            </>
          )}

          {status === 'error' && (
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
