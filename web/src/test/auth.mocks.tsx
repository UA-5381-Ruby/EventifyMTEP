import React from 'react';

export const mockNavigate = jest.fn();
export const mockUseSearchParams = jest.fn(() => [new URLSearchParams(), jest.fn()]);
let errorSpy: jest.SpyInstance;

beforeEach(() => {
  errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  errorSpy.mockRestore();
});

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useSearchParams: mockUseSearchParams, // ← без обгортки
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('@/services/auth-service', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
  },
}));

jest.mock('@/components/layout', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('lucide-react', () => ({
  Eye: () => <span data-testid="eye-icon" />,
  EyeOff: () => <span data-testid="eye-off-icon" />,
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
