import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * StatCard Component - Elite Cleaning
 * 
 * Usa colores del tema para consistencia visual.
 * Los iconos usan la paleta rosa/lila corporativa.
 * 
 * Variantes de iconos disponibles:
 * - primary: Rosa corporativo
 * - secondary: Lila
 * - accent1-5: Variaciones de rosa/lila
 * - muted: Gris neutro
 */

// Variantes de color para iconos usando la paleta corporativa
export const iconVariants = {
  // Colores corporativos principales
  primary: { icon: 'text-primary', bg: 'bg-primary/10' },
  secondary: { icon: 'text-secondary', bg: 'bg-secondary/10' },
  
  // Variantes de acento (gama rosa-lila)
  accent1: { icon: 'text-[#A66B7C]', bg: 'bg-[#A66B7C]/10' },  // Rosa oscuro
  accent2: { icon: 'text-[#A393BB]', bg: 'bg-[#A393BB]/10' },  // Lila claro  
  accent3: { icon: 'text-[#E88BA6]', bg: 'bg-[#E88BA6]/10' },  // Rosa suave
  accent4: { icon: 'text-[#756693]', bg: 'bg-[#756693]/10' },  // Lila profundo
  accent5: { icon: 'text-[#C48A9B]', bg: 'bg-[#C48A9B]/10' },  // Rosa intenso
  
  // Gris neutro
  muted: { icon: 'text-muted-foreground', bg: 'bg-muted' },
} as const

export type IconVariant = keyof typeof iconVariants

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  /** Variante de color del icono (usa paleta corporativa rosa/lila) */
  variant?: IconVariant
  /** @deprecated Usar 'variant' en su lugar */
  iconColor?: string
  /** @deprecated Usar 'variant' en su lugar */
  iconBgColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  className?: string
  onClick?: () => void
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'primary',
  iconColor,
  iconBgColor,
  trend,
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const Component = onClick ? 'button' : 'div'
  
  // Usar variante si no se especifican colores legacy
  const colors = iconVariants[variant]
  const finalIconColor = iconColor || colors.icon
  const finalIconBg = iconBgColor || colors.bg

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-card rounded-lg border border-border p-4 text-left',
        onClick && 'hover:shadow-md hover:border-primary/30 cursor-pointer transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-1',
                trend.isPositive ? 'text-primary' : 'text-destructive'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg flex-shrink-0', finalIconBg)}>
            <Icon className={cn('w-6 h-6', finalIconColor)} />
          </div>
        )}
      </div>
    </Component>
  )
}

// Grid container for stat cards
interface StatCardGridProps {
  children: React.ReactNode
  columns?: 2 | 3 | 4 | 5
  className?: string
}

function StatCardGrid({ children, columns = 4, className }: StatCardGridProps) {
  const colsClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
    5: 'md:grid-cols-3 lg:grid-cols-5',
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4', colsClass[columns], className)}>
      {children}
    </div>
  )
}

export { StatCard, StatCardGrid }
