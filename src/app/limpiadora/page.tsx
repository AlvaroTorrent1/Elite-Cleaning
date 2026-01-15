import { createClient } from '@/lib/supabase/server'
import { CleaningCard } from '@/components/features/cleaning/cleaning-card'
import { format } from 'date-fns'
import { es } from 'date-fns/locale/es'

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

  return (
    <div className="p-4 space-y-6">
      {/* Date Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">
          {formattedDate}
        </h2>
        <p className="text-sm text-gray-600">
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
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Sin limpiezas para hoy
          </h3>
          <p className="text-sm text-gray-600">
            No tienes limpiezas programadas para el día de hoy.
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Completadas hoy</p>
          <p className="text-2xl font-bold text-green-600">
            {cleanings?.filter((c: any) => c.status === 'completed').length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Pendientes</p>
          <p className="text-2xl font-bold text-blue-600">
            {cleanings?.filter((c: any) => c.status !== 'completed' && c.status !== 'cancelled').length || 0}
          </p>
        </div>
      </div>
    </div>
  )
}
