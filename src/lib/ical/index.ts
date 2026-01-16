/**
 * iCal Sync Module for Elite Cleaning
 * 
 * Provides automatic synchronization of reservations from
 * Airbnb, Booking.com, and other platforms via iCal calendars.
 * 
 * Key features:
 * - Handles Airbnb's fragmented events (merge intervals algorithm)
 * - Detects same-day turnarounds (urgent cleanings)
 * - Generates cleanings automatically for check-out dates
 * - Supports manual sync from PM dashboard and automatic cron sync
 * 
 * @example
 * // Manual sync for a property
 * import { syncPropertyConfigs } from '@/lib/ical'
 * await syncPropertyConfigs(propertyId)
 * 
 * @example
 * // Parse iCal data manually
 * import { fetchIcalData, parseIcalData, mergeOverlappingEvents } from '@/lib/ical'
 * const icalText = await fetchIcalData(url)
 * const events = parseIcalData(icalText)
 * const merged = mergeOverlappingEvents(events)
 */

// Types
export type {
  IcalEvent,
  IcalSyncConfig,
  SyncResult,
  ParseResult,
  IcalCleaningData,
  PlatformDetection,
  SyncLogEntry,
} from './types'

// Parser functions
export {
  fetchIcalData,
  parseIcalData,
  formatIcalDate,
  extractReservationCode,
  extractUidPrefix,
  extractGuestName,
  isGenericBlocked,
} from './parser'

// Merger functions (Merge Intervals algorithm)
export {
  mergeOverlappingEvents,
  shouldMergeEvents,
  groupEventsByPrefix,
  calculateConsolidatedRange,
  detectSameDayTurnaround,
} from './merger'

// Sync functions
export {
  detectBookingSource,
  syncIcalConfig,
  syncAllConfigs,
  syncPropertyConfigs,
} from './sync'
