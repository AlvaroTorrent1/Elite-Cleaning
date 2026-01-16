import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PMSidebar from '@/components/pm/pm-sidebar'

export default async function PMLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil y verificar que sea PM
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'property_manager') {
    // Redirigir al panel correcto según el rol
    switch (profile.role) {
      case 'admin':
        redirect('/admin')
      case 'cleaner':
        redirect('/limpiadora')
      default:
        redirect('/login')
    }
  }

  // Si no está aprobado, redirigir a pending
  if (!profile.is_approved) {
    redirect('/pending-approval')
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Sidebar (incluye header móvil y sidebar desktop) */}
      <PMSidebar profile={profile} />

      {/* Main Content */}
      {/* En desktop: margen izquierdo para la sidebar (w-64 = 256px) */}
      {/* En móvil: margen superior para el header fijo (h-16 = 64px) */}
      <main className="lg:pl-64 pt-16 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
