import { createClient } from '@/lib/supabase/server'
import { CleaningCard } from '@/components/features/cleaning/cleaning-card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'
import { CheckCircle, Clock } from 'lucide-react'
import { StatCard, StatCardGrid, Card, EmptyState } from '@/components/ui'

export default async function LimpiadoraDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return null
  }

  // Obtener limpiezas del día de hoy
  const today = new Date().toISOString().split('T')[0]
  
  const { data: cleanings } = await supabase
    .from('cleanings')
    .select(`
      *,
      properties (
        id,
        name,
        address,
        access_instructions,
        gps_lat,
        gps_lng
      ),
      cleaning_types (
        name,
        estimated_duration_minutes
      )
    `)
    .eq('cleaner_id', user.id)
    .eq('scheduled_date', today)
    .order('scheduled_time', { ascending: true })

  const formattedDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: es })
  
  const completedCount = cleanings?.filter((c: any) => c.status === 'completed').length || 0
  const pendingCount = cleanings?.filter((c: any) => c.status !== 'completed' && c.status !== 'cancelled').length || 0

  return (
    <div className="p-4 space-y-6">
      {/* Date Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground capitalize">
          {formattedDate}
        </h2>
        <p className="text-sm text-muted-foreground">
          {cleanings?.length || 0} limpieza{cleanings?.length !== 1 ? 's' : ''} programada{cleanings?.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Cleanings List */}
      {cleanings && cleanings.length > 0 ? (
        <div className="space-y-3">
          {cleanings.map((cleaning: any) => (
            <CleaningCard key={cleaning.id} cleaning={cleaning} />
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <EmptyState
            icon={CheckCircle}
            title="Sin limpiezas para hoy"
            description="No tienes limpiezas programadas para el día de hoy."
          />
        </Card>
      )}

      {/* Quick Stats */}
      <StatCardGrid columns={2}>
        <StatCard
          title="Completadas hoy"
          value={completedCount}
          icon={CheckCircle}
          variant="accent3"
        />
        <StatCard
          title="Pendientes"
          value={pendingCount}
          icon={Clock}
          variant="secondary"
        />
      </StatCardGrid>
    </div>
  )
}
