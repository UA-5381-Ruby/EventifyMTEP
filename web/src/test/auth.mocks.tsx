import React from 'react';

export const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  MemoryRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('../components/layout', () => ({
  PageWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock('../components/ui', () => ({
  Input: ({
            label,
            type = 'text',
            placeholder,
            value,
            onChange,
            required,
            className,
          }: {
    label: string;
    type?: string;
    placeholder?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    required?: boolean;
    className?: string;
  }) => (
    <div>
      <label htmlFor={label}>{label}</label>
      <input
        id={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={className}
        data-testid={`input-${label.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </div>
  ),
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
  EyeIcon: () => <span data-testid="eye-icon">👁</span>,
  EyeOffIcon: () => <span data-testid="eye-off-icon">🙈</span>,
}));
