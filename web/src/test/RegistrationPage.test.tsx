import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { mockNavigate } from './auth.mocks';
import { RegistrationPage } from '../pages/RegistrationPage';
import authService from '../services/authService';

const renderRegistration = () => render(<RegistrationPage/>);

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

  it('updates name field on change', () => {
    renderRegistration();
    const nameInput = screen.getByTestId('input-name');
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    expect(nameInput).toHaveValue('John Doe');
  });

  it('updates email field on change', () => {
    renderRegistration();
    const emailInput = screen.getByTestId('input-e-mail-address');
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    expect(emailInput).toHaveValue('john@example.com');
  });

  it('updates password field on change', () => {
    renderRegistration();
    const passwordInput = screen.getByTestId('input-password');
    fireEvent.change(passwordInput, { target: { value: 'pass1234' } });
    expect(passwordInput).toHaveValue('pass1234');
  });

  it('password field is of type password by default', () => {
    renderRegistration();
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when eye button is clicked', () => {
    renderRegistration();
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');

    fireEvent.click(toggleBtn);
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'text');
    expect(screen.getByTestId('eye-off-icon')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /hide password/i }));
    expect(screen.getByTestId('input-password')).toHaveAttribute('type', 'password');
  });

  it('renders "Remember me" checkbox', () => {
    renderRegistration();
    expect(screen.getByLabelText(/remember me/i)).toBeInTheDocument();
  });

  it('toggles "Remember me" checkbox', () => {
    renderRegistration();
    const checkbox = screen.getByLabelText(/remember me/i);
    expect(checkbox).not.toBeChecked();
    fireEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('renders "Forgot Password?" button', () => {
    renderRegistration();
    expect(screen.getByRole('button', { name: /forgot password/i })).toBeInTheDocument();
  });

  it('navigates to /forgot-password when "Forgot Password?" is clicked', () => {
    renderRegistration();
    fireEvent.click(screen.getByRole('button', { name: /forgot password/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });

  it('renders the "Log In" link', () => {
    renderRegistration();
    expect(screen.getByRole('button', { name: /^log in$/i })).toBeInTheDocument();
  });

  it('navigates to /login when "Log In" link is clicked', () => {
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

  it('does not navigate when authService.register throws', async () => {
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
