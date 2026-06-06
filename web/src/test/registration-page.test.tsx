import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { RegistrationPage } from '@/pages/registration-page';
import authService from '@/services/auth-service';

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

  it('shows error message when registration fails', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('Email already taken'));
    renderRegistration();

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'taken@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already taken');
    });
  });

  it('clears error message on new submit attempt', async () => {
    (authService.register as jest.Mock)
      .mockRejectedValueOnce(new Error('Email already taken'))
      .mockResolvedValueOnce({});
    renderRegistration();

    fireEvent.change(screen.getByTestId('input-name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByTestId('input-e-mail-address'), {
      target: { value: 'taken@example.com' },
    });
    fireEvent.change(screen.getByTestId('input-password'), { target: { value: 'pass1234' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });
});
