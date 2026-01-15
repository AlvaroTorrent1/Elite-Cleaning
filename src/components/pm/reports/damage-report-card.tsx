'use client'

import { MapPin, Calendar, User, Euro, Check } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DamageReportCardProps {
  report: any
}

export default function DamageReportCard({ report }: DamageReportCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('damage_reports')
        .update({ acknowledged_by_pm: true })
        .eq('id', report.id)

      if (error) throw error

      alert('✅ Reporte marcado como revisado')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al marcar como revisado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`bg-white rounded-lg border-2 ${report.acknowledged_by_pm ? 'border-[#E5E7EB]' : 'border-[#EF4444]'} p-6`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image */}
        <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
          {report.image_url ? (
            <Image src={report.image_url} alt="Daño reportado" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
              Sin imagen
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Status Badge */}
          {!report.acknowledged_by_pm && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-[#EF4444] text-white">
              ⚠️ Pendiente de Revisión
            </span>
          )}

          {/* Property */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#6B7280] mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-[#111827]">
                {report.cleaning?.property?.name || 'Sin propiedad'}
              </p>
              <p className="text-sm text-[#6B7280]">{report.cleaning?.property?.address}</p>
            </div>
          </div>

          {/* Damage Item */}
          <div>
            <p className="text-sm text-[#6B7280]">Item Dañado</p>
            <p className="font-semibold text-[#111827]">
              {report.damage_item?.name || report.custom_description}
            </p>
            {report.damage_item?.category && (
              <span className="text-xs text-[#6B7280]">
                Categoría: {report.damage_item.category}
              </span>
            )}
          </div>

          {/* Estimated Cost */}
          <div className="flex items-center gap-2 p-3 bg-[#FEF2F2] rounded-lg">
            <Euro className="w-5 h-5 text-[#EF4444]" />
            <div>
              <p className="text-sm text-[#6B7280]">Costo Estimado</p>
              <p className="text-lg font-bold text-[#EF4444]">
                €{parseFloat(report.estimated_cost || '0').toFixed(2)}
              </p>
            </div>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date(report.cleaning?.scheduled_date).toLocaleDateString('es-ES')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>Reportado por: {report.reporter?.full_name}</span>
            </div>
          </div>

          {/* Action */}
          {!report.acknowledged_by_pm && (
            <button
              onClick={handleAcknowledge}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              Marcar como Revisado
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
