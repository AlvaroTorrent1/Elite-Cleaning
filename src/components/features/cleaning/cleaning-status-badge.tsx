import { cn } from '@/lib/utils/cn'

/**
 * CleaningStatusBadge - Badge de estado de limpieza
 * 
 * Usa la paleta corporativa rosa/lila para la mayoría de estados,
 * pero mantiene rojo para canceladas ya que es un estado negativo real.
 */

interface CleaningStatusBadgeProps {
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
}

const statusConfig = {
  pending: {
    label: 'Pendiente',
    className: 'bg-muted text-muted-foreground',
  },
  assigned: {
    label: 'Asignada',
    className: 'bg-secondary/10 text-secondary',
  },
  in_progress: {
    label: 'En Curso',
    className: 'bg-primary/10 text-primary',
  },
  completed: {
    label: 'Completada',
    className: 'bg-[#E88BA6]/10 text-[#A66B7C]', // Rosa suave/oscuro
  },
  cancelled: {
    label: 'Cancelada',
    className: 'bg-destructive/10 text-destructive',
  },
}

export function CleaningStatusBadge({ status }: CleaningStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  )
}
