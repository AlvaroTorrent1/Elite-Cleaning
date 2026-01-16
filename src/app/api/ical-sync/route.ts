/**
 * iCal Sync API Route
 * 
 * Endpoints:
 * - POST: Manual sync for a specific property (triggered from PM dashboard)
 * - GET: Automatic sync of all configs (triggered by Vercel Cron every 15 min)
 * 
 * Security:
 * - POST requires authentication and ownership verification
 * - GET requires Vercel Cron authorization header
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncPropertyConfigs, syncAllConfigs } from '@/lib/ical'

/**
 * POST /api/ical-sync
 * 
 * Manual sync for a specific property.
 * Called from the PM dashboard when user clicks "Sincronizar ahora".
 * 
 * Body: { propertyId: string }
 * 
 * Requires:
 * - User must be authenticated
 * - User must be the property manager of the property OR admin
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { propertyId } = body

    if (!propertyId) {
      return NextResponse.json(
        { error: 'propertyId es requerido' },
        { status: 400 }
      )
    }

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      )
    }

    // Verify ownership: user must be PM of this property OR admin
    if (profile.role !== 'admin') {
      const { data: property } = await supabase
        .from('properties')
        .select('property_manager_id')
        .eq('id', propertyId)
        .single()

      if (!property || property.property_manager_id !== user.id) {
        return NextResponse.json(
          { error: 'No tienes permisos para sincronizar esta propiedad' },
          { status: 403 }
        )
      }
    }

    // Perform sync
    console.log(`🔄 Manual sync requested for property ${propertyId} by user ${user.id}`)
    const results = await syncPropertyConfigs(propertyId)

    // Calculate totals
    const totals = results.reduce(
      (acc, r) => ({
        eventsFound: acc.eventsFound + r.eventsFound,
        cleaningsCreated: acc.cleaningsCreated + r.cleaningsCreated,
        cleaningsUpdated: acc.cleaningsUpdated + r.cleaningsUpdated,
        cleaningsCancelled: acc.cleaningsCancelled + r.cleaningsCancelled,
        errors: acc.errors + (r.error ? 1 : 0),
      }),
      { eventsFound: 0, cleaningsCreated: 0, cleaningsUpdated: 0, cleaningsCancelled: 0, errors: 0 }
    )

    return NextResponse.json({
      success: totals.errors === 0,
      message: totals.errors === 0 
        ? 'Sincronización completada' 
        : 'Sincronización completada con errores',
      results,
      totals,
      syncedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in POST /api/ical-sync:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ical-sync
 * 
 * Automatic sync of all iCal configs that need syncing.
 * Can be triggered by:
 * - Vercel Cron (with Authorization header)
 * - External cron service like cron-job.org (with ?secret= query param)
 * 
 * Security:
 * - In production, requires CRON_SECRET via header OR query param
 * - In development, allows unauthenticated requests
 */
export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET

    // In production, verify authorization
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      const authHeader = request.headers.get('authorization')
      const { searchParams } = new URL(request.url)
      const querySecret = searchParams.get('secret')

      // Accept either: Authorization header OR query param ?secret=
      const isAuthorizedByHeader = authHeader === `Bearer ${cronSecret}`
      const isAuthorizedByQuery = querySecret === cronSecret

      if (!isAuthorizedByHeader && !isAuthorizedByQuery) {
        console.warn('⚠️ Unauthorized cron request')
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        )
      }
    }

    console.log('🕐 Cron sync triggered')

    // Perform sync for all configs that need it
    const results = await syncAllConfigs()

    // Calculate summary
    const summary = {
      configsProcessed: results.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      totalEventsFound: results.reduce((sum, r) => sum + r.eventsFound, 0),
      totalCleaningsCreated: results.reduce((sum, r) => sum + r.cleaningsCreated, 0),
      totalCleaningsUpdated: results.reduce((sum, r) => sum + r.cleaningsUpdated, 0),
      totalCleaningsCancelled: results.reduce((sum, r) => sum + r.cleaningsCancelled, 0),
      averageDuration: results.length > 0 
        ? Math.round(results.reduce((sum, r) => sum + r.duration, 0) / results.length)
        : 0,
    }

    console.log(`✅ Cron sync completed: ${summary.successful}/${summary.configsProcessed} successful`)

    return NextResponse.json({
      success: summary.failed === 0,
      message: summary.configsProcessed === 0 
        ? 'No hay configuraciones pendientes de sincronizar'
        : `Sincronizadas ${summary.successful} de ${summary.configsProcessed} configuraciones`,
      summary,
      results: process.env.NODE_ENV === 'development' ? results : undefined, // Only include details in dev
      syncedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Error in GET /api/ical-sync:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
