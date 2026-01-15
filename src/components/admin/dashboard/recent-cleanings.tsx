import Link from 'next/link'
import { Calendar, MapPin, User, ArrowRight } from 'lucide-react'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'

interface RecentCleaningsProps {
  cleanings: any[]
}

export default function RecentCleanings({ cleanings }: RecentCleaningsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Limpiezas Recientes</h2>
        <Link
          href="/admin/limpiezas"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {cleanings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay limpiezas recientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cleanings.map((cleaning) => (
            <div
              key={cleaning.id}
              className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-medium text-gray-900">
                  {cleaning.property?.name || 'Sin propiedad'}
                </p>
                <CleaningStatusBadge status={cleaning.status} />
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="truncate">{cleaning.property?.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{cleaning.cleaner?.full_name || 'Sin asignar'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(cleaning.scheduled_date).toLocaleDateString('es-ES')} -{' '}
                    {cleaning.scheduled_time?.slice(0, 5)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
