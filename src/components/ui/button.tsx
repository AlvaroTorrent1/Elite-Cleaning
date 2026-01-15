import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Button Component - Elite Cleaning
 * 
 * Variantes principales:
 * - primary: Rosa corporativo (color principal de la marca)
 * - secondary: Lila (color secundario)
 * - outline: Borde rosa, fondo transparente
 * - ghost: Sin fondo, hover sutil
 * - danger/success/warning: Estados semánticos
 */
const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        // Colores corporativos
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary shadow-sm',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary shadow-sm',
        
        // Variantes sutiles
        outline: 'border-2 border-primary bg-transparent text-primary hover:bg-primary/10 focus:ring-primary',
        ghost: 'bg-transparent text-foreground hover:bg-muted focus:ring-primary',
        link: 'bg-transparent text-primary hover:text-primary/80 hover:underline focus:ring-primary p-0',
        
        // Estados semánticos
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 focus:ring-destructive shadow-sm',
        success: 'bg-success text-success-foreground hover:bg-success/90 focus:ring-success shadow-sm',
        warning: 'bg-warning text-warning-foreground hover:bg-warning/90 focus:ring-warning shadow-sm',
        
        // Variante muted (gris suave)
        muted: 'bg-muted text-muted-foreground hover:bg-muted/80 focus:ring-muted',
      },
      size: {
        xs: 'px-2 py-1 text-xs rounded',
        sm: 'px-3 py-1.5 text-sm rounded-md',
        md: 'px-4 py-2 text-sm rounded-lg',
        lg: 'px-6 py-3 text-base rounded-lg',
        xl: 'px-8 py-4 text-lg rounded-xl',
        icon: 'p-2 rounded-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, fullWidth }), className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
