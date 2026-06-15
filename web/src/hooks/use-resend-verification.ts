import { useState } from 'react';
import authService from '@/services/auth-service';

export function useResendVerification(token: string | null) {
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const handleResend = async () => {
    if (!token || resendState === 'loading') return;

    setResendState('loading');
    try {
      await authService.resendEmailVerification(token);
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };

  return { resendState, handleResend };
}
