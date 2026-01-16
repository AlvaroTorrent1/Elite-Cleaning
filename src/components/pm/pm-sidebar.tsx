'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  Home,
  Calendar,
  AlertTriangle,
  Package,
  History,
  PlusCircle,
  MessageCircle,
  RefreshCw,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import NotificationBell from '@/components/shared/notification-bell'

/**
 * PMSidebar - Barra lateral de navegación para Property Manager
 * 
 * Características:
 * - Desktop (lg+): Siempre visible y expandida
 * - Móvil: Colapsable con botón hamburguesa
 * - Logo en la parte superior
 * - Paleta corporativa rosa/lila
 */

interface PMSidebarProps {
  profile: {
    id: string
    full_name: string | null
    email: string
  }
}

const navigation = [
  {
    name: 'Mis Propiedades',
    href: '/pm',
    icon: Home,
  },
  {
    name: 'Calendario',
    href: '/pm/calendario',
    icon: RefreshCw,
  },
  {
    name: 'Limpiezas',
    href: '/pm/limpiezas',
    icon: Calendar,
  },
  {
    name: 'Mensajes',
    href: '/pm/mensajes',
    icon: MessageCircle,
  },
  {
    name: 'Daños',
    href: '/pm/danos',
    icon: AlertTriangle,
  },
  {
    name: 'Objetos Perdidos',
    href: '/pm/objetos-perdidos',
    icon: Package,
  },
  {
    name: 'Histórico',
    href: '/pm/historico',
    icon: History,
  },
]

const quickActions = [
  {
    name: 'Nueva Limpieza',
    href: '/pm/nueva-limpieza',
    icon: PlusCircle,
  },
  {
    name: 'Nueva Propiedad',
    href: '/pm/nueva-propiedad',
    icon: PlusCircle,
  },
]

export default function PMSidebar({ profile }: PMSidebarProps) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Cerrar sidebar móvil al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  // Prevenir scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileOpen])

  const handleLogout = async () => {
    await fetch('/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-border px-4">
        <Image
          src="/logos/My Elite Cleaning Logo Simple.png"
          alt="Elite Cleaning"
          width={120}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
            {profile.full_name?.[0]?.toUpperCase() || profile.email[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {profile.full_name || 'Property Manager'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
          Menú Principal
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-brand'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}

        {/* Acciones Rápidas */}
        <div className="pt-4 mt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-3">
            Acciones Rápidas
          </p>
          {quickActions.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-brand'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer - Actions */}
      <div className="p-4 border-t border-border space-y-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm text-muted-foreground">Notificaciones</span>
          <NotificationBell userId={profile.id} />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile Header - Barra superior con hamburguesa */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-border h-16 flex items-center justify-between px-4">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6 text-foreground" />
        </button>
        
        <Image
          src="/logos/My Elite Cleaning Logo Simple.png"
          alt="Elite Cleaning"
          width={100}
          height={32}
          className="object-contain"
          priority
        />
        
        <div className="flex items-center gap-2">
          <NotificationBell userId={profile.id} />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-border transform transition-transform duration-300 ease-in-out flex flex-col',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors z-10"
          aria-label="Cerrar menú"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <SidebarContent />
      </div>

      {/* Desktop Sidebar - Siempre visible */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:w-64 lg:bg-white lg:border-r lg:border-border lg:flex-col">
        <SidebarContent />
      </div>
    </>
  )
}
