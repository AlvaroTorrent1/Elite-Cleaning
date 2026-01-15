'use client'

import { MapPin, Calendar, User, Check } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button, Badge, Card } from '@/components/ui'

/**
 * LostItemCard - Tarjeta de objeto perdido para PM
 * 
 * Usa la paleta corporativa rosa/lila
 */

interface LostItemCardProps {
  report: any
}

export default function LostItemCard({ report }: LostItemCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleAcknowledge = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('lost_item_reports')
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
    <Card
      className={`border-2 ${report.acknowledged_by_pm ? 'border-border' : 'border-secondary'}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Image */}
        <div className="relative w-full h-48 bg-muted rounded-lg overflow-hidden">
          {report.image_url ? (
            <Image src={report.image_url} alt="Objeto perdido" fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Sin imagen
            </div>
          )}
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Status Badge */}
          {!report.acknowledged_by_pm && (
            <Badge variant="secondary">
              🔔 Sin Revisar
            </Badge>
          )}

          {/* Property */}
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-foreground">
                {report.cleaning?.property?.name || 'Sin propiedad'}
              </p>
              <p className="text-sm text-muted-foreground">{report.cleaning?.property?.address}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm text-muted-foreground mb-1">Descripción del Objeto</p>
            <p className="text-foreground">{report.description}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
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
            <Button
              onClick={handleAcknowledge}
              loading={loading}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Marcar como Revisado
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
