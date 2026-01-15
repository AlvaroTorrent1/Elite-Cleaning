import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}: CardProps) {
  const Component = onClick ? 'button' : 'div'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-lg border border-gray-200',
        paddingClasses[padding],
        hover && 'hover:shadow-md hover:border-gray-300 transition-all',
        onClick && 'cursor-pointer text-left w-full',
        className
      )}
    >
      {children}
    </Component>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
  action?: ReactNode
}

function CardHeader({ children, className, action }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between pb-4 border-b border-gray-200 mb-4',
        className
      )}
    >
      <h3 className="font-semibold text-gray-900">{children}</h3>
      {action}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-600 mt-1', className)}>{children}</p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

function CardContent({ children, className }: CardContentProps) {
  return <div className={cn('', className)}>{children}</div>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('pt-4 border-t border-gray-200 mt-4', className)}>
      {children}
    </div>
  )
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
