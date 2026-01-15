'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'

// Página de logout accesible por GET
// Cierra la sesión y redirige al login

export default function LogoutPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const logout = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        await supabase.auth.signOut()
        setStatus('success')
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
          router.push('/login')
        }, 1000)
      } catch (error) {
        console.error('Error al cerrar sesión:', error)
        setStatus('error')
      }
    }

    logout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-xl font-semibold text-gray-900">Cerrando sesión...</h1>
            <p className="text-gray-600 mt-2">Por favor espera un momento</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">¡Sesión cerrada!</h1>
            <p className="text-gray-600 mt-2">Redirigiendo al login...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Error al cerrar sesión</h1>
            <p className="text-gray-600 mt-2">Intenta de nuevo</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reintentar
            </button>
          </>
        )}
      </div>
    </div>
  )
}
