import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { LoginPage } from '@/pages/login-page';
import authService from '@/services/auth-service';

const renderLogin = () => render(<LoginPage />);

describe('LoginPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the heading', () => {
    renderLogin();
    expect(screen.getByRole('heading', { name: /log in/i })).toBeInTheDocument();
  });

  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByTestId('input-e-mail-address')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('renders "Remember me" checkbox', () => {
    renderLogin();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('renders "Forgot Password?" button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('renders the "Sign Up" button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('updates email field on change', () => {
    renderLogin();
    const input = screen.getByTestId('input-e-mail-address');
    fireEvent.change(input, { target: { value: 'user@example.com' } });
    expect(input).toHaveValue('user@example.com');
  });

  it('updates password field on change', () => {
    renderLogin();
    const input = screen.getByTestId('input-password');
    fireEvent.change(input, { target: { value: 'secret123' } });
    expect(input).toHaveValue('secret123');
  });

  it('password field is of type password by default', () => {
    renderLogin();
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('toggles password to visible when eye button is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
  });

  it('toggles password back to hidden on second click', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('"Remember me" checkbox is unchecked by default', () => {
    renderLogin();
    expect(screen.getByLabelText(/remember me/i)).not.toBeChecked();
  });

  it('toggles "Remember me" checkbox on click', () => {
    renderLogin();
    const checkbox = screen.getByLabelText(/remember me/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('navigates to /register when "Sign Up" is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('does not show ForgotPasswordModal by default', () => {
    renderLogin();
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('opens ForgotPasswordModal when "Forgot Password?" is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('clears email via clear button in ForgotPasswordModal', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(emailInput).toHaveValue('user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /clear input/i }));
    expect(emailInput).toHaveValue('');
  });

  it('closes ForgotPasswordModal when "Return to sign in" is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.click(screen.getByRole('button', { name: /return to sign in/i }));
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('closes ForgotPasswordModal via backdrop close button', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('does not call onSuccess when ForgotPasswordModal is submitted with empty email', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.submit(screen.getByRole('button', { name: /^send$/i }).closest('form')!);
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('does not show ResetPasswordModal by default', () => {
    renderLogin();
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('opens ResetPasswordModal after ForgotPassword form is submitted', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  });

  it('closes ResetPasswordModal via backdrop close button', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('closes ResetPasswordModal when onResetComplete is triggered', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newPass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
      target: { value: 'newPass123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('shows error when passwords do not match in ResetPasswordModal', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newPass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
      target: { value: 'different456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    expect(screen.getByText(/your password doesn't match/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  });

  it('clears password mismatch error when confirmPassword is changed', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    fireEvent.change(screen.getByPlaceholderText('Enter new password'), {
      target: { value: 'newPass123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
      target: { value: 'different456' },
    });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(screen.getByText(/your password doesn't match/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Re-enter new password'), {
      target: { value: 'newPass123' },
    });
    expect(screen.queryByText(/your password doesn't match/i)).not.toBeInTheDocument();
  });

  it('toggles password visibility in ResetPasswordModal', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    const passwordInput = screen.getByPlaceholderText('Enter new password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const eyeButtons = screen
      .getAllByRole('button')
      .filter((btn) => !btn.textContent && btn.querySelector('svg'));
    fireEvent.click(eyeButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('clears confirmPassword via clear button in ResetPasswordModal', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    const confirmInput = screen.getByPlaceholderText('Re-enter new password');
    fireEvent.change(confirmInput, { target: { value: 'somePass' } });
    expect(confirmInput).toHaveValue('somePass');

    fireEvent.click(screen.getByRole('button', { name: /✕/ }));
    expect(confirmInput).toHaveValue('');
  });

  it('calls authService.login with correct credentials on submit', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        {
          email: 'user@example.com',
          password: 'secret123',
        },
        false
      );
    });
  });

  it('navigates to /events after successful login', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'secret123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/events', { replace: true });
    });
  });

  it('does not navigate to /events when login throws', async () => {
    (authService.login as jest.Mock).mockRejectedValueOnce(new Error('Invalid credentials'));
    renderLogin();

    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/events', expect.anything());
  });
});
