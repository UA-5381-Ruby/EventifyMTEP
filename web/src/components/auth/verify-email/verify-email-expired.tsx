import { useNavigate } from 'react-router-dom';
import { CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';
import { ResendLink } from '@/components/auth/resend-link';

interface VerifyEmailExpiredProps {
  resendState: 'idle' | 'loading' | 'sent';
  onResend: () => void;
}

export function VerifyEmailExpired({ resendState, onResend }: VerifyEmailExpiredProps) {
  const navigate = useNavigate();

  return (
    <>
      <AuthIconHeader
        icon={<CircleAlert className="w-16 h-16 text-yellow-500" />}
        iconBg="bg-yellow-50"
        title="Link Expired"
        titleColor="text-yellow-900"
        description="This verification link has expired. Please register again to receive a new verification email."
        descriptionColor="text-yellow-800"
      />
      <Button
        onClick={() => navigate('/register')}
        fullWidth
        variant="outline"
        className="border-neutral-300 text-neutral-700 hover:bg-gray-50"
      >
        Register Again
      </Button>
      <ResendLink resendState={resendState} onResend={onResend} />
    </>
  );
}
