import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { RegistrationPage } from '../pages/RegistrationPage';
import authService from '../services/authService';

const renderRegistration = () => render(<RegistrationPage />);

describe('RegistrationPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the heading', () => {
    renderRegistration();
    expect(screen.getByRole('heading', { name: /registration/i })).toBeInTheDocument();
  });

  it('renders name, email, and password inputs', () => {
    renderRegistration();
    expect(screen.getByTestId('input-name')).toBeInTheDocument();
    expect(screen.getByTestId('input-e-mail-address')).toBeInTheDocument();
    expect(screen.getByTestId('input-password')).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    renderRegistration();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
  });

  it('renders the "Remember me" checkbox', () => {
    renderRegistration();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('renders the "Forgot Password?" button', () => {
    renderRegistration();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('renders the "Log In" button', () => {
    renderRegistration();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('updates name field on change', () => {
    renderRegistration();
    const input = screen.getByTestId('input-name');
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(input).toHaveValue('John Doe');
  });

  it('updates email field on change', () => {
    renderRegistration();
    const input = screen.getByTestId('input-e-mail-address');
    fireEvent.change(input, { target: { value: 'john@example.com' } });
    expect(input).toHaveValue('john@example.com');
  });

  it('updates password field on change', () => {
    renderRegistration();
    const input = screen.getByTestId('input-password');
    fireEvent.change(input, { target: { value: 'pass1234' } });
    expect(input).toHaveValue('pass1234');
  });

  it('password field is of type password by default', () => {
    renderRegistration();
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('toggles password to visible when eye button is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();
  });

  it('toggles password back to hidden on second click', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /show password/i }));
    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('"Remember me" checkbox is unchecked by default', () => {
    renderRegistration();
    expect(screen.getByLabelText(/remember me/i)).not.toBeChecked();
  });

  it('toggles "Remember me" checkbox on click', () => {
    renderRegistration();
    const checkbox = screen.getByLabelText(/remember me/i);
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('does not show ForgotPasswordModal by default', () => {
    renderRegistration();
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('opens ForgotPasswordModal when "Forgot Password?" is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('clears email via clear button in ForgotPasswordModal', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    const emailInput = screen.getByPlaceholderText(/enter your email address/i);
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(emailInput).toHaveValue('user@example.com');
    fireEvent.click(screen.getByRole('button', { name: /clear input/i }));
    expect(emailInput).toHaveValue('');
  });

  it('closes ForgotPasswordModal when "Return to sign in" is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.click(screen.getByRole('button', { name: /return to sign in/i }));
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('closes ForgotPasswordModal via backdrop close button', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByRole('heading', { name: /forgot password/i })).not.toBeInTheDocument();
  });

  it('does not call onSuccess when ForgotPasswordModal is submitted with empty email', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.submit(
      screen.getByRole('button', { name: /^send$/i }).closest('form')!,
    );
    expect(screen.getByRole('heading', { name: /forgot password/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('does not show ResetPasswordModal by default', () => {
    renderRegistration();
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('opens ResetPasswordModal after ForgotPassword form is submitted', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();
  });

  it('closes ResetPasswordModal via backdrop close button', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));
    expect(screen.getByRole('heading', { name: /reset password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /close modal/i }));
    expect(screen.queryByRole('heading', { name: /reset password/i })).not.toBeInTheDocument();
  });

  it('shows error when passwords do not match in ResetPasswordModal', () => {
    renderRegistration();
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
    renderRegistration();
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
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    fireEvent.change(screen.getByPlaceholderText(/enter your email address/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^send$/i }));

    const passwordInput = screen.getByPlaceholderText('Enter new password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const eyeButtons = screen.getAllByRole('button').filter(
      (btn) => !btn.textContent && btn.querySelector('svg'),
    );
    fireEvent.click(eyeButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('shows and clears confirmPassword via clear button in ResetPasswordModal', () => {
    renderRegistration();
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

  it('closes ResetPasswordModal when onResetComplete is triggered', () => {
    renderRegistration();
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

  it('navigates to /login when "Log In" is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('calls authService.register with correct data on submit', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'pass1234',
      });
    });
  });

  it('navigates to /dashboard after successful registration', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('does not navigate to /dashboard when registration throws', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('Email already taken'));
    renderRegistration();

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'taken@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
  });
});
