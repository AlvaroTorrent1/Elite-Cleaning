'use client'

import { useState } from 'react'
import { Check, Home, Calendar, User, Loader2, Tag } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface DamagesGridProps {
  damages: any[]
  total: number
}

export default function DamagesGrid({ damages, total }: DamagesGridProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const handleMarkAsReviewed = async (damageId: string) => {
    setLoading(damageId)
    try {
      const { error } = await supabase
        .from('damage_reports')
        .update({ 
          acknowledged_by_admin: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', damageId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al marcar como revisado')
    } finally {
      setLoading(null)
    }
  }

  const getStatusBadge = (acknowledged: boolean) => {
    if (acknowledged) {
      return (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
          Revisado
        </span>
      )
    }
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
        Pendiente
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-3 border-b border-gray-200 bg-white rounded-t-lg">
        <p className="text-sm text-gray-600">
          Mostrando <span className="font-medium">{damages.length}</span> de{' '}
          <span className="font-medium">{total}</span> reportes
        </p>
      </div>

      {/* Grid */}
      {damages.length === 0 ? (
        <div className="bg-white rounded-b-lg border border-t-0 border-gray-200 p-12 text-center text-gray-500">
          No se encontraron reportes de daños
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50">
          {damages.map((damage) => (
            <div
              key={damage.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              {damage.image_url && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={damage.image_url}
                    alt="Daño"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="p-4 space-y-3">
                {/* Status & Price */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(damage.acknowledged_by_admin)}
                  <span className="text-lg font-bold text-red-600">
                    €{Number(damage.estimated_cost || damage.damage_item?.estimated_price || 0).toFixed(2)}
                  </span>
                </div>

                {/* Item from catalog */}
                {damage.damage_item && (
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>{damage.damage_item.name}</span>
                    <span className="text-xs text-gray-500">({damage.damage_item.category})</span>
                  </div>
                )}

                {/* Custom Description */}
                {damage.custom_description && (
                  <p className="text-sm text-gray-600 line-clamp-2">{damage.custom_description}</p>
                )}

                {/* Property */}
                {damage.cleaning?.property && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Home className="w-4 h-4" />
                    <span className="truncate">{damage.cleaning.property.name}</span>
                  </div>
                )}

                {/* Reporter */}
                {damage.reporter && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{damage.reporter.full_name}</span>
                  </div>
                )}

                {/* Date */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {new Date(damage.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Actions */}
                {!damage.acknowledged_by_admin && (
                  <div className="pt-2 border-t">
                    <button
                      onClick={() => handleMarkAsReviewed(damage.id)}
                      disabled={loading === damage.id}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {loading === damage.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          Marcar como Revisado
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
