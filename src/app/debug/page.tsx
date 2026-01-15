import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DebugPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  let profile = null
  let profileError = null
  
  if (user) {
    const result = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    profile = result.data
    profileError = result.error
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">🔍 Debug de Autenticación</h1>
          
          {/* Authentication Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Estado de Autenticación</h2>
            {userError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-red-700 font-medium">❌ Error de Autenticación</p>
                <p className="text-sm text-red-600">{userError.message}</p>
              </div>
            ) : !user ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="text-yellow-700 font-medium">⚠️ No autenticado</p>
                <p className="text-sm text-yellow-600">No hay ningún usuario logueado</p>
                <Link 
                  href="/login"
                  className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Ir a Login
                </Link>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="text-green-700 font-medium">✅ Autenticado correctamente</p>
              </div>
            )}
          </div>

          {/* User Data */}
          {user && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Datos del Usuario (Auth)</h2>
                <div className="bg-gray-50 rounded p-4 space-y-2">
                  <div>
                    <span className="font-medium">ID:</span>
                    <p className="text-sm font-mono">{user.id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <span className="font-medium">Provider:</span>
                    <p className="text-sm">{user.app_metadata.provider || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="font-medium">Última vez activo:</span>
                    <p className="text-sm">{new Date(user.last_sign_in_at || '').toLocaleString('es-ES')}</p>
                  </div>
                </div>
              </div>

              {/* Profile Data */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Perfil (Base de Datos)</h2>
                {profileError ? (
                  <div className="bg-red-50 border border-red-200 rounded p-4">
                    <p className="text-red-700 font-medium">❌ Error al cargar perfil</p>
                    <p className="text-sm text-red-600">{profileError.message}</p>
                  </div>
                ) : !profile ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <p className="text-yellow-700 font-medium">⚠️ Perfil no encontrado</p>
                    <p className="text-sm text-yellow-600">
                      El usuario existe en Auth pero no tiene perfil en la base de datos
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded p-4">
                    <pre className="text-sm overflow-x-auto">
                      {JSON.stringify(profile, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Actions */}
              {profile && (
                <div className="flex gap-4">
                  <Link
                    href={
                      profile.role === 'admin' ? '/admin' :
                      profile.role === 'cleaner' ? '/limpiadora' :
                      profile.role === 'property_manager' ? '/pm' : '/'
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Ir a mi Dashboard ({profile.role})
                  </Link>
                  
                  <form action="/logout" method="POST">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cerrar Sesión
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        <div className="text-center text-sm text-gray-600">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
