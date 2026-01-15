'use client'

import { useState, ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface DropdownMenuProps {
  trigger?: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
  disabled?: boolean
}

function DropdownMenu({
  trigger,
  children,
  align = 'right',
  className,
  disabled = false,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleClose = () => setIsOpen(false)

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger || <MoreVertical className="w-5 h-5 text-gray-600" />}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close */}
          <div
            className="fixed inset-0 z-10"
            onClick={handleClose}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className={cn(
              'absolute mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-1',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
          >
            {/* Pass close function to children */}
            <DropdownMenuContext.Provider value={{ close: handleClose }}>
              {children}
            </DropdownMenuContext.Provider>
          </div>
        </>
      )}
    </div>
  )
}

// Context for closing menu from items
import { createContext, useContext } from 'react'

const DropdownMenuContext = createContext<{ close: () => void }>({ close: () => {} })

interface DropdownMenuItemProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'default' | 'danger'
  disabled?: boolean
  icon?: ReactNode
  className?: string
  closeOnClick?: boolean
}

function DropdownMenuItem({
  children,
  onClick,
  variant = 'default',
  disabled = false,
  icon,
  className,
  closeOnClick = true,
}: DropdownMenuItemProps) {
  const { close } = useContext(DropdownMenuContext)

  const handleClick = () => {
    if (disabled) return
    onClick?.()
    if (closeOnClick) close()
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm text-left transition-colors',
        variant === 'default' && 'text-gray-700 hover:bg-gray-50',
        variant === 'danger' && 'text-red-600 hover:bg-red-50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      role="menuitem"
    >
      {icon}
      {children}
    </button>
  )
}

interface DropdownMenuLinkProps {
  children: ReactNode
  href: string
  icon?: ReactNode
  className?: string
}

function DropdownMenuLink({ children, href, icon, className }: DropdownMenuLinkProps) {
  const { close } = useContext(DropdownMenuContext)

  return (
    <a
      href={href}
      onClick={close}
      className={cn(
        'w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors',
        className
      )}
      role="menuitem"
    >
      {icon}
      {children}
    </a>
  )
}

function DropdownMenuDivider() {
  return <div className="border-t border-gray-100 my-1" role="separator" />
}

export { DropdownMenu, DropdownMenuItem, DropdownMenuLink, DropdownMenuDivider }
