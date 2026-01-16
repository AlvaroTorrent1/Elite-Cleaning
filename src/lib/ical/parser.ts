/**
 * iCal Parser for Elite Cleaning
 * 
 * Parses RFC 5545 (iCalendar) files from Airbnb, Booking.com, and other platforms.
 * Handles line folding, date formats, and extracts reservation metadata.
 * 
 * @see https://datatracker.ietf.org/doc/html/rfc5545
 */

import type { IcalEvent } from './types'

/**
 * Fetch iCal data from a URL
 * 
 * Uses a custom User-Agent to avoid being blocked by some providers.
 * Handles common HTTP errors gracefully.
 */
export async function fetchIcalData(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'EliteCleaning Calendar Sync/1.0',
        'Accept': 'text/calendar, text/plain, */*',
      },
      // 30 second timeout
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const text = await response.text()
    
    // Basic validation - should start with VCALENDAR
    if (!text.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCal format: missing VCALENDAR')
    }

    return text
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'TimeoutError') {
        throw new Error('Request timeout: iCal server took too long to respond')
      }
      throw error
    }
    throw new Error('Failed to fetch iCal data')
  }
}

/**
 * Parse iCal text data into structured events
 * 
 * Handles:
 * - Line folding (lines continued with space/tab)
 * - Multiple date formats (DATE, DATE-TIME, with/without timezone)
 * - Extraction of reservation codes from description
 */
export function parseIcalData(icalData: string): IcalEvent[] {
  const events: IcalEvent[] = []

  // Step 1: Unfold lines (RFC 5545 line folding)
  // Lines can be "folded" by inserting CRLF + whitespace
  const unfoldedData = icalData.replace(/\r?\n[ \t]/g, '')

  // Step 2: Split into lines and clean
  const lines = unfoldedData
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0)

  // Step 3: Parse events
  let currentEvent: Partial<IcalEvent> = {}
  let inEvent = false

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
      continue
    }

    if (line === 'END:VEVENT') {
      // Validate and add event
      if (currentEvent.uid && currentEvent.dtstart && currentEvent.dtend) {
        // Try to extract reservation code
        currentEvent.reservationCode = 
          extractReservationCode(currentEvent.description || '') ||
          extractReservationCode(currentEvent.summary || '')

        // Extract UID prefix for grouping
        currentEvent.uidPrefix = extractUidPrefix(currentEvent.uid)

        events.push(currentEvent as IcalEvent)
      }
      inEvent = false
      currentEvent = {}
      continue
    }

    if (!inEvent) continue

    // Parse properties
    // Format: PROPERTY;PARAMS:VALUE or PROPERTY:VALUE
    const colonIndex = line.indexOf(':')
    if (colonIndex === -1) continue

    const propertyPart = line.substring(0, colonIndex)
    const value = line.substring(colonIndex + 1)

    // Get property name (before any semicolon params)
    const propertyName = propertyPart.split(';')[0].toUpperCase()

    switch (propertyName) {
      case 'UID':
        currentEvent.uid = value
        break
      case 'SUMMARY':
        currentEvent.summary = unescapeIcalText(value)
        break
      case 'DTSTART':
        currentEvent.dtstart = formatIcalDate(value)
        break
      case 'DTEND':
        currentEvent.dtend = formatIcalDate(value)
        break
      case 'DESCRIPTION':
        currentEvent.description = unescapeIcalText(value)
        break
    }
  }

  return events
}

/**
 * Format iCal date to ISO format (YYYY-MM-DD)
 * 
 * Handles multiple iCal date formats:
 * - YYYYMMDD (date only)
 * - YYYYMMDDTHHMMSS (local time)
 * - YYYYMMDDTHHMMSSZ (UTC)
 */
export function formatIcalDate(icalDate: string): string {
  // Remove any parameters (VALUE=DATE, TZID, etc.)
  const cleanDate = icalDate.replace(/^.*:/, '')

  // Extract date parts
  if (cleanDate.length >= 8) {
    const year = cleanDate.substring(0, 4)
    const month = cleanDate.substring(4, 6)
    const day = cleanDate.substring(6, 8)
    return `${year}-${month}-${day}`
  }

  // Fallback: return as-is (shouldn't happen with valid iCal)
  return icalDate
}

/**
 * Unescape iCal text values
 * 
 * iCal escapes special characters:
 * - \n or \N → newline
 * - \, → comma
 * - \; → semicolon
 * - \\ → backslash
 */
function unescapeIcalText(text: string): string {
  return text
    .replace(/\\n/gi, '\n')
    .replace(/\\,/g, ',')
    .replace(/\\;/g, ';')
    .replace(/\\\\/g, '\\')
}

/**
 * Extract reservation code from text
 * 
 * Looks for common patterns:
 * - "Reservation code: XXXXX"
 * - Airbnb codes starting with "HM" (10 chars)
 * - Booking.com confirmation numbers
 */
export function extractReservationCode(text: string): string | undefined {
  if (!text) return undefined

  // Pattern 1: "Reservation code: XXXXX"
  const reservationMatch = text.match(/Reservation code:\s*([A-Z0-9]+)/i)
  if (reservationMatch) return reservationMatch[1]

  // Pattern 2: Airbnb codes (HM + 8 alphanumeric)
  const airbnbMatch = text.match(/\b(HM[A-Z0-9]{8})\b/)
  if (airbnbMatch) return airbnbMatch[1]

  // Pattern 3: Booking.com confirmation (usually numeric)
  const bookingMatch = text.match(/\b(\d{10,})\b/)
  if (bookingMatch) return bookingMatch[1]

  return undefined
}

/**
 * Extract UID prefix for grouping fragmented events
 * 
 * Airbnb UIDs follow pattern: "PREFIX-HASH@airbnb.com"
 * All fragments of the same reservation share the same PREFIX.
 * 
 * Booking.com UIDs: "HASH@booking.com" (no fragmentation, but we use first 8 chars)
 */
export function extractUidPrefix(uid: string): string | null {
  if (!uid) return null

  // Airbnb pattern: prefijo-hash@airbnb.com
  // The prefix before the first hyphen identifies the reservation
  const airbnbMatch = uid.match(/^([^-]+)-/)
  if (airbnbMatch && airbnbMatch[1].length >= 8) {
    return airbnbMatch[1]
  }

  // Booking.com pattern: use first 8 characters
  if (uid.includes('@booking.com')) {
    return uid.substring(0, 8)
  }

  // Generic: first 8 characters if long enough
  if (uid.length >= 8) {
    return uid.substring(0, 8)
  }

  return null
}

/**
 * Extract guest name from summary if available
 * 
 * Common patterns:
 * - "Reserved for John Doe"
 * - "John Doe - Airbnb"
 * - "John Doe (Booking.com)"
 * 
 * Returns null for generic summaries like "Reserved", "Not available", etc.
 */
export function extractGuestName(summary: string): string | null {
  if (!summary) return null

  // Skip generic summaries
  const genericPatterns = [
    /^reserved$/i,
    /^not available$/i,
    /^blocked$/i,
    /^airbnb \(not available\)$/i,
    /^no disponible$/i,
    /^bloqueado$/i,
  ]

  for (const pattern of genericPatterns) {
    if (pattern.test(summary.trim())) {
      return null
    }
  }

  // Pattern 1: "Reserved for Name"
  const reservedForMatch = summary.match(/(?:reserved for|reservado para)\s+(.+)/i)
  if (reservedForMatch) {
    return reservedForMatch[1].trim()
  }

  // Pattern 2: "Name - Platform" or "Name (Platform)"
  const platformSuffixMatch = summary.match(/^(.+?)\s*[-–(]\s*(?:Airbnb|Booking|VRBO)/i)
  if (platformSuffixMatch) {
    return platformSuffixMatch[1].trim()
  }

  // Pattern 3: If it looks like a name (2+ words, starts with capital)
  const nameMatch = summary.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
  if (nameMatch) {
    return nameMatch[1].trim()
  }

  // If summary is not generic and has content, use it as guest name
  if (summary.length > 2 && summary.length < 100) {
    return summary.trim()
  }

  return null
}

/**
 * Check if a summary represents a generic blocked/unavailable event
 */
export function isGenericBlocked(summary: string): boolean {
  const s = summary.toLowerCase().trim()
  return (
    s === 'not available' ||
    s === 'blocked' ||
    s === 'reserved' ||
    s === 'airbnb (not available)' ||
    s === 'no disponible' ||
    s === 'bloqueado' ||
    s === 'reservado' ||
    s.includes('closed')
  )
}
