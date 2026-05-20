import React from 'react';

export const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('@/components/layout', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('@/components/ui', () => ({
  Modal: ({
    onClose,
    title,
    children,
  }: {
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
  }) => (
    <div role="dialog">
      <button type="button" aria-label="Close modal" onClick={onClose} />
      <h2>{title}</h2>
      {children}
    </div>
  ),

  Input: ({
    label,
    type = 'text',
    placeholder,
    value,
    onChange,
    required,
    className,
    id,
  }: {
    label?: string;
    id?: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
    className?: string;
  }) => {
    const inputId = id ?? label;
    const testId = label
      ? `input-${label.toLowerCase().replace(/\s+/g, '-')}`
      : placeholder
        ? `input-${placeholder.toLowerCase().replace(/\s+/g, '-')}`
        : undefined;
    return (
      <div>
        {label && <label htmlFor={inputId}>{label}</label>}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className={className}
          data-testid={testId}
        />
      </div>
    );
  },

  Button: ({
    children,
    type,
    ...rest
  }: {
    children: React.ReactNode;
    type?: 'submit' | 'button' | 'reset';
    [key: string]: unknown;
  }) => (
    <button type={type} {...rest}>
      {children}
    </button>
  ),

  Checkbox: ({
    label,
    checked,
    onChange,
  }: {
    label: string;
    checked: boolean;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
  }) => (
    <label>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  ),
}));

jest.mock('@/components/auth', () => {
  const ForgotPasswordModal = ({
    isOpen,
    onClose,
    onSuccess,
    onNavigateToLogin,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (email: string) => void;
    onNavigateToLogin: () => void;
  }) => {
    const [email, setEmail] = React.useState('');
    if (!isOpen) return null;
    return (
      <div role="dialog">
        <button type="button" aria-label="Close modal" onClick={onClose} />
        <h2>Forgot Password</h2>
        <form
          onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
            e.preventDefault();
            if (email.trim()) onSuccess(email);
          }}
        >
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
          {email && <button type="button" aria-label="Clear input" onClick={() => setEmail('')} />}
          <button type="submit">Send</button>
        </form>
        <button type="button" onClick={onNavigateToLogin}>
          Return to sign in
        </button>
      </div>
    );
  };

  const ResetPasswordModal = ({
    isOpen,
    onClose,
    onResetComplete,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onResetComplete: () => void;
  }) => {
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [error, setError] = React.useState('');

    if (!isOpen) return null;

    const isFormValid = password.length > 0 && confirmPassword.length > 0;

    return (
      <div role="dialog">
        <button type="button" aria-label="Close modal" onClick={onClose} />
        <h2>Reset Password</h2>
        <form
          onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError('');
            if (password !== confirmPassword) {
              setError("Your password doesn't match");
              return;
            }
            onResetComplete();
          }}
        >
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
          <button type="button" onClick={() => setShowPassword((v: boolean) => !v)}>
            <svg />
          </button>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setConfirmPassword(e.target.value);
              if (error) setError('');
            }}
            required
          />
          {confirmPassword && (
            <button type="button" aria-label="✕" onClick={() => setConfirmPassword('')}>
              ✕
            </button>
          )}
          {error && <p>{error}</p>}
          <button type="submit" disabled={!isFormValid}>
            Reset password
          </button>
        </form>
      </div>
    );
  };

  return {
    ForgotPasswordModal,
    ResetPasswordModal,
    EyeIcon: () => React.createElement('span', { 'data-testid': 'eye-icon' }),
    EyeOffIcon: () => React.createElement('span', { 'data-testid': 'eye-off-icon' }),
  };
});
