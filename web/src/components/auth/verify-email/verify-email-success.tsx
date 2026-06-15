import { useNavigate } from 'react-router-dom';
import { CircleCheck } from 'lucide-react';
import { Button } from '@/components/ui';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';
import { ResendLink } from '@/components/auth/resend-link';

interface VerifyEmailSuccessProps {
  resendState: 'idle' | 'loading' | 'sent';
  onResend: () => void;
}

export function VerifyEmailSuccess({ resendState, onResend }: VerifyEmailSuccessProps) {
  const navigate = useNavigate();

  return (
    <>
      <AuthIconHeader
        icon={<CircleCheck className="w-16 h-16 text-green-500" />}
        iconBg="bg-green-50"
        title="Email Verified!"
        titleColor="text-green-900"
        description="Your email has been successfully verified. You can now log in to your account."
        descriptionColor="text-green-800"
      />
      <Button
        onClick={() => navigate('/login')}
        fullWidth
        variant="outline"
        className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
      >
        Go to Login
      </Button>
      <ResendLink resendState={resendState} onResend={onResend} />
    </>
  );
}
