import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// Esta página solo está disponible en desarrollo
// Permite ver los diferentes paneles sin cambiar de rol

export default async function DevPanelesPage() {
  // Solo permitir en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    redirect('/')
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Panel de Desarrollo</h1>
          <p className="text-gray-600">
            Esta página solo está disponible en modo desarrollo.
          </p>
        </div>

        {/* Info del usuario actual */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">👤 Usuario Actual</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Email:</span>
              <p>{user.email}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Rol:</span>
              <p className="font-semibold text-blue-600">{profile?.role || 'Sin perfil'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Nombre:</span>
              <p>{profile?.full_name || 'N/A'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-500">Aprobado:</span>
              <p>{profile?.is_approved ? '✅ Sí' : '❌ No'}</p>
            </div>
          </div>
        </div>

        {/* Paneles disponibles */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📱 Paneles Disponibles</h2>
          <p className="text-sm text-gray-600 mb-4">
            Tu rol actual es <strong className="text-blue-600">{profile?.role}</strong>. 
            Solo puedes acceder al panel correspondiente a tu rol.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4">
            {/* Admin Panel */}
            <div className={`border rounded-lg p-4 ${profile?.role === 'admin' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="font-semibold text-lg mb-2">🏢 Admin</h3>
              <p className="text-sm text-gray-600 mb-3">Gestión completa del sistema</p>
              <Link
                href="/admin"
                className={`block text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  profile?.role === 'admin'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {profile?.role === 'admin' ? 'Acceder →' : 'Bloqueado 🔒'}
              </Link>
              {profile?.role === 'admin' && (
                <p className="text-xs text-green-600 mt-2 text-center">✓ Tu panel actual</p>
              )}
            </div>

            {/* Limpiadora Panel */}
            <div className={`border rounded-lg p-4 ${profile?.role === 'cleaner' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="font-semibold text-lg mb-2">🧹 Limpiadora</h3>
              <p className="text-sm text-gray-600 mb-3">Agenda y checklists</p>
              <Link
                href="/limpiadora"
                className={`block text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  profile?.role === 'cleaner'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {profile?.role === 'cleaner' ? 'Acceder →' : 'Bloqueado 🔒'}
              </Link>
              {profile?.role === 'cleaner' && (
                <p className="text-xs text-green-600 mt-2 text-center">✓ Tu panel actual</p>
              )}
            </div>

            {/* PM Panel */}
            <div className={`border rounded-lg p-4 ${profile?.role === 'property_manager' ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className="font-semibold text-lg mb-2">🏠 Property Manager</h3>
              <p className="text-sm text-gray-600 mb-3">Gestión de propiedades</p>
              <Link
                href="/pm"
                className={`block text-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  profile?.role === 'property_manager' && profile?.is_approved
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {profile?.role === 'property_manager' && profile?.is_approved ? 'Acceder →' : 'Bloqueado 🔒'}
              </Link>
              {profile?.role === 'property_manager' && (
                <p className={`text-xs mt-2 text-center ${profile?.is_approved ? 'text-green-600' : 'text-amber-600'}`}>
                  {profile?.is_approved ? '✓ Tu panel actual' : '⏳ Pendiente de aprobación'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Instrucciones para cambiar rol */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-amber-800 mb-4">⚠️ ¿Quieres probar otro panel?</h2>
          <p className="text-amber-700 mb-4">
            Para ver los otros paneles, necesitas cambiar tu rol en la base de datos:
          </p>
          <div className="bg-white rounded p-4 font-mono text-sm overflow-x-auto">
            <p className="text-gray-600 mb-2">-- Ejecuta en Supabase SQL Editor:</p>
            <p className="text-blue-600 mb-2">-- Para probar como limpiadora:</p>
            <code className="block text-gray-800 mb-4">
              UPDATE profiles SET role = &apos;cleaner&apos; WHERE email = &apos;{user.email}&apos;;
            </code>
            <p className="text-blue-600 mb-2">-- Para probar como property manager:</p>
            <code className="block text-gray-800 mb-4">
              UPDATE profiles SET role = &apos;property_manager&apos;, is_approved = true WHERE email = &apos;{user.email}&apos;;
            </code>
            <p className="text-blue-600 mb-2">-- Para volver a admin:</p>
            <code className="block text-gray-800">
              UPDATE profiles SET role = &apos;admin&apos; WHERE email = &apos;{user.email}&apos;;
            </code>
          </div>
          <p className="text-sm text-amber-600 mt-4">
            Después de cambiar el rol, recarga esta página para ver los cambios.
          </p>
        </div>

        {/* Links útiles */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🔗 Links Útiles</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/debug"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">🔍 Debug de Autenticación</h3>
              <p className="text-sm text-gray-600">Ver detalles de la sesión actual</p>
            </Link>
            <Link
              href="/login"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">🔐 Login</h3>
              <p className="text-sm text-gray-600">Iniciar sesión con otra cuenta</p>
            </Link>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">📊 Supabase Dashboard</h3>
              <p className="text-sm text-gray-600">Editar datos directamente</p>
            </a>
            <Link
              href="/"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-medium">🏠 Inicio</h3>
              <p className="text-sm text-gray-600">Volver al inicio</p>
            </Link>
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Esta página solo está disponible en <code className="bg-gray-100 px-1 rounded">NODE_ENV=development</code>
        </p>
      </div>
    </div>
  )
}
