import { cn } from '@/lib/utils/cn'
import { cva, type VariantProps } from 'class-variance-authority'

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-medium',
  {
    variants: {
      variant: {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-blue-100 text-blue-700',
        secondary: 'bg-purple-100 text-purple-700',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-red-100 text-red-700',
        info: 'bg-cyan-100 text-cyan-700',
        orange: 'bg-orange-100 text-orange-700',
        pink: 'bg-pink-100 text-pink-700',
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
  Inactive: () => <Badge variant="default">Inactivo</Badge>,
}

const RoleBadge = {
  Admin: () => <Badge variant="secondary">Admin</Badge>,
  Cleaner: () => <Badge variant="primary">Limpiadora</Badge>,
  PropertyManager: () => <Badge variant="success">Property Manager</Badge>,
}

export { Badge, badgeVariants, StatusBadge, RoleBadge }
