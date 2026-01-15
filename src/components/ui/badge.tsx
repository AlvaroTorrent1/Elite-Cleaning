import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

/**
 * Badge Component - Elite Cleaning
 * 
 * Variantes principales usando colores corporativos:
 * - primary: Rosa corporativo
 * - secondary: Lila
 * - muted: Gris neutro
 * - Estados: success, warning, danger, info
 */
const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium border',
  {
    variants: {
      variant: {
        // Colores corporativos
        default: 'bg-muted text-muted-foreground border-transparent',
        primary: 'bg-primary/10 text-primary border-primary/20',
        secondary: 'bg-secondary/10 text-secondary border-secondary/20',
        
        // Estados semánticos
        success: 'bg-success/10 text-success border-success/20',
        warning: 'bg-warning/10 text-warning border-warning/20',
        danger: 'bg-destructive/10 text-destructive border-destructive/20',
        info: 'bg-info/10 text-info border-info/20',
        
        // Variantes alternativas
        muted: 'bg-muted text-muted-foreground border-border',
        outline: 'bg-transparent text-foreground border-border',
        
        // Colores sólidos (para énfasis)
        'primary-solid': 'bg-primary text-primary-foreground border-transparent',
        'secondary-solid': 'bg-secondary text-secondary-foreground border-transparent',
        'success-solid': 'bg-success text-success-foreground border-transparent',
        'danger-solid': 'bg-destructive text-destructive-foreground border-transparent',
      },
      size: {
        xs: 'px-1.5 py-0.5 text-[10px] rounded',
        sm: 'px-2 py-0.5 text-xs rounded-md',
        md: 'px-2.5 py-1 text-xs rounded-full',
        lg: 'px-3 py-1.5 text-sm rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, icon, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {icon}
      {children}
    </span>
  )
}

// Pre-configured badges for common use cases
const StatusBadge = {
  Pending: () => <Badge variant="warning">Pendiente</Badge>,
  InProgress: () => <Badge variant="primary">En Curso</Badge>,
  Completed: () => <Badge variant="success">Completada</Badge>,
  Cancelled: () => <Badge variant="danger">Cancelada</Badge>,
  Assigned: () => <Badge variant="info">Asignada</Badge>,
  Reviewed: () => <Badge variant="success">Revisado</Badge>,
  Active: () => <Badge variant="success">Activo</Badge>,
  Inactive: () => <Badge variant="muted">Inactivo</Badge>,
}

const RoleBadge = {
  Admin: () => <Badge variant="secondary">Admin</Badge>,
  Cleaner: () => <Badge variant="primary">Limpiadora</Badge>,
  PropertyManager: () => <Badge variant="success">Property Manager</Badge>,
}

export { Badge, badgeVariants, StatusBadge, RoleBadge }
