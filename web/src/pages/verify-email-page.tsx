import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import authService from '@/services/auth-service';
import { CircleCheck, XCircle, CircleAlert } from 'lucide-react';

type VerificationState = 'loading' | 'success' | 'error' | 'expired';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setErrorMessage('No verification token provided.');
        setState('error');
        return;
      }

      try {
        await authService.confirmEmail(token);
        setState('success');
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Verification failed';
        setErrorMessage(message);
        setState(message.toLowerCase().includes('expired') ? 'expired' : 'error');
      }
    };

    verifyEmail();
  }, [searchParams]);

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="w-full max-w-md rounded-2xl overflow-hidden bg-white shadow-lg border border-gray-200 relative z-10">
          <div className="p-8 sm:p-12 text-center">
            {state === 'loading' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4">
                  <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verifying Email</h1>
                <p className="text-neutral-600">
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {state === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-4">
                  <CircleCheck className="w-16 h-16 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-green-900 mb-2">Email Verified!</h1>
                <p className="text-green-800 mb-6">
                  Your email has been successfully verified. You can now log in to your account.
                </p>
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
                >
                  Go to Login
                </Button>
              </>
            )}

            {state === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-4">
                  <XCircle className="w-16 h-16 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-red-900 mb-2">Verification Failed</h1>
                <p className="text-red-800 mb-6">{errorMessage}</p>
                <div className="space-y-2">
                  <Button
                    onClick={() => navigate('/registration')}
                    fullWidth
                    variant="outline"
                    className="border-blue-500 text-blue-500 hover:bg-blue-50"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    fullWidth
                    variant="outline"
                    className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
                  >
                    Go to Login
                  </Button>
                </div>
              </>
            )}

            {state === 'expired' && (
              <>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-50 mb-4">
                  <CircleAlert className="w-16 h-16 text-yellow-500" />
                </div>
                <h1 className="text-2xl font-bold text-yellow-900 mb-2">Link Expired</h1>
                <p className="text-yellow-800 mb-6">
                  This verification link has expired. Please register again to receive a new
                  verification email.
                </p>
                <Button
                  onClick={() => navigate('/registration')}
                  fullWidth
                  variant="outline"
                  className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
                >
                  Register Again
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
