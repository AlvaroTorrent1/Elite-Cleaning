import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  // Buscar específicamente el usuario kitokotech
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .ilike('email', '%kitoko%')

  return NextResponse.json({
    message: "Búsqueda de usuario kitokotech",
    profiles_found: profiles
  })
}