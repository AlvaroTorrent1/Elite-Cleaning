export const APP_NAME = 'Elite Cleaning'
export const APP_DESCRIPTION = 'Gestión de limpiezas para propiedades de alquiler turístico'

export const CLEANING_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const USER_ROLES = {
  ADMIN: 'admin',
  CLEANER: 'cleaner',
  PROPERTY_MANAGER: 'property_manager',
} as const

export const IMAGE_CATEGORIES = {
  CHECKLIST: 'checklist',
  DAMAGE: 'damage',
  LOST_ITEM: 'lost_item',
  SIGNATURE: 'signature',
} as const
