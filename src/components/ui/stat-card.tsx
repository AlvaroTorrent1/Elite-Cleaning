import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
  title: string
  value: string | number
  icon?: LucideIcon
  iconColor?: string
  iconBgColor?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
  className?: string
  onClick?: () => void
}

const defaultColorMap: Record<string, { icon: string; bg: string }> = {
  blue: { icon: 'text-blue-600', bg: 'bg-blue-50' },
  green: { icon: 'text-green-600', bg: 'bg-green-50' },
  red: { icon: 'text-red-600', bg: 'bg-red-50' },
  yellow: { icon: 'text-yellow-600', bg: 'bg-yellow-50' },
  purple: { icon: 'text-purple-600', bg: 'bg-purple-50' },
  orange: { icon: 'text-orange-600', bg: 'bg-orange-50' },
  gray: { icon: 'text-gray-600', bg: 'bg-gray-50' },
  cyan: { icon: 'text-cyan-600', bg: 'bg-cyan-50' },
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-gray-400',
  iconBgColor = 'bg-gray-50',
  trend,
  subtitle,
  className,
  onClick,
}: StatCardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-gray-200 p-4 text-left',
        onClick && 'hover:shadow-md hover:border-blue-300 cursor-pointer transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-600 truncate">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && (
            <p
              className={cn(
                'text-xs font-medium mt-1',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg flex-shrink-0', iconBgColor)}>
            <Icon className={cn('w-6 h-6', iconColor)} />
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

export { StatCard, StatCardGrid, defaultColorMap }
