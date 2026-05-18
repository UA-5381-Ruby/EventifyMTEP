import { type TextareaHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={cn(
            'w-full rounded-md border bg-white text-neutral-900',
            'px-3 py-2 text-base resize-y',
            'transition-colors duration-200',
            'placeholder:text-neutral-400',
            error
              ? 'border-error-500 focus:border-error-500 focus:ring-error-500'
              : 'border-neutral-300 focus:border-primary-500 focus:ring-primary-500',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />

        {error && <p className="text-sm text-error-600">{error}</p>}
        {!error && hint && <p className="text-sm text-neutral-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
