'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import Image from 'next/image'

export type UserRole = 'admin' | 'cleaner' | 'property_manager'

/**
 * Función helper para obtener la URL base correcta
 * 
 * En el cliente, usamos window.location.origin que siempre
 * refleja el dominio actual (localhost en dev, vercel.app en prod)
 * 
 * Esto es la solución definitiva recomendada por Supabase.
 */
function getRedirectURL(role: string): string {
  // window.location.origin siempre devuelve el dominio correcto:
  // - En desarrollo: http://localhost:3000
  // - En producción: https://elite-cleaning-khaki.vercel.app
  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : ''
  
  return `${origin}/auth/callback?role=${role}`
}

interface RoleSignInButtonProps {
  role: UserRole
  label: string
  description: string
  icon: React.ReactNode
  colorClass: string
  hoverClass: string
  bgClass: string
  imageSrc?: string
  imageAlt?: string
  imageScale?: number // Scale factor for zoom (1 = normal, 1.5 = 150%, etc.)
  imagePosition?: string // CSS object-position value (e.g., "center top")
}

export function RoleSignInButton({
  role,
  label,
  description,
  icon,
  colorClass,
  hoverClass,
  bgClass,
  imageSrc,
  imageAlt,
  imageScale = 1,
  imagePosition = 'center',
}: RoleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      
      const redirectUrl = getRedirectURL(role)
      console.log('OAuth redirect URL:', redirectUrl) // Debug para verificar
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Error al iniciar sesión:', error.message)
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.')
      }
    } catch (error) {
      console.error('Error inesperado:', error)
      alert('Error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`
        group relative w-full overflow-hidden rounded-2xl border-2 transition-all duration-300
        ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}
        ${colorClass} ${hoverClass}
      `}
    >
      {/* Imagen de fondo con overlay */}
      {imageSrc && (
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={imageAlt || label}
            fill
            className="object-cover opacity-10 group-hover:opacity-15 transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className={`absolute inset-0 ${bgClass} opacity-5`} />
        </div>
      )}
      
      {/* Contenido */}
      <div className="relative p-6 md:p-8">
        {/* Imagen circular del perfil */}
        {imageSrc && (
          <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-4 rounded-full overflow-hidden border-4 border-white shadow-lg transition-transform duration-300 group-hover:scale-110">
            <Image
              src={imageSrc}
              alt={imageAlt || label}
              width={112}
              height={112}
              className="object-cover w-full h-full"
              style={{ 
                transform: `scale(${imageScale})`,
                objectPosition: imagePosition 
              }}
            />
          </div>
        )}

        {/* Icono (si no hay imagen) */}
        {!imageSrc && (
          <div className={`
            w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center
            transition-transform duration-300 group-hover:scale-110
            ${bgClass}
          `}>
            {isLoading ? (
              <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="text-white w-8 h-8 md:w-10 md:h-10">
                {icon}
              </div>
            )}
          </div>
        )}
        
        {/* Texto */}
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
          {label}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {description}
        </p>
        
        {/* Botón de Google */}
        <div className={`
          inline-flex items-center gap-2 px-4 py-2 rounded-lg
          bg-white border border-gray-200 shadow-sm
          transition-all duration-300 group-hover:shadow-md
        `}>
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">
                Conectando...
              </span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                Acceder con Google
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
