interface ResendLinkProps {
  resendState: 'idle' | 'loading' | 'sent';
  onResend: () => void;
}

export function ResendLink({ resendState, onResend }: ResendLinkProps) {
  return (
    <div className="text-sm text-neutral-500 mt-4" aria-live="polite">
      {resendState === 'sent' ? (
        <p className="text-green-600">Verification email sent!</p>
      ) : (
        <p>
          Didn't receive the email?{' '}
          <button
            type="button"
            onClick={onResend}
            disabled={resendState === 'loading'}
            className="text-blue-500 underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendState === 'loading' ? 'Sending...' : 'Resend'}
          </button>
        </p>
      )}
    </div>
  );
}
