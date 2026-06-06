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

  it('calls authService.login with rememberMe = true', async () => {
    (authService.login as jest.Mock).mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'secret123' },
    });

    fireEvent.click(screen.getByLabelText(/remember me/i));
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith(
        {
          email: 'user@example.com',
          password: 'secret123',
        },
        true
      );
    });
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
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows error message when login fails', async () => {
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
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials');
    });
  });

  it('clears error message on new submit attempt', async () => {
    (authService.login as jest.Mock)
      .mockRejectedValueOnce(new Error('Invalid credentials'))
      .mockResolvedValueOnce({});
    renderLogin();

    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), {
      target: { value: 'wrongpass' },
    });
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
