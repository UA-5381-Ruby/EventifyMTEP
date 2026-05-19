import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { LoginPage } from '@/pages/LoginPage';
import authService from '@/services/authService';

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
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('updates email field on change', () => {
    renderLogin();
    const emailInput = screen.getByTestId('input-e-mail-address');
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect(emailInput).toHaveValue('user@example.com');
  });

  it('updates password field on change', () => {
    renderLogin();
    const passwordInput = screen.getByTestId('input-password');
    fireEvent.change(passwordInput, { target: { value: 'secret123' } });
    expect(passwordInput).toHaveValue('secret123');
  });

  it('password field is of type password by default', () => {
    renderLogin();
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when eye button is clicked', () => {
    renderLogin();
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
    expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('renders "Remember me" checkbox', () => {
    renderLogin();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('toggles "Remember me" checkbox', () => {
    renderLogin();
    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('renders "Forgot Password?" button', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('navigates to /forgot-password when "Forgot Password?" is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('renders the "Sign Up" link', () => {
    renderLogin();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });

  it('navigates to /register when "Sign Up" is clicked', () => {
    renderLogin();
    fireEvent.click(screen.getByRole('button', { name: /sign up/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/register');
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
      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'secret123',
      });
    });
  });

  it('navigates to /dashboard after successful login', async () => {
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
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });
  });

  it('does not navigate when authService.login throws', async () => {
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
    expect(mockNavigate).not.toHaveBeenCalledWith('/dashboard', expect.anything());
  });
});
