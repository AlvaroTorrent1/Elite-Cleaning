/**
 * iCal Synchronizer for Elite Cleaning
 * 
 * Orchestrates the full sync process:
 * 1. Fetch iCal data from URL
 * 2. Parse events
 * 3. Merge fragmented events
 * 4. Generate cleanings for check-out dates
 * 5. Update database
 * 
 * Designed to run in Next.js API routes (Node.js environment).
 */

import { createClient } from '@/lib/supabase/server'
import type { IcalEvent, IcalSyncConfig, SyncResult, IcalCleaningData } from './types'
import { fetchIcalData, parseIcalData, extractGuestName, extractUidPrefix } from './parser'
import { mergeOverlappingEvents, groupEventsByPrefix, calculateConsolidatedRange, detectSameDayTurnaround } from './merger'

/**
 * Detect the booking source (platform) from UID and config name
 * 
 * Priority:
 * 1. UID domain (most reliable - comes directly from provider)
 * 2. Config name (fallback)
 * 
 * This prevents inconsistencies where Airbnb reservations
 * might end up with source="booking" due to misconfiguration.
 */
export function detectBookingSource(
  uid: string,
  configPlatform: string
): 'airbnb' | 'booking' | 'other' {
  // Priority 1: Detect from UID domain (most reliable)
  if (uid.includes('@airbnb.com')) {
    return 'airbnb'
  }
  if (uid.includes('@booking.com')) {
    return 'booking'
  }
  if (uid.toLowerCase().includes('vrbo')) {
    return 'other'
  }

  // Priority 2: Use config platform
  if (configPlatform === 'airbnb' || configPlatform === 'booking') {
    return configPlatform
  }

  return 'other'
}

/**
 * Sync a single iCal configuration
 * 
 * This is the main entry point for syncing one calendar.
 * Returns a SyncResult with statistics and any errors.
 */
export async function syncIcalConfig(config: IcalSyncConfig): Promise<SyncResult> {
  const startTime = Date.now()
  const supabase = await createClient()

  try {
    console.log(`🔄 Syncing iCal: ${config.ical_name || config.platform} for property ${config.property_id}`)

    // Step 1: Mark as syncing
    await supabase
      .from('ical_sync_configs')
      .update({ last_sync_status: 'syncing' })
      .eq('id', config.id)

    // Step 2: Fetch iCal data
    console.log(`📥 Fetching iCal from URL...`)
    const icalData = await fetchIcalData(config.ical_url)

    // Step 3: Parse events
    const rawEvents = parseIcalData(icalData)
    console.log(`📅 Parsed ${rawEvents.length} raw events`)

    // Step 4: Merge fragmented events
    const mergedEvents = mergeOverlappingEvents(rawEvents)
    console.log(`🔗 Merged into ${mergedEvents.length} reservations`)

    // Step 5: Sync to database and generate cleanings
    const syncStats = await syncEventsToDatabase(config, mergedEvents)

    // Step 6: Update config with success status
    await supabase
      .from('ical_sync_configs')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'success',
        last_sync_error: null,
        last_sync_events_found: mergedEvents.length,
        last_sync_cleanings_created: syncStats.created,
        last_sync_cleanings_updated: syncStats.updated,
      })
      .eq('id', config.id)

    // Step 7: Log the sync
    await supabase.from('ical_sync_logs').insert({
      property_id: config.property_id,
      platform: config.platform,
      sync_status: 'success',
      events_found: mergedEvents.length,
      events_created: syncStats.created,
      events_updated: syncStats.updated,
      events_cancelled: syncStats.cancelled,
    })

    const result: SyncResult = {
      success: true,
      configId: config.id,
      propertyId: config.property_id,
      platform: config.platform,
      eventsFound: mergedEvents.length,
      cleaningsCreated: syncStats.created,
      cleaningsUpdated: syncStats.updated,
      cleaningsCancelled: syncStats.cancelled,
      duration: Date.now() - startTime,
    }

    console.log(`✅ Sync completed: ${syncStats.created} created, ${syncStats.updated} updated, ${syncStats.cancelled} cancelled`)
    return result

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error(`❌ Sync failed: ${errorMessage}`)

    // Update config with error status
    await supabase
      .from('ical_sync_configs')
      .update({
        last_sync_at: new Date().toISOString(),
        last_sync_status: 'error',
        last_sync_error: errorMessage,
      })
      .eq('id', config.id)

    // Log the error
    await supabase.from('ical_sync_logs').insert({
      property_id: config.property_id,
      platform: config.platform,
      sync_status: 'error',
      events_found: 0,
      events_created: 0,
      events_updated: 0,
      events_cancelled: 0,
      error_message: errorMessage,
    })

    return {
      success: false,
      configId: config.id,
      propertyId: config.property_id,
      platform: config.platform,
      eventsFound: 0,
      cleaningsCreated: 0,
      cleaningsUpdated: 0,
      cleaningsCancelled: 0,
      error: errorMessage,
      duration: Date.now() - startTime,
    }
  }
}

/**
 * Sync events to database and generate cleanings
 * 
 * Strategy:
 * 1. Group incoming events by UID prefix
 * 2. For each group, calculate consolidated date range
 * 3. Find existing cleaning with matching UID prefix → UPDATE
 * 4. If no existing → CREATE new cleaning
 * 5. Mark cleanings not in current sync as cancelled (if appropriate)
 */
async function syncEventsToDatabase(
  config: IcalSyncConfig,
  events: IcalEvent[]
): Promise<{ created: number; updated: number; cancelled: number }> {
  const supabase = await createClient()
  let created = 0
  let updated = 0
  let cancelled = 0

  // Get existing cleanings for this config
  const { data: existingCleanings, error: fetchError } = await supabase
    .from('cleanings')
    .select('*')
    .eq('ical_config_id', config.id)
    .neq('status', 'cancelled')

  if (fetchError) {
    console.error('Error fetching existing cleanings:', fetchError)
    throw fetchError
  }

  // Build map of existing cleanings by UID prefix
  // Using array to handle multiple fragments with same prefix
  const existingByPrefix = new Map<string, typeof existingCleanings>()
  for (const cleaning of existingCleanings || []) {
    const prefix = cleaning.ical_booking_uid_prefix
    if (prefix) {
      const group = existingByPrefix.get(prefix) || []
      group.push(cleaning)
      existingByPrefix.set(prefix, group)
    }
  }

  // Group incoming events by UID prefix
  const eventsByPrefix = groupEventsByPrefix(events)
  const processedPrefixes = new Set<string>()

  // Process each group of events
  for (const [prefix, groupEvents] of eventsByPrefix) {
    processedPrefixes.add(prefix)

    // Calculate consolidated range
    const { minStart, maxEnd, bestEvent } = calculateConsolidatedRange(groupEvents)
    
    // Detect platform from UID
    const detectedPlatform = detectBookingSource(bestEvent.uid, config.platform)

    // Extract guest name
    const guestName = extractGuestName(bestEvent.summary)

    // Detect if this is an urgent cleaning (same-day turnaround)
    const isUrgent = detectSameDayTurnaround(maxEnd, events)

    // Check if cleaning exists with this prefix
    const existingGroup = existingByPrefix.get(prefix)

    if (existingGroup && existingGroup.length > 0) {
      // UPDATE existing cleaning
      const primaryCleaning = existingGroup[0]
      
      // Check if dates changed
      const existingCheckOut = primaryCleaning.ical_check_out_date?.split('T')[0]
      const datesChanged = existingCheckOut !== maxEnd

      if (datesChanged || existingGroup.length > 1) {
        // Update primary cleaning with consolidated range
        const { error: updateError } = await supabase
          .from('cleanings')
          .update({
            scheduled_date: maxEnd, // Cleaning on check-out date
            ical_check_in_date: minStart,
            ical_check_out_date: maxEnd,
            ical_guest_name: guestName || primaryCleaning.ical_guest_name,
            ical_platform: detectedPlatform,
            is_urgent: isUrgent,
            ical_raw_event: bestEvent,
            updated_at: new Date().toISOString(),
          })
          .eq('id', primaryCleaning.id)

        if (updateError) {
          console.error(`Error updating cleaning ${primaryCleaning.id}:`, updateError)
        } else {
          updated++
        }

        // Delete duplicate cleanings (all except primary)
        if (existingGroup.length > 1) {
          const idsToDelete = existingGroup.slice(1).map(c => c.id)
          await supabase
            .from('cleanings')
            .delete()
            .in('id', idsToDelete)
          
          console.log(`🗑️ Deleted ${idsToDelete.length} duplicate cleanings`)
        }
      }
    } else {
      // CREATE new cleaning
      const newCleaning: Partial<IcalCleaningData> = {
        property_id: config.property_id,
        scheduled_date: maxEnd, // Cleaning on check-out date
        ical_event_uid: bestEvent.uid,
        ical_booking_uid_prefix: prefix,
        ical_platform: detectedPlatform,
        ical_config_id: config.id,
        ical_guest_name: guestName,
        ical_check_in_date: minStart,
        ical_check_out_date: maxEnd,
        ical_raw_event: bestEvent,
        is_urgent: isUrgent,
        is_manual: false,
        status: 'pending',
      }

      const { error: insertError } = await supabase
        .from('cleanings')
        .insert(newCleaning)

      if (insertError) {
        console.error('Error creating cleaning:', insertError)
      } else {
        created++
      }
    }
  }

  // Handle cancelled reservations
  // If a UID prefix existed before but is not in current sync,
  // the reservation was likely cancelled
  for (const [prefix, cleanings] of existingByPrefix) {
    if (!processedPrefixes.has(prefix)) {
      // This prefix is no longer in the iCal → reservation cancelled
      for (const cleaning of cleanings) {
        // Only cancel if it's pending or assigned (not in_progress or completed)
        if (cleaning.status === 'pending' || cleaning.status === 'assigned') {
          const { error: cancelError } = await supabase
            .from('cleanings')
            .update({
              status: 'cancelled',
              notes: `Cancelado automáticamente: reserva eliminada de ${config.platform}`,
              updated_at: new Date().toISOString(),
            })
            .eq('id', cleaning.id)

          if (!cancelError) {
            cancelled++
            console.log(`🚫 Cancelled cleaning ${cleaning.id} (reservation removed from iCal)`)
          }
        }
      }
    }
  }

  return { created, updated, cancelled }
}

/**
 * Sync all active iCal configurations that need syncing
 * 
 * Used by the cron job to process all calendars.
 * Respects the sync_interval_minutes of each config.
 */
export async function syncAllConfigs(): Promise<SyncResult[]> {
  const supabase = await createClient()
  const results: SyncResult[] = []

  // Get configs that need syncing
  const { data: configs, error } = await supabase
    .rpc('get_ical_configs_to_sync')

  if (error) {
    console.error('Error fetching configs to sync:', error)
    // Fallback: get all active configs
    const { data: allConfigs } = await supabase
      .from('ical_sync_configs')
      .select('*')
      .eq('is_active', true)
    
    if (allConfigs) {
      for (const config of allConfigs) {
        const result = await syncIcalConfig(config)
        results.push(result)
      }
    }
    return results
  }

  if (!configs || configs.length === 0) {
    console.log('📭 No configs need syncing at this time')
    return results
  }

  console.log(`📊 Processing ${configs.length} iCal configurations`)

  for (const config of configs) {
    const result = await syncIcalConfig(config)
    results.push(result)

    // Small delay between syncs to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  return results
}

/**
 * Sync a single property's iCal configs (manual sync from PM dashboard)
 * 
 * Syncs all active configs for the given property.
 */
export async function syncPropertyConfigs(propertyId: string): Promise<SyncResult[]> {
  const supabase = await createClient()
  const results: SyncResult[] = []

  const { data: configs, error } = await supabase
    .from('ical_sync_configs')
    .select('*')
    .eq('property_id', propertyId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching property configs:', error)
    throw error
  }

  if (!configs || configs.length === 0) {
    console.log(`📭 No active iCal configs for property ${propertyId}`)
    return results
  }

  for (const config of configs) {
    const result = await syncIcalConfig(config)
    results.push(result)
  }

  return results
}
