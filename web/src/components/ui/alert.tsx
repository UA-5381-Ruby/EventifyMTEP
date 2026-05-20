import { type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

const alertStyles: Record<AlertVariant, string> = {
  info: 'bg-primary-50 border-primary-200 text-primary-800',
  success: 'bg-success-50 border-success-100 text-success-700',
  warning: 'bg-warning-50 border-warning-100 text-warning-700',
  error: 'bg-error-50 border-error-100 text-error-700',
};

const icons: Record<AlertVariant, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

export function Alert({
  variant = 'info',
  title,
  onClose,
  className,
  children,
  ...props
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('flex gap-3 rounded-lg border p-4', alertStyles[variant], className)}
      {...props}
    >
      <span className="text-lg shrink-0">{icons[variant]}</span>

      <div className="flex-1">
        {title && <p className="font-semibold mb-1">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
