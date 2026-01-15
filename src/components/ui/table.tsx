import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

/**
 * Table Components - Elite Cleaning
 * 
 * Usa colores del tema para consistencia
 */

interface TableProps {
  children: ReactNode
  className?: string
}

function Table({ children, className }: TableProps) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">{children}</table>
    </div>
  )
}

interface TableHeaderProps {
  children: ReactNode
  className?: string
}

function TableHeader({ children, className }: TableHeaderProps) {
  return <thead className={cn('bg-muted', className)}>{children}</thead>
}

interface TableBodyProps {
  children: ReactNode
  className?: string
}

function TableBody({ children, className }: TableBodyProps) {
  return (
    <tbody className={cn('bg-card divide-y divide-border', className)}>
      {children}
    </tbody>
  )
}

interface TableRowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'hover:bg-muted/50 transition-colors',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </tr>
  )
}

interface TableHeadProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

function TableHead({ children, className, align = 'left' }: TableHeadProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <th
      className={cn(
        'px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider',
        alignClass[align],
        className
      )}
    >
      {children}
    </th>
  )
}

interface TableCellProps {
  children: ReactNode
  className?: string
  align?: 'left' | 'center' | 'right'
}

function TableCell({ children, className, align = 'left' }: TableCellProps) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }

  return (
    <td className={cn('px-6 py-4 text-foreground', alignClass[align], className)}>{children}</td>
  )
}

// Table info header (e.g., "Mostrando X de Y elementos")
interface TableInfoProps {
  showing: number
  total: number
  entity?: string
  className?: string
}

function TableInfo({ showing, total, entity = 'elementos', className }: TableInfoProps) {
  return (
    <div className={cn('px-6 py-3 border-b border-border', className)}>
      <p className="text-sm text-muted-foreground">
        Mostrando <span className="font-medium text-foreground">{showing}</span> de{' '}
        <span className="font-medium text-foreground">{total}</span> {entity}
      </p>
    </div>
  )
}

// Empty table row
interface TableEmptyRowProps {
  colSpan: number
  message?: string
}

function TableEmptyRow({ colSpan, message = 'No se encontraron elementos' }: TableEmptyRowProps) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-muted-foreground">
        {message}
      </td>
    </tr>
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableInfo,
  TableEmptyRow,
}
