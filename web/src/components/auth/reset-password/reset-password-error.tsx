import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';

interface ResetPasswordErrorProps {
  message: string;
}

export function ResetPasswordError({ message }: ResetPasswordErrorProps) {
  const navigate = useNavigate();

  return (
    <>
      <AuthIconHeader
        icon={<span className="text-3xl">✕</span>}
        iconBg="bg-red-50"
        title="Invalid Link"
        titleColor="text-red-900"
        description={message}
        descriptionColor="text-red-800"
      />
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
    </>
  );
}
