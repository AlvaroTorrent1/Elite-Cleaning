import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/shared/bottom-nav'
import LimpiadoraHeader from '@/components/shared/limpiadora-header'
import Image from 'next/image'

export default async function LimpiadoraLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, is_approved, full_name')
    .eq('id', user.id)
    .single()

  // Verificar que es limpiadora
  if (!profile) {
    redirect('/login')
  }

  if (profile.role !== 'cleaner') {
    // Redirigir al panel correcto según el rol
    switch (profile.role) {
      case 'admin':
        redirect('/admin')
      case 'property_manager':
        redirect('/pm')
      default:
        redirect('/login')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <LimpiadoraHeader profile={profile} />

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
