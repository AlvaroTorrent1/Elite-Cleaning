/**
 * Función helper para obtener la URL base de la aplicación
 * 
 * Esta es la solución recomendada por Supabase para manejar redirects
 * de OAuth en diferentes entornos (desarrollo, preview, producción).
 * 
 * Prioridad:
 * 1. NEXT_PUBLIC_SITE_URL (configuración explícita para producción)
 * 2. NEXT_PUBLIC_VERCEL_URL (auto-generada por Vercel en cada deploy)
 * 3. localhost:3000 (fallback para desarrollo local)
 * 
 * @see https://supabase.com/docs/guides/auth/redirect-urls
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Configurado manualmente en producción
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automático de Vercel
    'http://localhost:3000'

  // Asegurar que incluya el protocolo https:// cuando no es localhost
  url = url.startsWith('http') ? url : `https://${url}`
  
  // Asegurar trailing slash para consistencia
  url = url.endsWith('/') ? url : `${url}/`
  
  return url
}

/**
 * Obtiene la URL para el callback de autenticación
 * Incluye la ruta /auth/callback
 */
export function getAuthCallbackURL(role?: string): string {
  const baseUrl = getURL()
  const callbackPath = 'auth/callback'
  const roleParam = role ? `?role=${role}` : ''
  
  return `${baseUrl}${callbackPath}${roleParam}`
}
