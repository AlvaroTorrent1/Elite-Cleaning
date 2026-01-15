import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugPMPage() {
  const supabase = await createClient()

  // Obtener usuario autenticado
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  // Obtener perfil
  let profile = null
  let profileError = null

  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = data
    profileError = error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">🔍 Debug: Property Manager Access</h1>
          <p className="text-gray-600 mb-4">
            Esta página te ayudará a diagnosticar por qué estás siendo redirigido al panel de limpiadora.
          </p>
        </div>

        {/* Estado de Autenticación */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
            🔐 Estado de Autenticación
          </h2>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="font-medium min-w-[150px]">¿Autenticado?</span>
              <span className={user ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                {user ? '✅ SÍ' : '❌ NO'}
              </span>
            </div>
            {userError && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-sm text-red-800">
                  <strong>Error:</strong> {JSON.stringify(userError)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Datos del Usuario */}
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              👤 Datos del Usuario (Supabase Auth)
            </h2>
            <div className="bg-gray-50 rounded p-4 space-y-2 text-sm font-mono">
              <div>
                <span className="font-semibold">ID:</span> {user.id}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {user.email}
              </div>
              <div>
                <span className="font-semibold">Creado:</span> {new Date(user.created_at || '').toLocaleString('es-ES')}
              </div>
              <div>
                <span className="font-semibold">Última sesión:</span>{' '}
                {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('es-ES') : 'N/A'}
              </div>
            </div>
          </div>
        )}

        {/* Perfil del Usuario */}
        {user && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
              📋 Perfil de Usuario (Tabla profiles)
            </h2>
            {profileError ? (
              <div className="bg-red-50 border border-red-200 rounded p-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Error al obtener perfil:</strong>
                </p>
                <pre className="mt-2 text-xs overflow-auto">{JSON.stringify(profileError, null, 2)}</pre>
              </div>
            ) : profile ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[150px]">Nombre Completo:</span>
                    <span>{profile.full_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[150px]">Email:</span>
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[150px]">ROL ACTUAL:</span>
                    <span
                      className={`px-3 py-1 rounded-full font-bold text-sm ${
                        profile.role === 'property_manager'
                          ? 'bg-purple-100 text-purple-800'
                          : profile.role === 'cleaner'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {profile.role === 'property_manager' && '🏠 PROPERTY MANAGER'}
                      {profile.role === 'cleaner' && '✨ LIMPIADORA'}
                      {profile.role === 'admin' && '🔧 ADMINISTRADOR'}
                      {!['property_manager', 'cleaner', 'admin'].includes(profile.role) && profile.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[150px]">¿Aprobado?</span>
                    <span className={profile.is_approved ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                      {profile.is_approved ? '✅ SÍ' : '❌ NO (pendiente de aprobación)'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold min-w-[150px]">¿Activo?</span>
                    <span className={profile.is_active ? 'text-green-600' : 'text-red-600'}>
                      {profile.is_active ? '✅ SÍ' : '❌ NO'}
                    </span>
                  </div>
                </div>

                {/* Diagnóstico */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">🔍 Diagnóstico:</h3>
                  {profile.role === 'property_manager' && profile.is_approved ? (
                    <div className="bg-green-50 border border-green-200 rounded p-4">
                      <p className="text-green-800 font-semibold">
                        ✅ Tu perfil está correctamente configurado como Property Manager aprobado.
                      </p>
                      <p className="text-sm text-green-700 mt-2">
                        Deberías poder acceder a <code className="bg-green-100 px-2 py-1 rounded">/pm</code> sin problemas.
                      </p>
                      <div className="mt-4">
                        <a
                          href="/pm"
                          className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Intentar acceder a /pm
                        </a>
                      </div>
                    </div>
                  ) : profile.role === 'property_manager' && !profile.is_approved ? (
                    <div className="bg-amber-50 border border-amber-200 rounded p-4">
                      <p className="text-amber-800 font-semibold">⚠️ Tu cuenta de Property Manager no está aprobada.</p>
                      <p className="text-sm text-amber-700 mt-2">
                        Serás redirigido a la página de <code className="bg-amber-100 px-2 py-1 rounded">/pending-approval</code>
                      </p>
                    </div>
                  ) : profile.role === 'cleaner' ? (
                    <div className="bg-red-50 border border-red-200 rounded p-4">
                      <p className="text-red-800 font-semibold">
                        ❌ PROBLEMA IDENTIFICADO: Tu rol actual es &quot;cleaner&quot; (limpiadora)
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        Por eso estás siendo redirigido al panel de limpiadora. Necesitas cambiar tu rol a
                        &quot;property_manager&quot;.
                      </p>
                      <div className="mt-4 bg-white border border-red-300 rounded p-3">
                        <p className="text-sm font-semibold text-red-900 mb-2">Solución:</p>
                        <p className="text-sm text-red-800 mb-2">
                          Ejecuta este comando SQL en el SQL Editor de Supabase:
                        </p>
                        <pre className="bg-red-900 text-red-100 p-3 rounded text-xs overflow-auto">
                          {`UPDATE profiles 
SET role = 'property_manager', is_approved = true 
WHERE id = '${user.id}';`}
                        </pre>
                        <p className="text-xs text-red-600 mt-2">
                          Después de ejecutarlo, cierra sesión y vuelve a entrar.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                      <p className="text-blue-800">
                        Tu rol actual es <strong>{profile.role}</strong>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded p-4">
                <p className="text-amber-800">⚠️ No se encontró perfil en la base de datos</p>
              </div>
            )}
          </div>
        )}

        {/* Lógica de Redirección */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">🔀 Lógica de Redirección</h2>
          <div className="text-sm space-y-3">
            <p>Cuando accedes a <code className="bg-gray-100 px-2 py-1 rounded">/pm</code>, el sistema verifica:</p>
            <ol className="list-decimal list-inside space-y-2 ml-4">
              <li>
                <strong>¿Estás autenticado?</strong> Si no → redirige a <code>/login</code>
              </li>
              <li>
                <strong>¿Existe tu perfil?</strong> Si no → redirige a <code>/login</code>
              </li>
              <li>
                <strong>¿Tu rol es &quot;property_manager&quot;?</strong>
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Si rol = &quot;admin&quot; → redirige a <code>/admin</code></li>
                  <li>
                    Si rol = &quot;cleaner&quot; → redirige a <code>/limpiadora</code> ⚠️
                  </li>
                  <li>Otro → redirige a <code>/login</code></li>
                </ul>
              </li>
              <li>
                <strong>¿Estás aprobado?</strong> Si no → redirige a <code>/pending-approval</code>
              </li>
              <li>
                <strong>Si todo está OK</strong> → muestra el panel de PM ✅
              </li>
            </ol>
          </div>
        </div>

        {/* Acciones */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-3">🛠️ Acciones</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/pm"
              className="block px-4 py-3 text-center bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Probar /pm
            </a>
            <a
              href="/limpiadora"
              className="block px-4 py-3 text-center bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Probar /limpiadora
            </a>
            <a
              href="/logout"
              className="block px-4 py-3 text-center bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Cerrar Sesión
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
