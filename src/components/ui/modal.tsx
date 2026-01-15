'use client'

import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeOnOverlayClick?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

function Modal({
  isOpen,
  onClose,
  children,
  className,
  size = 'md',
  closeOnOverlayClick = true,
}: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative bg-white rounded-xl shadow-xl w-full transform transition-all',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  children: ReactNode
  onClose?: () => void
  className?: string
}

function ModalHeader({ children, onClose, className }: ModalHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 border-b border-gray-200', className)}>
      <h2 className="text-lg font-semibold text-gray-900">{children}</h2>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Cerrar"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      )}
    </div>
  )
}

interface ModalBodyProps {
  children: ReactNode
  className?: string
}

function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn('p-4', className)}>{children}</div>
}

interface ModalFooterProps {
  children: ReactNode
  className?: string
}

function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div className={cn('flex gap-3 p-4 border-t border-gray-200', className)}>
      {children}
    </div>
  )
}

export { Modal, ModalHeader, ModalBody, ModalFooter }
