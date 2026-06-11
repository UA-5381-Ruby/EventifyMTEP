import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import { AuthIconHeader } from '@/components/auth/auth-icon-header';

export function ResetPasswordSuccess() {
  const navigate = useNavigate();

  return (
    <>
      <AuthIconHeader
        icon={<span className="text-3xl">✓</span>}
        iconBg="bg-green-50"
        title="Password Reset!"
        titleColor="text-green-900"
        description="Your password has been successfully reset. You can now log in with your new password."
        descriptionColor="text-green-800"
      />
      <Button
        onClick={() => navigate('/login')}
        fullWidth
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        Go to Login
      </Button>
    </>
  );
}
