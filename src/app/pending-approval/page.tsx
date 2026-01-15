import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PendingApprovalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_approved, role, email')
    .eq('id', user.id)
    .single()

  // Si ya está aprobado, redirigir a su panel
  if (profile?.is_approved) {
    redirect('/pm')
  }

  // Si no es property manager, redirigir
  if (profile?.role !== 'property_manager') {
    redirect('/')
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="w-full max-w-md space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8 space-y-6">
          {/* Icono de espera */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>

          {/* Título */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Cuenta Pendiente de Aprobación
            </h1>
            <p className="text-gray-600">
              Tu cuenta ha sido creada exitosamente
            </p>
          </div>

          {/* Mensaje */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-700">
              Tu solicitud de acceso está siendo revisada por nuestro equipo.
            </p>
            <p className="text-sm text-gray-700">
              Recibirás un correo electrónico en{' '}
              <span className="font-semibold">{profile?.email}</span> cuando tu
              cuenta sea activada.
            </p>
          </div>

          {/* Información adicional */}
          <div className="text-sm text-gray-600 space-y-2">
            <p className="font-medium">Mientras tanto:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Revisa tu bandeja de correo</li>
              <li>Asegúrate de que tu email sea correcto</li>
              <li>Contacta con soporte si tienes dudas</li>
            </ul>
          </div>

          {/* Botón de cerrar sesión */}
          <form action={handleSignOut}>
            <button
              type="submit"
              className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>

        {/* Contacto */}
        <div className="text-center text-sm text-gray-600">
          <p>¿Necesitas ayuda?</p>
          <a
            href="mailto:info@myelitecleaning.com"
            className="text-blue-600 hover:underline"
          >
            Contacta con soporte
          </a>
        </div>
      </div>
    </div>
  )
}
