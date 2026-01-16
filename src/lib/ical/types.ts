/**
 * iCal Sync Types for Elite Cleaning
 * 
 * Based on RFC 5545 (iCalendar) and lessons learned from production
 * handling Airbnb's fragmented events and Booking.com's clean exports.
 */

/**
 * Represents a parsed iCal event (VEVENT)
 */
export interface IcalEvent {
  /** Unique identifier from the iCal (e.g., "7f662ec65913-hash@airbnb.com") */
  uid: string
  /** Event title/summary - may contain guest name or "Reserved" */
  summary: string
  /** Start date in YYYY-MM-DD format (check-in) */
  dtstart: string
  /** End date in YYYY-MM-DD format (check-out) */
  dtend: string
  /** Optional description - may contain reservation code */
  description?: string
  /** Extracted reservation code (e.g., "HMABCDEF12") */
  reservationCode?: string
  /** Extracted UID prefix for grouping fragmented events */
  uidPrefix?: string
}

/**
 * Represents an iCal sync configuration from the database
 */
export interface IcalSyncConfig {
  id: string
  property_id: string
  platform: 'airbnb' | 'booking' | 'other'
  ical_url: string
  ical_name: string | null
  sync_interval_minutes: number
  last_sync_at: string | null
  last_sync_status: 'pending' | 'syncing' | 'success' | 'error'
  last_sync_error: string | null
  last_sync_events_found: number
  last_sync_cleanings_created: number
  last_sync_cleanings_updated: number
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean
  configId: string
  propertyId: string
  platform: string
  eventsFound: number
  cleaningsCreated: number
  cleaningsUpdated: number
  cleaningsCancelled: number
  error?: string
  duration: number // milliseconds
}

/**
 * Result of parsing an iCal file
 */
export interface ParseResult {
  events: IcalEvent[]
  rawEventsCount: number
  mergedEventsCount: number
}

/**
 * Cleaning data to be created/updated from iCal
 */
export interface IcalCleaningData {
  property_id: string
  scheduled_date: string // check-out date
  ical_event_uid: string
  ical_booking_uid_prefix: string | null
  ical_platform: 'airbnb' | 'booking' | 'other'
  ical_config_id: string
  ical_guest_name: string | null
  ical_check_in_date: string | null
  ical_check_out_date: string
  ical_raw_event: IcalEvent
  is_urgent: boolean
  is_manual: false
  status: 'pending'
}

/**
 * Platform detection result
 */
export interface PlatformDetection {
  platform: 'airbnb' | 'booking' | 'other'
  confidence: 'high' | 'medium' | 'low'
  source: 'uid_domain' | 'ical_name' | 'fallback'
}

/**
 * Sync log entry for ical_sync_logs table
 */
export interface SyncLogEntry {
  property_id: string
  platform: 'airbnb' | 'booking' | 'other'
  sync_status: 'success' | 'error'
  events_found: number
  events_created: number
  events_updated: number
  events_cancelled: number
  error_message?: string
}
