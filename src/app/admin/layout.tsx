import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/admin-sidebar'
import AdminHeader from '@/components/admin/admin-header'

export default async function AdminLayout({
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

  // Obtener perfil y verificar que sea admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'admin') {
    // Redirigir al panel correcto según el rol
    switch (profile.role) {
      case 'cleaner':
        redirect('/limpiadora')
      case 'property_manager':
        redirect('/pm')
      default:
        redirect('/login')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar profile={profile} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <AdminHeader profile={profile} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
