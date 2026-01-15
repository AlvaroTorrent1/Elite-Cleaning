import Link from 'next/link'
import { CleaningStatusBadge } from './cleaning-status-badge'
import { Clock, MapPin, AlertCircle } from 'lucide-react'

interface CleaningCardProps {
  cleaning: any
}

export function CleaningCard({ cleaning }: CleaningCardProps) {
  const property = cleaning.properties
  const cleaningType = cleaning.cleaning_types

  return (
    <Link href={`/limpiadora/${cleaning.id}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Urgent Badge */}
        {cleaning.is_urgent && (
          <div className="flex items-center gap-1 text-red-600 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase">Urgente - Mismo día</span>
          </div>
        )}

        {/* Property Name & Status */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-lg">
            {property?.name}
          </h3>
          <CleaningStatusBadge status={cleaning.status} />
        </div>

        {/* Address */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>{property?.address}</span>
        </div>

        {/* Time & Type */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-gray-700">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              {cleaning.scheduled_time?.slice(0, 5) || '09:00'}
            </span>
          </div>
          <span className="text-gray-600">
            {cleaningType?.name || 'Limpieza Estándar'}
          </span>
          {cleaningType?.estimated_duration_minutes && (
            <span className="text-gray-500">
              ~{Math.round(cleaningType.estimated_duration_minutes / 60)}h
            </span>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-blue-600 text-sm font-medium flex items-center gap-1">
            Ver detalles
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
