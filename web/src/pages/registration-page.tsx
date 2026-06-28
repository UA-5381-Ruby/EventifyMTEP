import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { Eye, EyeOff } from 'lucide-react';
import authService from '@/services/auth-service';

export function RegistrationPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'loading' | 'sent'>('idle');

  const handleResend = async () => {
    if (resendState === 'loading') return;
    setResendState('loading');
    try {
      await authService.resendEmailVerification(email);
      setResendState('sent');
    } catch {
      setResendState('idle');
    }
  };
  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      await authService.register({ name, email, password });
      authService.logout();
      setRegistrationSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  if (registrationSuccess) {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="w-full max-w-[960px] min-h-[640px] flex flex-col md:flex-row rounded-3xl overflow-hidden bg-[#d8e7ff] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] border border-white/60 relative z-10">
            <div className="w-full md:w-[55%] bg-white md:rounded-r-[3.5rem] p-8 sm:p-12 flex flex-col justify-center relative z-20 shrink-0 shadow-[12px_0_40px_rgba(59,130,246,0.08)] border-r border-blue-50/50">
              <div className="text-center space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h1
                    className="text-2xl font-bold text-green-900 mb-2"
                    tabIndex={-1}
                    ref={(el) => el?.focus()}
                  >
                    Account Created!
                  </h1>
                  <p className="text-green-800 mb-4">We've sent a verification email to:</p>
                  <p className="text-lg font-semibold text-green-900 mb-6">{email}</p>
                  <p className="text-sm text-green-700 mb-6">
                    Please check your inbox and click the verification link to activate your
                    account. The link will expire in 24 hours.
                  </p>
                  <p className="text-xs text-green-600">
                    {resendState === 'sent' ? (
                      <span>Verification email sent! Check your inbox.</span>
                    ) : (
                      <>
                        Didn't receive the email?{' '}
                        <button
                          onClick={handleResend}
                          disabled={resendState === 'loading'}
                          className="underline hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {resendState === 'loading' ? 'Sending...' : 'Resend'}
                        </button>
                      </>
                    )}
                  </p>
                </div>

                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                  variant="outline"
                  className="h-11 text-base shadow-sm shadow-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-50"
                >
                  Go to Login
                </Button>
              </div>
            </div>

            <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden bg-[#d8e7ff]">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff50_1px,transparent_1px),linear-gradient(to_bottom,#ffffff50_1px,transparent_1px)] bg-[size:32px_32px]" />
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="w-full max-w-[960px] min-h-[640px] flex flex-col md:flex-row rounded-3xl overflow-hidden bg-[#d8e7ff] shadow-[0_20px_60px_-15px_rgba(59,130,246,0.15)] border border-white/60 relative z-10">
          <div className="w-full md:w-[55%] bg-white md:rounded-r-[3.5rem] p-8 sm:p-12 flex flex-col justify-center relative z-20 shrink-0 shadow-[12px_0_40px_rgba(59,130,246,0.08)] border-r border-blue-50/50">
            <h1 className="text-3xl font-bold text-neutral-900 text-center mb-10 tracking-tight">
              Registration
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Name"
                placeholder="Enter your name"
                value={name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                autoComplete="name"
                required
              />

              <Input
                label="E-mail Address"
                type="email"
                placeholder="Enter your e-mail"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />

              <div className="space-y-1.5 relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              <div className="space-y-1.5 relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setConfirmPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 bottom-2.5 text-neutral-400 hover:text-neutral-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-sm"
                  aria-label={
                    showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'
                  }
                >
                  {showConfirmPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-700 text-center -mt-2" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                fullWidth
                variant="outline"
                className="mt-2 h-11 text-base shadow-sm shadow-blue-500/10 border-blue-500 text-blue-500 hover:bg-blue-50"
              >
                Create Account
              </Button>
            </form>

            <p className="mt-8 text-sm text-neutral-500 text-left">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-medium text-neutral-900 hover:underline"
              >
                Log In
              </button>
            </p>
          </div>

          <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden bg-[#d8e7ff]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff50_1px,transparent_1px),linear-gradient(to_bottom,#ffffff50_1px,transparent_1px)] bg-[size:32px_32px]" />
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
