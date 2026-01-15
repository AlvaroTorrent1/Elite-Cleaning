import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Si está autenticado, obtener su rol y redirigir
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, is_approved')
      .eq('id', user.id)
      .single()

    if (profile) {
      // Verificar aprobación para property managers
      if (profile.role === 'property_manager' && !profile.is_approved) {
        redirect('/pending-approval')
      }

      // Redirigir según rol
      switch (profile.role) {
        case 'admin':
          redirect('/admin')
        case 'cleaner':
          redirect('/limpiadora')
        case 'property_manager':
          redirect('/pm')
      }
    }
  }

  // Si no está autenticado, mostrar landing estilo myelitecleaning.com
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Image - Se mostrará cuando subas hero-landing.jpg */}
      <div className="absolute inset-0 z-0">
        {/* Gradient fallback que replica los colores de myelitecleaning.com */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #f5e6ea 0%, #f0e0eb 25%, #e8d5e8 50%, #d8c8e0 75%, #c8bcd8 100%)'
          }}
        />
        {/* Imagen de fondo - descomenta cuando subas la imagen */}
        {/* 
        <Image
          src="/images/hero-landing.jpg"
          alt="My Elite Cleaning"
          fill
          className="object-cover"
          priority
        />
        */}
        {/* Overlay suave para mejorar legibilidad */}
        <div className="absolute inset-0 bg-white/10" />
      </div>

      {/* Header con botón de acceso */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-3">
          <Image
            src="/logos/My Elite Cleaning Logo Simple.png"
            alt="My Elite Cleaning Logo"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>
        
        <Link
          href="/login"
          className="px-6 py-2.5 text-sm font-medium text-white rounded-full transition-all duration-300 hover:scale-105 hover:shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #c93a87 0%, #d64a8f 100%)',
            boxShadow: '0 4px 15px rgba(201, 58, 135, 0.3)'
          }}
        >
          Acceder
        </Link>
      </header>

      {/* Contenido principal */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 md:px-6 text-center">
        {/* Logo y título */}
        <div className="mb-8 w-full max-w-4xl">
          <div className="flex flex-col items-center justify-center gap-3 md:gap-4 mb-6">
            <span 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] md:tracking-[0.2em] lg:tracking-[0.3em] uppercase"
              style={{ color: '#8B4B6B' }}
            >
              My Elite
            </span>
            <Image
              src="/logos/My Elite Cleaning Logo Simple.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain md:w-[70px] md:h-[70px] lg:w-[90px] lg:h-[90px]"
            />
            <span 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-[0.15em] md:tracking-[0.2em] lg:tracking-[0.3em] uppercase"
              style={{ color: '#8B4B6B' }}
            >
              Cleaning
            </span>
          </div>
          
          {/* Subtítulo de servicios */}
          <p 
            className="text-xs sm:text-sm md:text-base tracking-[0.1em] sm:tracking-[0.15em] md:tracking-[0.2em] uppercase mb-4 px-2"
            style={{ color: '#A66B7C' }}
          >
            Limpieza | Lavado | Tapicería | Planchado
          </p>
          
          {/* Eslogan */}
          <p 
            className="text-base sm:text-lg md:text-xl italic px-4"
            style={{ color: '#8B4B6B' }}
          >
            Simplificarse la vida nunca fue tan fácil...
          </p>
        </div>

        {/* Card de acceso a la plataforma */}
        <div 
          className="mt-6 sm:mt-8 p-6 sm:p-8 rounded-2xl backdrop-blur-sm max-w-md w-full mx-4"
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            boxShadow: '0 8px 32px rgba(139, 75, 107, 0.1)'
          }}
        >
          <h2 
            className="text-lg sm:text-xl font-medium mb-2"
            style={{ color: '#8B4B6B' }}
          >
            Plataforma de Gestión
          </h2>
          <p className="text-gray-600 text-xs sm:text-sm mb-6">
            Acceso exclusivo para equipos de limpieza y gestores de propiedades
          </p>
          
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full px-6 py-3.5 text-white font-medium rounded-full transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, #c93a87 0%, #d64a8f 100%)',
                boxShadow: '0 4px 15px rgba(201, 58, 135, 0.25)'
              }}
            >
              Acceder a la Plataforma
            </Link>
            
            <p className="text-xs text-gray-500 pt-2">
              ¿Necesitas ayuda?{' '}
              <a 
                href="mailto:info@myelitecleaning.com" 
                className="underline hover:text-[#c93a87] transition-colors"
              >
                info@myelitecleaning.com
              </a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer minimalista */}
      <footer className="relative z-10 py-4 text-center">
        <p className="text-xs" style={{ color: '#A66B7C' }}>
          © 2024 My Elite Cleaning - Costa del Sol
        </p>
      </footer>
    </div>
  )
}
