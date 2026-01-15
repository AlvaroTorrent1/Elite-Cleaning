import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si está autenticado, obtener su rol y redirigir
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Verificar aprobación para property managers
      if (profile.role === 'property_manager' && !profile.is_approved) {
        redirect('/pending-approval')
      }

      // Redirigir según rol
      switch (profile.role) {
        case 'admin':
          redirect('/admin')
        case 'cleaner':
          redirect('/limpiadora')
        case 'property_manager':
          redirect('/pm')
      }
    }
  }

  // Si no está autenticado, mostrar landing y botón de login
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            Elite Cleaning
          </h1>
          <p className="text-xl text-gray-600">
            Plataforma de Gestión de Limpiezas
          </p>
          <p className="text-gray-500">
            Para propiedades de alquiler turístico en Málaga
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Gestión</h3>
              <p className="text-sm text-gray-600">Organiza limpiezas y equipos</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Checklists</h3>
              <p className="text-sm text-gray-600">Digitales con fotos</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Tiempo Real</h3>
              <p className="text-sm text-gray-600">Visibilidad operativa</p>
            </div>
          </div>

          <Link
            href="/login"
            className="block w-full px-6 py-3 text-center text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Acceder a la Plataforma
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          ¿Necesitas ayuda? Contacta con{' '}
          <a href="mailto:info@myelitecleaning.com" className="text-blue-600 hover:underline">
            soporte
          </a>
        </p>
      </div>
    </div>
  );
}
