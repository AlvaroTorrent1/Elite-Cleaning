'use client'

import { useState } from 'react'
import { Home, Calendar, User, Check, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LostItemsGridProps {
  lostItems: any[]
  total: number
}

export default function LostItemsGrid({ lostItems, total }: LostItemsGridProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleMarkAsReviewed = async (itemId: string) => {
    setLoading(itemId)
    try {
      const { error } = await supabase
        .from('lost_item_reports')
        .update({ 
          acknowledged_by_admin: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', itemId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al marcar como revisado')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white rounded-t-lg">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{lostItems.length}</span> de{' '}
          <span className="font-medium">{total}</span> objetos
        </p>
      </div>

      {/* Grid */}
      {lostItems.length === 0 ? (
        <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-12 text-center text-gray-500">
          No se encontraron objetos perdidos
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-gray-50">
          {lostItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {item.image_url && (
                <div className="relative w-full aspect-square">
                  <Image src={item.image_url} alt="Objeto perdido" fill className="object-cover" />
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Status badge */}
                <div>
                  {item.acknowledged_by_admin ? (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                      Revisado
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-900 line-clamp-2 font-medium">
                  {item.description || 'Sin descripción'}
                </p>

                {/* Property */}
                {item.cleaning?.property && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.cleaning.property.name}</span>
                  </div>
                )}

                {/* Reporter */}
                {item.reporter && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>{item.reporter.full_name}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(item.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Action button */}
                {!item.acknowledged_by_admin && (
                  <div className="pt-2 border-t">
                    <button
                      onClick={() => handleMarkAsReviewed(item.id)}
                      disabled={loading === item.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {loading === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Marcar Revisado
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
