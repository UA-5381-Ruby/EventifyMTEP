import { useState, type ChangeEvent, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input, Button, Checkbox } from '@/components/ui';
import { PageWrapper } from '@/components/layout';
import { EyeIcon, EyeOffIcon } from '@/components/auth';
import authService from '@/services/auth-service';

export function RegistrationPage() {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    try {
      await authService.register({ name, email, password }, rememberMe);
      navigate('/events', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#94a3b81a_1px,transparent_1px),linear-gradient(to_bottom,#94a3b81a_1px,transparent_1px)] bg-[size:24px_24px]" />

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
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <Checkbox
                  label="Remember me"
                  checked={rememberMe}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setRememberMe(e.target.checked)}
                />
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center -mt-2" role="alert">
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
