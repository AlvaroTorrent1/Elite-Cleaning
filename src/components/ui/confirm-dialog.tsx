'use client'

import { useState, createContext, useContext, ReactNode, useCallback } from 'react'
import { AlertTriangle, Trash2, Info, HelpCircle } from 'lucide-react'
import { Modal, ModalBody, ModalFooter } from './modal'
import { Button } from './button'

/**
 * ConfirmDialog Component - Elite Cleaning
 * 
 * Usa colores del tema para consistencia
 */

type ConfirmVariant = 'danger' | 'warning' | 'info' | 'default'

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType | null>(null)

// Hook to use confirm dialog
export function useConfirm() {
  const context = useContext(ConfirmContext)
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider')
  }
  return context.confirm
}

// Provider component
interface ConfirmProviderProps {
  children: ReactNode
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts)
    setIsOpen(true)

    return new Promise<boolean>((resolve) => {
      setResolvePromise(() => resolve)
    })
  }, [])

  const handleConfirm = () => {
    setIsOpen(false)
    resolvePromise?.(true)
  }

  const handleCancel = () => {
    setIsOpen(false)
    resolvePromise?.(false)
  }

  const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; color: string; buttonVariant: 'danger' | 'warning' | 'primary' | 'secondary' }> = {
    danger: { icon: Trash2, color: 'text-destructive', buttonVariant: 'danger' },
    warning: { icon: AlertTriangle, color: 'text-warning', buttonVariant: 'warning' },
    info: { icon: Info, color: 'text-info', buttonVariant: 'primary' },
    default: { icon: HelpCircle, color: 'text-muted-foreground', buttonVariant: 'primary' },
  }

  const config = options ? variantConfig[options.variant || 'default'] : variantConfig.default
  const Icon = config.icon

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Modal isOpen={isOpen} onClose={handleCancel} size="sm">
        <ModalBody className="pt-6">
          <div className="flex flex-col items-center text-center">
            <div className="p-3 rounded-full bg-muted mb-4">
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {options?.title}
            </h3>
            <p className="text-muted-foreground text-sm">
              {options?.message}
            </p>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button variant="muted" onClick={handleCancel}>
            {options?.cancelText || 'Cancelar'}
          </Button>
          <Button variant={config.buttonVariant} onClick={handleConfirm}>
            {options?.confirmText || 'Confirmar'}
          </Button>
        </ModalFooter>
      </Modal>
    </ConfirmContext.Provider>
  )
}

// Standalone confirm dialog component (for simple use without context)
interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: ConfirmVariant
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const variantConfig: Record<ConfirmVariant, { icon: typeof AlertTriangle; color: string; buttonVariant: 'danger' | 'warning' | 'primary' | 'secondary' }> = {
    danger: { icon: Trash2, color: 'text-destructive', buttonVariant: 'danger' },
    warning: { icon: AlertTriangle, color: 'text-warning', buttonVariant: 'warning' },
    info: { icon: Info, color: 'text-info', buttonVariant: 'primary' },
    default: { icon: HelpCircle, color: 'text-muted-foreground', buttonVariant: 'primary' },
  }

  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="sm">
      <ModalBody className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-muted mb-4">
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">{message}</p>
        </div>
      </ModalBody>
      <ModalFooter className="justify-center">
        <Button variant="muted" onClick={onCancel} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={config.buttonVariant} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
