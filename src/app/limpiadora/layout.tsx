import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BottomNav } from '@/components/shared/bottom-nav'
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
    .select('role, is_approved, full_name')
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
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logos/My Elite Cleaning Logo Simple.png"
              alt="Elite Cleaning"
              width={100}
              height={32}
              className="object-contain"
            />
            <div className="border-l pl-3">
              <p className="text-sm text-gray-600">Hola, {profile?.full_name?.split(' ')[0] || 'Limpiadora'}</p>
            </div>
          </div>
          <div className="w-10 h-10 bg-[#1E40AF] rounded-full flex items-center justify-center text-white font-semibold">
            {profile?.full_name?.charAt(0) || 'L'}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
