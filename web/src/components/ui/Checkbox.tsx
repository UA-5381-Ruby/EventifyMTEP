import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '../../lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkId = id || `checkbox-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkId}
          className={cn(
            'flex items-center gap-2 cursor-pointer',
            props.disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkId}
            className={cn(
              'h-4 w-4 rounded border-neutral-300',
              'text-primary-500 focus:ring-primary-500',
              'transition-colors duration-200',
              error && 'border-error-500',
              className
            )}
            {...props}
          />
          {label && (
            <span className="text-sm text-neutral-700 select-none">{label}</span>
          )}
        </label>
        {error && <p className="text-sm text-error-600 ml-6">{error}</p>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'


// ── Radio (окремий компонент в тому ж файлі) ─────────────
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, className, id, ...props }, ref) => {
    const radioId = id || `radio-${label?.toLowerCase().replace(/\s+/g, '-')}`

    return (
      <label
        htmlFor={radioId}
        className={cn(
          'flex items-center gap-2 cursor-pointer',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={cn(
            'h-4 w-4 border-neutral-300',
            'text-primary-500 focus:ring-primary-500',
            className
          )}
          {...props}
        />
        {label && (
          <span className="text-sm text-neutral-700 select-none">{label}</span>
        )}
      </label>
    )
  }
)

Radio.displayName = 'Radio'