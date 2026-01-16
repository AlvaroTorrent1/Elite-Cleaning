import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

/**
 * DEV ONLY: Ruta para cambiar el rol de un usuario en desarrollo
 * 
 * Uso: GET /dev/switch-role?role=property_manager
 * 
 * Roles válidos: admin, cleaner, property_manager
 * 
 * Esta ruta:
 * 1. Solo funciona en desarrollo (NODE_ENV !== 'production')
 * 2. Cambia el rol del usuario autenticado
 * 3. Redirige al panel correspondiente
 */

type UserRole = 'admin' | 'cleaner' | 'property_manager'

const roleRedirects: Record<UserRole, string> = {
  admin: '/admin',
  cleaner: '/limpiadora',
  property_manager: '/pm',
}

export async function GET(request: Request) {
  // SEGURIDAD: Solo permitir en desarrollo
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Esta ruta solo está disponible en desarrollo' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const role = searchParams.get('role') as UserRole | null

  if (!role || !['admin', 'cleaner', 'property_manager'].includes(role)) {
    return NextResponse.json(
      { 
        error: 'Rol inválido',
        usage: '/dev/switch-role?role=admin|cleaner|property_manager'
      },
      { status: 400 }
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Actualizar el rol en la base de datos
  const { error } = await supabase
    .from('profiles')
    .update({ 
      role: role,
      is_approved: true // Auto-aprobar para desarrollo
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { error: 'Error al cambiar rol', details: error.message },
      { status: 500 }
    )
  }

  // Redirigir al panel correspondiente
  const redirectUrl = new URL(roleRedirects[role], request.url)
  return NextResponse.redirect(redirectUrl)
}
