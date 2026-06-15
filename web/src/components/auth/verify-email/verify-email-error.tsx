import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';
import { ResendLink } from '@/components/auth/resend-link';

interface VerifyEmailErrorProps {
  message: string;
  resendState: 'idle' | 'loading' | 'sent';
  onResend: () => void;
}

export function VerifyEmailError({ message, resendState, onResend }: VerifyEmailErrorProps) {
  const navigate = useNavigate();

  return (
    <>
      <AuthIconHeader
        icon={<XCircle className="w-16 h-16 text-red-500" />}
        iconBg="bg-red-50"
        title="Verification Failed"
        titleColor="text-red-900"
        description={message}
        descriptionColor="text-red-800"
      />
      <div className="space-y-2">
        <Button
          onClick={() => navigate('/register')}
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
      <ResendLink resendState={resendState} onResend={onResend} />
    </>
  );
}
