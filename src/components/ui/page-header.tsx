import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * PageHeader Component - Elite Cleaning
 * 
 * Usa colores del tema para consistencia
 */

interface PageHeaderProps {
  title: string
  description?: string
  action?: ReactNode
  backLink?: {
    href: string
    label?: string
  }
  className?: string
  children?: ReactNode
}

function PageHeader({
  title,
  description,
  action,
  backLink,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {backLink && (
        <a
          href={backLink.href}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {backLink.label || 'Volver'}
        </a>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-foreground truncate">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}

// Simplified page header for detail pages
interface DetailPageHeaderProps {
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  backHref?: string
  className?: string
}

function DetailPageHeader({
  title,
  subtitle,
  badge,
  actions,
  backHref,
  className,
}: DetailPageHeaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Volver
        </a>
      )}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  )
}

export { PageHeader, DetailPageHeader }
