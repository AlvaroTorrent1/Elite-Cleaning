import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import PMHeader from '@/components/pm/pm-header'
import PMNav from '@/components/pm/pm-nav'

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
      {/* Logo Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-[#E5E7EB]">
        <div className="px-4 py-3 flex items-center justify-center">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="Elite Cleaning"
            width={120}
            height={40}
            className="object-contain"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <PMHeader profile={profile} />
        <PMNav />
        <main className="p-4 pb-20">{children}</main>
      </div>
    </div>
  )
}
