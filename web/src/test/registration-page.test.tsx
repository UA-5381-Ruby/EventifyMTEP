import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { RegistrationPage } from '@/pages/registration-page';
import authService from '@/services/auth-service';

const renderRegistration = () => render(<RegistrationPage />);

const fillForm = ({
  name = 'Bob',
  email = 'b@b.com',
  password = 'pass1234',
  confirmPassword = 'pass1234',
} = {}) => {
  fireEvent.change(screen.getByRole('textbox', { name: /^name$/i }), {
    target: { value: name },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /e-mail address/i }), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/^password$/i), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
    target: { value: confirmPassword },
  });
};

const fillAndSubmit = (overrides?: Parameters<typeof fillForm>[0]) => {
  fillForm(overrides);
  fireEvent.click(screen.getByRole('button', { name: /create account/i }));
};

describe('RegistrationPage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the heading', () => {
    renderRegistration();
    expect(screen.getByRole('heading', { name: /registration/i })).toBeInTheDocument();
  });

  it('renders name, email, password, and confirm password inputs', () => {
    renderRegistration();
    expect(screen.getByRole('textbox', { name: /^name$/i })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /e-mail address/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
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
    const input = screen.getByRole('textbox', { name: /^name$/i });
    fireEvent.change(input, { target: { value: 'John Doe' } });
    expect(input).toHaveValue('John Doe');
  });

  it('updates email field on change', () => {
    renderRegistration();
    const input = screen.getByRole('textbox', { name: /e-mail address/i });
    fireEvent.change(input, { target: { value: 'john@example.com' } });
    expect(input).toHaveValue('john@example.com');
  });

  it('updates password field on change', () => {
    renderRegistration();
    const input = screen.getByLabelText(/^password$/i);
    fireEvent.change(input, { target: { value: 'pass1234' } });
    expect(input).toHaveValue('pass1234');
  });

  it('updates confirm password field on change', () => {
    renderRegistration();
    const input = screen.getByLabelText(/^confirm password$/i);
    fireEvent.change(input, { target: { value: 'pass1234' } });
    expect(input).toHaveValue('pass1234');
  });

  it('password field is of type password by default', () => {
    renderRegistration();
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
  });

  it('confirm password field is of type password by default', () => {
    renderRegistration();
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveAttribute('type', 'password');
  });

  it('toggles password to visible when show-password button is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^show password$/i }));
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'text');
  });

  it('toggles password back to hidden on second click', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^show password$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^hide password$/i }));
    expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('type', 'password');
  });

  it('toggles confirm password to visible when show-confirm-password button is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^show confirm password$/i }));
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveAttribute('type', 'text');
  });

  it('toggles confirm password back to hidden on second click', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^show confirm password$/i }));
    fireEvent.click(screen.getByRole('button', { name: /^hide confirm password$/i }));
    expect(screen.getByLabelText(/^confirm password$/i)).toHaveAttribute('type', 'password');
  });

  it('navigates to /login when "Log In" is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /^log in$/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error and does not call register when passwords do not match', async () => {
    renderRegistration();
    fillAndSubmit({ confirmPassword: 'different' });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match.');
    });
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('clears password mismatch error on next submit when passwords match', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();

    fillAndSubmit({ confirmPassword: 'wrong' });
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    fillAndSubmit();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('calls authService.register with correct data when passwords match', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();
    fillAndSubmit({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'pass1234',
      confirmPassword: 'pass1234',
    });

    await waitFor(() => {
      expect(authService.register).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'pass1234',
      });
    });
  });

  it('calls authService.logout after successful registration to clear the session', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();
    fillAndSubmit();

    await waitFor(() => {
      expect(authService.logout).toHaveBeenCalledTimes(1);
    });
  });

  it('shows success screen with the submitted email after registration', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();
    fillAndSubmit({ email: 'john@example.com' });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /account created/i })).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('navigates to /login when "Go to Login" is clicked on the success screen', async () => {
    (authService.register as jest.Mock).mockResolvedValueOnce({});
    renderRegistration();
    fillAndSubmit();

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /go to login/i })).toBeInTheDocument()
    );

    fireEvent.click(screen.getByRole('button', { name: /go to login/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('shows error message when registration fails', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce(new Error('Email already taken'));
    renderRegistration();
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email already taken');
    });
  });

  it('shows generic fallback error when register rejects with a non-Error value', async () => {
    (authService.register as jest.Mock).mockRejectedValueOnce('plain string rejection');
    renderRegistration();
    fillAndSubmit();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Registration failed. Please try again.');
    });
  });

  it('clears error message on new submit attempt', async () => {
    (authService.register as jest.Mock)
      .mockRejectedValueOnce(new Error('Email already taken'))
      .mockResolvedValueOnce({});
    renderRegistration();

    fillAndSubmit();
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());

    fillAndSubmit();
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});
