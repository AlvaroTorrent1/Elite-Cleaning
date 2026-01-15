import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { RoleSignInButton } from '@/components/auth/role-signin-button'

// Iconos SVG para cada rol
const AdminIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CleanerIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
)

const PMIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
)

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si ya está autenticado, mostrar opciones
  let profile = null
  let correctPanel = '/'
  
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('role, full_name, is_approved')
      .eq('id', user.id)
      .single()
    
    profile = data
    
    if (profile) {
      switch (profile.role) {
        case 'admin':
          correctPanel = '/admin'
          break
        case 'cleaner':
          correctPanel = '/limpiadora'
          break
        case 'property_manager':
          correctPanel = profile.is_approved ? '/pm' : '/pending-approval'
          break
      }
    }
  }

  // Usuario ya autenticado
  if (user && profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#D4A5B3] via-[#E8D4DC] to-[#8B7BA8] flex flex-col">
        {/* Header con logo */}
        <header className="p-6">
          <div className="flex items-center justify-center">
            <Image
              src="/logos/My Elite Cleaning Logo Simple.png"
              alt="My Elite Cleaning"
              width={180}
              height={60}
              className="object-contain"
              priority
            />
          </div>
        </header>

        {/* Contenido central */}
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  ¡Sesión Activa!
                </h2>
                <p className="text-gray-600 mt-2">
                  Conectado como <strong>{profile.full_name || user.email}</strong>
                </p>
                <span className={`
                  inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium
                  ${profile.role === 'admin' ? 'bg-[#E8D4DC] text-[#B8899A]' : ''}
                  ${profile.role === 'cleaner' ? 'bg-green-100 text-green-800' : ''}
                  ${profile.role === 'property_manager' ? 'bg-[#A89DC4]/20 text-[#6F5F8C]' : ''}
                `}>
                  {profile.role === 'admin' && '🔧 Administrador'}
                  {profile.role === 'cleaner' && '✨ Limpiadora'}
                  {profile.role === 'property_manager' && '🏠 Property Manager'}
                </span>
              </div>

              <div className="space-y-3">
                <Link
                  href={correctPanel}
                  className="block w-full px-6 py-4 text-center text-white bg-[#D4A5B3] hover:bg-[#B8899A] rounded-xl font-semibold transition-all hover:shadow-lg"
                >
                  Ir a mi Panel →
                </Link>
                
                <Link
                  href="/logout"
                  className="block w-full px-6 py-4 text-center text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                >
                  Cerrar Sesión
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Usuario NO autenticado - Mostrar login con 3 opciones
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D4A5B3] via-[#E8D4DC] to-[#8B7BA8] flex flex-col">
      {/* Header con logo */}
      <header className="p-6 md:p-8">
        <div className="flex items-center justify-center">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="My Elite Cleaning"
            width={200}
            height={70}
            className="object-contain"
            priority
          />
        </div>
      </header>

      {/* Contenido principal */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        {/* Título */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Plataforma de Gestión
          </h1>
          <p className="text-white/90 text-lg">
            Selecciona tu tipo de acceso para continuar
          </p>
        </div>

        {/* Tarjetas de acceso */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {/* Administrador */}
          <RoleSignInButton
            role="admin"
            label="Administrador"
            description="Gestión completa del sistema, usuarios y operaciones"
            icon={<AdminIcon />}
            colorClass="border-[#D4A5B3]/30 bg-white"
            hoverClass="hover:border-[#D4A5B3]"
            bgClass="bg-[#D4A5B3]"
            imageSrc="/images/roles/mirando-traves-de-los-papeles.jpg"
            imageAlt="Administrador revisando documentos"
          />

          {/* Limpiadora */}
          <RoleSignInButton
            role="cleaner"
            label="Limpiadora"
            description="Acceso a tu agenda, checklists y reportes diarios"
            icon={<CleanerIcon />}
            colorClass="border-green-200 bg-white"
            hoverClass="hover:border-[#10B981]"
            bgClass="bg-[#10B981]"
            imageSrc="/images/roles/persona-de-servicio-de-limpieza-profesional-que-usa-aspiradora-en-la-oficina.jpg"
            imageAlt="Profesional de limpieza en oficina"
          />

          {/* Property Manager */}
          <RoleSignInButton
            role="property_manager"
            label="Property Manager"
            description="Gestión de propiedades, limpiezas e histórico"
            icon={<PMIcon />}
            colorClass="border-[#8B7BA8]/30 bg-white"
            hoverClass="hover:border-[#8B7BA8]"
            bgClass="bg-[#8B7BA8]"
            imageSrc="/images/roles/hombre-de-negocios-rubia-feliz-expresion.jpg"
            imageAlt="Property Manager profesional"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-white/90 text-sm">
          ¿Necesitas ayuda?{' '}
          <a href="mailto:info@myelitecleaning.com" className="text-white hover:underline font-medium">
            Contacta con soporte
          </a>
        </p>
        <p className="text-white/60 text-xs mt-2">
          © 2026 My Elite Cleaning - Málaga, España
        </p>
      </footer>
    </div>
  )
}
