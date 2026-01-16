/**
 * Merge Intervals Algorithm for iCal Events
 * 
 * Solves the Airbnb fragmentation problem where a single reservation
 * arrives as multiple overlapping or consecutive events.
 * 
 * Based on LeetCode #56 "Merge Intervals", adapted for iCal semantics.
 * 
 * @see https://leetcode.com/problems/merge-intervals/
 */

import type { IcalEvent } from './types'
import { extractUidPrefix, isGenericBlocked } from './parser'

/**
 * Merge overlapping and consecutive events from the same reservation
 * 
 * PROBLEM SOLVED:
 * Airbnb sends fragmented events for a single reservation:
 *   - Event A: Dec 04-05 (1 night)
 *   - Event B: Dec 05-06 (1 night)
 *   - Event C: Dec 06-09 (3 nights)
 * All have the same UID prefix → should be ONE event: Dec 04-09
 * 
 * ALGORITHM:
 * 1. Sort events by start date
 * 2. Group by identity (same reservation)
 * 3. Merge if: overlapping (end >= start) OR consecutive (end == start)
 * 4. Take the max end date of merged events
 * 
 * CORNER CASES HANDLED:
 * - Consecutive: [1-5], [5-8] → [1-8]
 * - Overlapping: [1-10], [3-5] → [1-10]
 * - Extension: [1-5], [3-8] → [1-8]
 * - Contained: [1-10], [2-3], [4-5] → [1-10]
 * - Gap (no merge): [1-3], [5-7] → [1-3], [5-7]
 */
export function mergeOverlappingEvents(events: IcalEvent[]): IcalEvent[] {
  if (events.length === 0) return []
  if (events.length === 1) return [...events]

  // Step 1: Sort by start date (critical for merge algorithm)
  const sorted = [...events].sort((a, b) => 
    a.dtstart.localeCompare(b.dtstart)
  )

  const merged: IcalEvent[] = []
  let current: IcalEvent = { ...sorted[0] }

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]

    // Normalize dates for comparison (remove time component if present)
    const currentEnd = current.dtend.split('T')[0]
    const nextStart = next.dtstart.split('T')[0]
    const nextEnd = next.dtend.split('T')[0]

    // Check if events overlap or are consecutive
    // nextStart <= currentEnd means they touch or overlap
    const overlapsOrConsecutive = nextStart <= currentEnd

    // Check if they belong to the same reservation
    const sameReservation = shouldMergeEvents(current, next)

    if (overlapsOrConsecutive && sameReservation) {
      // MERGE: Extend the end date to the maximum
      if (nextEnd > currentEnd) {
        current = {
          ...current,
          dtend: next.dtend,
        }
      }

      // Preserve reservation code if current doesn't have one
      if (!current.reservationCode && next.reservationCode) {
        current.reservationCode = next.reservationCode
      }

      // Preserve description if current doesn't have one
      if (!current.description && next.description) {
        current.description = next.description
      }

      // Preserve guest name in summary if current is generic
      if (isGenericBlocked(current.summary) && !isGenericBlocked(next.summary)) {
        current.summary = next.summary
      }
    } else {
      // NO MERGE: Save current and start new group
      merged.push(current)
      current = { ...next }
    }
  }

  // Don't forget the last event
  merged.push(current)

  return merged
}

/**
 * Determine if two events belong to the same reservation
 * 
 * Identity criteria (in priority order):
 * 1. Same reservation code (if both have one)
 * 2. Same UID prefix (Airbnb fragmentation pattern)
 * 3. Same non-generic summary (guest name)
 * 4. Both are generic blocks with same UID prefix
 * 
 * DEFAULT: Don't merge (safety) - avoid merging different reservations
 */
export function shouldMergeEvents(a: IcalEvent, b: IcalEvent): boolean {
  // Priority 1: Same reservation code (highest confidence)
  if (a.reservationCode && b.reservationCode) {
    return a.reservationCode === b.reservationCode
  }

  // Priority 2: Same UID prefix (Airbnb pattern)
  const prefixA = a.uidPrefix || extractUidPrefix(a.uid)
  const prefixB = b.uidPrefix || extractUidPrefix(b.uid)
  
  if (prefixA && prefixB && prefixA === prefixB) {
    return true
  }

  // Priority 3: Same non-generic summary (guest name)
  if (a.summary === b.summary && !isGenericBlocked(a.summary)) {
    return true
  }

  // Priority 4: Both are generic blocks with same UID prefix
  if (isGenericBlocked(a.summary) && isGenericBlocked(b.summary)) {
    return prefixA === prefixB && prefixA !== null
  }

  // Default: Don't merge (safety)
  return false
}

/**
 * Group events by UID prefix
 * 
 * Returns a Map where:
 * - Key: UID prefix (or full UID if no prefix extractable)
 * - Value: Array of events with that prefix
 * 
 * This is useful for consolidating events that arrived in different syncs.
 */
export function groupEventsByPrefix(events: IcalEvent[]): Map<string, IcalEvent[]> {
  const groups = new Map<string, IcalEvent[]>()

  for (const event of events) {
    const prefix = event.uidPrefix || extractUidPrefix(event.uid) || event.uid
    
    const group = groups.get(prefix) || []
    group.push(event)
    groups.set(prefix, group)
  }

  return groups
}

/**
 * Calculate the consolidated date range for a group of events
 * 
 * Returns the minimum start date and maximum end date.
 */
export function calculateConsolidatedRange(events: IcalEvent[]): {
  minStart: string
  maxEnd: string
  bestEvent: IcalEvent
} {
  if (events.length === 0) {
    throw new Error('Cannot calculate range of empty event array')
  }

  let minStart = events[0].dtstart.split('T')[0]
  let maxEnd = events[0].dtend.split('T')[0]
  let bestEvent = events[0]

  for (const event of events) {
    const start = event.dtstart.split('T')[0]
    const end = event.dtend.split('T')[0]

    if (start < minStart) minStart = start
    if (end > maxEnd) maxEnd = end

    // Prefer event with more information
    if (
      (event.reservationCode && !bestEvent.reservationCode) ||
      (!isGenericBlocked(event.summary) && isGenericBlocked(bestEvent.summary))
    ) {
      bestEvent = event
    }
  }

  return { minStart, maxEnd, bestEvent }
}

/**
 * Detect if there's a same-day turnaround (urgent cleaning)
 * 
 * Returns true if the check-out date of one reservation
 * matches the check-in date of another reservation.
 * 
 * This means the cleaning must happen between check-out and check-in
 * on the same day → URGENT
 */
export function detectSameDayTurnaround(
  checkOutDate: string,
  allEvents: IcalEvent[]
): boolean {
  const normalizedCheckOut = checkOutDate.split('T')[0]

  for (const event of allEvents) {
    const eventCheckIn = event.dtstart.split('T')[0]
    
    if (eventCheckIn === normalizedCheckOut) {
      return true
    }
  }

  return false
}
