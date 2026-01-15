import { LucideIcon, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeConfig = {
  sm: {
    wrapper: 'py-6',
    icon: 'w-8 h-8',
    title: 'text-sm',
    description: 'text-xs',
  },
  md: {
    wrapper: 'py-12',
    icon: 'w-12 h-12',
    title: 'text-base',
    description: 'text-sm',
  },
  lg: {
    wrapper: 'py-16',
    icon: 'w-16 h-16',
    title: 'text-lg',
    description: 'text-base',
  },
}

function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = sizeConfig[size]

  return (
    <div className={cn('text-center', config.wrapper, className)}>
      <Icon className={cn('mx-auto text-gray-300 mb-4', config.icon)} />
      <p className={cn('font-medium text-gray-900', config.title)}>{title}</p>
      {description && (
        <p className={cn('text-gray-500 mt-1', config.description)}>{description}</p>
      )}
      {action && (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={action.onClick}
            leftIcon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios
const EmptyStates = {
  NoData: ({ entity }: { entity: string }) => (
    <EmptyState
      title={`No hay ${entity}`}
      description={`Aún no se han creado ${entity}`}
    />
  ),
  NoResults: () => (
    <EmptyState
      title="Sin resultados"
      description="No se encontraron elementos que coincidan con tu búsqueda"
    />
  ),
  Error: ({ retry }: { retry?: () => void }) => (
    <EmptyState
      title="Error al cargar"
      description="Hubo un problema al cargar los datos"
      action={retry ? { label: 'Reintentar', onClick: retry } : undefined}
    />
  ),
}

export { EmptyState, EmptyStates }
