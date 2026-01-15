import { forwardRef, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Form Field Components - Elite Cleaning
 * 
 * Usa los colores del tema:
 * - focus:ring-primary para el focus ring rosa
 * - border-input para bordes
 * - text-foreground para texto
 */

// Base input styles using theme colors
const inputBaseStyles =
  'w-full px-3 py-2 bg-background border border-input rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed'

const inputErrorStyles = 'border-destructive focus:ring-destructive'

// Label component
interface LabelProps {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
  className?: string
}

function Label({ children, htmlFor, required, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('block text-sm font-medium text-foreground mb-1', className)}
    >
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

// Error message component
interface ErrorMessageProps {
  children?: React.ReactNode
  className?: string
}

function ErrorMessage({ children, className }: ErrorMessageProps) {
  if (!children) return null
  return (
    <p className={cn('text-sm text-destructive mt-1', className)}>{children}</p>
  )
}

// Hint text component
interface HintProps {
  children: React.ReactNode
  className?: string
}

function Hint({ children, className }: HintProps) {
  return (
    <p className={cn('text-xs text-muted-foreground mt-1', className)}>{children}</p>
  )
}

// Input component
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className, required, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div>
        {label && (
          <Label htmlFor={inputId} required={required}>
            {label}
          </Label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            required={required}
            className={cn(
              inputBaseStyles,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && inputErrorStyles,
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <Hint>{hint}</Hint>}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Select component
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: Array<{ value: string; label: string }> | string[]
  placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, required, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div>
        {label && (
          <Label htmlFor={selectId} required={required}>
            {label}
          </Label>
        )}
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={cn(inputBaseStyles, error && inputErrorStyles, className)}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value
            const label = typeof option === 'string' ? option : option.label
            return (
              <option key={value} value={value}>
                {label}
              </option>
            )
          })}
        </select>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <Hint>{hint}</Hint>}
      </div>
    )
  }
)

Select.displayName = 'Select'

// Textarea component
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, required, id, rows = 4, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div>
        {label && (
          <Label htmlFor={textareaId} required={required}>
            {label}
          </Label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          required={required}
          rows={rows}
          className={cn(inputBaseStyles, error && inputErrorStyles, className)}
          {...props}
        />
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {hint && !error && <Hint>{hint}</Hint>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

// Checkbox component
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  description?: string
  error?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className, id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div>
        <div className="flex items-start gap-3">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className={cn(
              'w-4 h-4 text-primary border-input rounded focus:ring-primary mt-0.5',
              className
            )}
            {...props}
          />
          <div>
            <label htmlFor={checkboxId} className="text-sm font-medium text-foreground">
              {label}
            </label>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        {error && <ErrorMessage className="ml-7">{error}</ErrorMessage>}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Label, ErrorMessage, Hint, Input, Select, Textarea, Checkbox }
