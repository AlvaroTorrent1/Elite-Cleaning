import Link from 'next/link'
import { AlertTriangle, ArrowRight, Home } from 'lucide-react'
import Image from 'next/image'

interface RecentReportsProps {
  damages: any[]
}

export default function RecentReports({ damages }: RecentReportsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Daños Pendientes</h2>
        <Link
          href="/admin/danos"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          Ver todos
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {damages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay daños pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {damages.map((damage) => (
            <div
              key={damage.id}
              className="block p-3 rounded-lg border border-gray-200 hover:border-red-300 hover:shadow-sm transition-all"
            >
              <div className="flex gap-3">
                {/* Image */}
                {damage.image_url && (
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={damage.image_url}
                      alt="Daño"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">
                      {damage.damage_item?.name || damage.custom_description || 'Sin descripción'}
                    </p>
                    <span className="text-red-600 font-semibold text-sm ml-2">
                      €{Number(damage.estimated_cost || damage.damage_item?.estimated_price || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Home className="w-3 h-3" />
                    <span className="truncate">
                      {damage.cleaning?.property?.name || 'Sin propiedad'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(damage.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
