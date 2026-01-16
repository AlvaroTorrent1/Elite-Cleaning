import { createClient } from '@/lib/supabase/server'

/**
 * Página de debug para verificar datos del PM
 * Solo para desarrollo - eliminar en producción
 */
export const dynamic = 'force-dynamic' // Forzar renderizado dinámico
export const revalidate = 0 // No cachear

export default async function DebugPMPage() {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">No hay sesión activa</h1>
        <pre className="mt-4 bg-gray-100 p-4 rounded">
          {JSON.stringify(userError, null, 2)}
        </pre>
      </div>
    )
  }

  // Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Obtener TODAS las propiedades (sin filtro) - esto debería funcionar como service role
  const { data: allProperties, error: propError } = await supabase
    .from('properties')
    .select('id, name, property_manager_id, address')
    .limit(10)

  // Obtener propiedades de este PM
  const { data: myProperties, error: myPropError } = await supabase
    .from('properties')
    .select('*')
    .eq('property_manager_id', user.id)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">🔍 Debug PM</h1>
      
      {/* Usuario actual */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h2 className="font-semibold text-blue-800 mb-2">👤 Usuario Actual</h2>
        <pre className="text-sm overflow-auto bg-white p-2 rounded">
          {JSON.stringify({ 
            id: user.id, 
            email: user.email 
          }, null, 2)}
        </pre>
      </div>

      {/* Perfil */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h2 className="font-semibold text-green-800 mb-2">📋 Perfil</h2>
        <pre className="text-sm overflow-auto bg-white p-2 rounded">
          {JSON.stringify(profile, null, 2)}
        </pre>
      </div>

      {/* Todas las propiedades */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="font-semibold text-yellow-800 mb-2">
          🏠 Todas las Propiedades (primeras 10)
        </h2>
        {propError && (
          <div className="text-red-600 mb-2">
            <p>Error: {propError.message}</p>
            <p>Code: {propError.code}</p>
            <p>Hint: {propError.hint}</p>
          </div>
        )}
        <pre className="text-sm overflow-auto bg-white p-2 rounded">
          {JSON.stringify(allProperties, null, 2)}
        </pre>
      </div>

      {/* Mis propiedades */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <h2 className="font-semibold text-purple-800 mb-2">
          ✨ Mis Propiedades (donde property_manager_id = mi id)
        </h2>
        <p className="text-sm text-purple-600 mb-2">
          Buscando: property_manager_id = <code className="bg-white px-1">{user.id}</code>
        </p>
        {myPropError && (
          <div className="text-red-600 mb-2">
            <p>Error: {myPropError.message}</p>
            <p>Code: {myPropError.code}</p>
          </div>
        )}
        <pre className="text-sm overflow-auto bg-white p-2 rounded">
          {JSON.stringify(myProperties, null, 2)}
        </pre>
        {(!myProperties || myProperties.length === 0) && !myPropError && (
          <p className="mt-2 text-red-600 font-medium">
            ⚠️ No hay propiedades asignadas a este usuario
          </p>
        )}
      </div>

      {/* Diagnóstico */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="font-semibold mb-2">🔧 Diagnóstico</h2>
        {allProperties && allProperties.length > 0 && myProperties?.length === 0 && (
          <div className="text-red-600">
            <p>❌ Hay propiedades en la base de datos, pero ninguna tiene tu ID como property_manager_id.</p>
            <p className="mt-2">Para asignarla, ejecuta en Supabase SQL:</p>
            <pre className="bg-white p-2 rounded mt-2 text-sm">
{`UPDATE properties 
SET property_manager_id = '${user.id}'
WHERE id = 'ID_DE_LA_PROPIEDAD';`}
            </pre>
          </div>
        )}
        {(!allProperties || allProperties.length === 0) && (
          <p className="text-yellow-600">
            ⚠️ No hay propiedades en la base de datos. Crea una desde el panel de Admin o PM.
          </p>
        )}
        {myProperties && myProperties.length > 0 && (
          <p className="text-green-600">
            ✅ Tienes {myProperties.length} propiedad(es) asignada(s). Deberían aparecer en el dashboard.
          </p>
        )}
      </div>
    </div>
  )
}
