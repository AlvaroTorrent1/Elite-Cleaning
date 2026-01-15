import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

type UserRole = 'admin' | 'cleaner' | 'property_manager'

const validRoles: UserRole[] = ['admin', 'cleaner', 'property_manager']

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const requestedRole = searchParams.get('role') as UserRole | null // Rol solicitado por el usuario
  const next = searchParams.get('next') ?? '/'
  
  // CRITICAL: Use production URL in Vercel, localhost in development
  // This prevents redirect to localhost when deployed
  const origin = process.env.NEXT_PUBLIC_SITE_URL 
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || 'http://localhost:3000'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Obtener el usuario autenticado
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Verificar perfil actual
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('role, is_approved')
          .eq('id', user.id)
          .single()

        let profile = existingProfile

        // LÓGICA DE CORRECCIÓN DE ROL:
        // Si el usuario pidió un rol específico (admin/pm) y el perfil actual es 'cleaner' (default del trigger),
        // asumimos que el trigger se equivocó y forzamos la actualización.
        if (profile && requestedRole && profile.role === 'cleaner' && requestedRole !== 'cleaner') {
          console.log(`⚠️ Corrigiendo rol: ${profile.role} -> ${requestedRole}`)
          
          // Todos los roles tienen acceso libre con Google OAuth (sin aprobación manual requerida)
          const isApproved = true

          const { data: updatedProfile, error: updateError } = await supabase
            .from('profiles')
            .update({ 
              role: requestedRole,
              is_approved: isApproved
            })
            .eq('id', user.id)
            .select()
            .single()

          if (!updateError && updatedProfile) {
            profile = updatedProfile // Usar el perfil corregido
          } else {
            console.error('Error al corregir rol:', updateError)
          }
        }

        // AUTO-APROBAR usuarios existentes que tengan is_approved: false
        // (Todos los roles tienen acceso libre con Google OAuth)
        if (profile && !profile.is_approved) {
          console.log(`✅ Auto-aprobando usuario con rol: ${profile.role}`)
          
          const { data: approvedProfile, error: approveError } = await supabase
            .from('profiles')
            .update({ is_approved: true })
            .eq('id', user.id)
            .select()
            .single()

          if (!approveError && approvedProfile) {
            profile = approvedProfile
          } else {
            console.error('Error al auto-aprobar:', approveError)
          }
        }
        
        // Si el perfil no existe (caso raro), intentar crearlo/recuperarlo
        if (profileError && profileError.code === 'PGRST116') {
             // ... lógica de fallback si fuera necesaria ...
             // Por ahora redirigimos a selección si falla todo
             return NextResponse.redirect(`${origin}/select-role?error=no_profile`)
        }

        // Redirigir según el rol FINAL del perfil
        if (profile) {
          // Redirigir al panel correspondiente (todos los roles tienen acceso libre)
          switch (profile.role) {
            case 'admin':
              return NextResponse.redirect(`${origin}/admin`)
            case 'cleaner':
              return NextResponse.redirect(`${origin}/limpiadora`)
            case 'property_manager':
              return NextResponse.redirect(`${origin}/pm`)
            default:
              return NextResponse.redirect(`${origin}${next}`)
          }
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Si hay error, redirigir al login con mensaje de error
  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
