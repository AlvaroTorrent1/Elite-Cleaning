'use client'

import { MapPin, User, Calendar, Clock, AlertTriangle, X as XIcon } from 'lucide-react'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button, EmptyState } from '@/components/ui'

/**
 * PMCleaningsList - Lista de limpiezas para PM
 * 
 * Usa la paleta corporativa rosa/lila
 */

interface PMCleaningsListProps {
  cleanings: any[]
  total: number
}

export default function PMCleaningsList({ cleanings, total }: PMCleaningsListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState<string | null>(null)

  const canCancel = (cleaning: any) => {
    // Solo se pueden cancelar limpiezas generadas por iCal que estén pendientes o asignadas
    return (
      !cleaning.is_manual &&
      cleaning.ical_event_uid &&
      ['pending', 'assigned'].includes(cleaning.status)
    )
  }

  const handleCancel = async (cleaningId: string) => {
    if (!confirm('¿Cancelar esta limpieza generada por iCal?\n\nNo se cobrará por esta cancelación.')) {
      return
    }

    setLoading(cleaningId)
    try {
      const { error } = await supabase
        .from('cleanings')
        .update({ status: 'cancelled' })
        .eq('id', cleaningId)

      if (error) throw error

      alert('✅ Limpieza cancelada correctamente')
      router.refresh()
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Error al cancelar limpieza')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-3 border-b border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{cleanings.length}</span> de{' '}
          <span className="font-medium text-foreground">{total}</span> limpiezas
        </p>
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {cleanings.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <EmptyState
              icon={Calendar}
              title="No se encontraron limpiezas"
              description="Ajusta los filtros o crea una nueva limpieza"
            />
          </div>
        ) : (
          cleanings.map((cleaning) => (
            <div key={cleaning.id} className="px-6 py-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  {/* Property */}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {cleaning.property?.name || 'Sin propiedad'}
                      </p>
                      <p className="text-sm text-muted-foreground">{cleaning.property?.address}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(cleaning.scheduled_date).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{cleaning.scheduled_time?.slice(0, 5) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{cleaning.cleaner?.full_name || 'Sin asignar'}</span>
                    </div>
                    {cleaning.is_urgent && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                        <AlertTriangle className="w-3 h-3" />
                        Urgente
                      </span>
                    )}
                  </div>

                  {/* Type */}
                  <div>
                    <span className="text-sm font-medium text-foreground">
                      {cleaning.cleaning_type?.name || 'N/A'}
                    </span>
                    {!cleaning.is_manual && (
                      <span className="ml-2 text-xs text-muted-foreground">(iCal)</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <CleaningStatusBadge status={cleaning.status} />
                  {canCancel(cleaning) && (
                    <Button
                      onClick={() => handleCancel(cleaning.id)}
                      loading={loading === cleaning.id}
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10"
                      title="Cancelar limpieza"
                    >
                      <XIcon className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
