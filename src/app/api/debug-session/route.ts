import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Endpoint de debugging para ver la sesión actual
// Solo para desarrollo - eliminar en producción
export async function GET() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError) {
    return NextResponse.json({
      authenticated: false,
      error: userError.message,
      debug: 'Error getting user from Supabase auth'
    })
  }
  
  if (!user) {
    return NextResponse.json({
      authenticated: false,
      error: 'No user session found',
      debug: 'No active session - user needs to login'
    })
  }
  
  // Obtener perfil
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (profileError) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      },
      profile: null,
      profileError: profileError.message,
      debug: 'User exists in auth but profile query failed - check RLS policies'
    })
  }
  
  if (!profile) {
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider
      },
      profile: null,
      debug: 'User exists in auth but no profile found in database'
    })
  }
  
  // Determinar a qué panel debe ir
  let correctPanel = '/login'
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
  
  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider
    },
    profile: {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      is_active: profile.is_active,
      is_approved: profile.is_approved
    },
    routing: {
      correctPanel,
      explanation: `User role is "${profile.role}", so they should be redirected to "${correctPanel}"`
    },
    debug: 'Session is valid and profile exists'
  })
}
