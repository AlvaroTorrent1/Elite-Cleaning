'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect, Suspense } from 'react'
import Image from 'next/image'

type UserRole = 'admin' | 'cleaner' | 'property_manager'

const roleOptions = [
  {
    role: 'admin' as UserRole,
    label: 'Administrador',
    description: 'Gestión completa del sistema, usuarios y operaciones',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    colorClass: 'border-[#D4A5B3]/30 hover:border-[#D4A5B3]',
    bgClass: 'bg-[#D4A5B3]',
  },
  {
    role: 'cleaner' as UserRole,
    label: 'Limpiadora',
    description: 'Acceso a tu agenda, checklists y reportes diarios',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
    colorClass: 'border-green-200 hover:border-green-500',
    bgClass: 'bg-green-500',
  },
  {
    role: 'property_manager' as UserRole,
    label: 'Property Manager',
    description: 'Gestión de propiedades, limpiezas e histórico',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    colorClass: 'border-[#8B7BA8]/30 hover:border-[#8B7BA8]',
    bgClass: 'bg-[#8B7BA8]',
  },
]

function SelectRoleContent() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Si hay un rol pendiente en localStorage, pre-seleccionarlo
    const pendingRole = localStorage.getItem('pending_role') as UserRole | null
    if (pendingRole) {
      setSelectedRole(pendingRole)
    }
  }, [])

  const handleSelectRole = async (role: UserRole) => {
    if (isLoading) return

    try {
      setIsLoading(true)
      setSelectedRole(role)

      // Obtener usuario actual
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No hay usuario autenticado')
      }

      // Actualizar el rol del perfil
      const { error } = await supabase
        .from('profiles')
        .update({
          role: role,
          is_approved: role !== 'property_manager', // PMs necesitan aprobación
        })
        .eq('id', user.id)

      if (error) {
        console.error('Error al actualizar rol:', error)
        alert('Error al asignar rol. Por favor, inténtalo de nuevo.')
        setIsLoading(false)
        return
      }

      // Limpiar localStorage
      localStorage.removeItem('pending_role')

      // Redirigir según el rol
      if (role === 'property_manager') {
        router.push('/pending-approval')
      } else if (role === 'cleaner') {
        router.push('/limpiadora')
      } else if (role === 'admin') {
        router.push('/admin')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error inesperado. Por favor, inténtalo de nuevo.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4A5B3] via-[#E8D4DC] to-[#8B7BA8] flex flex-col">
      {/* Header */}
      <header className="p-6 md:p-8">
        <div className="flex items-center justify-center">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="My Elite Cleaning"
            width={200}
            height={70}
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Selecciona tu Rol</h1>
          <p className="text-white/90 text-lg">¿Cuál es tu función en My Elite Cleaning?</p>
          <p className="text-white/70 text-sm mt-2">
            Este paso es necesario para configurar tu cuenta correctamente
          </p>
        </div>

        {/* Opciones de rol */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {roleOptions.map((option) => (
            <button
              key={option.role}
              onClick={() => handleSelectRole(option.role)}
              disabled={isLoading}
              className={`
                group relative bg-white rounded-2xl border-2 transition-all duration-300 p-6 md:p-8 text-left
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'}
                ${selectedRole === option.role ? 'ring-4 ring-white ring-offset-2' : ''}
                ${option.colorClass}
              `}
            >
              {/* Icono */}
              <div
                className={`
                w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
                transition-transform duration-300 group-hover:scale-110
                ${option.bgClass}
              `}
              >
                {isLoading && selectedRole === option.role ? (
                  <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="text-white w-8 h-8 md:w-10 md:h-10">{option.icon}</div>
                )}
              </div>

              {/* Texto */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 text-center">{option.label}</h3>
              <p className="text-sm text-gray-600 text-center">{option.description}</p>

              {selectedRole === option.role && isLoading && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600">Configurando cuenta...</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Nota de seguridad */}
        <div className="mt-8 bg-white/90 rounded-lg p-4 max-w-2xl">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>Nota:</strong> Los Property Managers requieren aprobación del administrador antes de acceder al
            sistema.
          </p>
        </div>
      </main>
    </div>
  )
}

export default function SelectRolePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#D4A5B3] via-[#E8D4DC] to-[#8B7BA8] flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    }>
      <SelectRoleContent />
    </Suspense>
  )
}
