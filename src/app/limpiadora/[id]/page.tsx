import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Clock, Home, Calendar } from 'lucide-react'
import { CleaningStatusBadge } from '@/components/features/cleaning/cleaning-status-badge'
import CleaningTabs from '@/components/features/cleaning/cleaning-tabs'
import CleaningStatusButton from '@/components/features/cleaning/cleaning-status-button'

export default async function CleaningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Obtener perfil del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'cleaner') {
    redirect('/')
  }

  // Obtener datos de la limpieza con información de la propiedad
  const { data: cleaning, error } = await supabase
    .from('cleanings')
    .select(`
      *,
      property:properties (
        id,
        name,
        address,
        city,
        postal_code,
        bedrooms,
        bathrooms,
        access_instructions
      ),
      assigned_cleaner:profiles!cleanings_assigned_to_fkey (
        id,
        full_name,
        email
      )
    `)
    .eq('id', id)
    .single()

  if (error || !cleaning) {
    notFound()
  }

  // Verificar que la limpieza esté asignada a este limpiador
  if (cleaning.assigned_to !== profile.id) {
    redirect('/limpiadora')
  }

  // Formatear fecha y hora
  const cleaningDate = new Date(cleaning.scheduled_date)
  const formattedDate = cleaningDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = `${cleaning.start_time} - ${cleaning.end_time}`

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/limpiadora"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-semibold flex-1">Detalles de Limpieza</h1>
            <CleaningStatusBadge status={cleaning.status} />
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white border-b p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="bg-blue-100 p-2 rounded-lg">
            <Home className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-lg">{cleaning.property.name}</h2>
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
              <MapPin className="w-4 h-4" />
              <span>{cleaning.property.address}</span>
            </div>
            <p className="text-sm text-gray-600">
              {cleaning.property.city} {cleaning.property.postal_code}
            </p>
          </div>
        </div>

        {/* Schedule */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Fecha</p>
              <p className="text-sm font-medium capitalize">
                {cleaningDate.toLocaleDateString('es-ES', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Horario</p>
              <p className="text-sm font-medium">{formattedTime}</p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="flex gap-4 pt-3 border-t text-sm">
          <div>
            <span className="text-gray-500">Habitaciones:</span>{' '}
            <span className="font-medium">{cleaning.property.bedrooms}</span>
          </div>
          <div>
            <span className="text-gray-500">Baños:</span>{' '}
            <span className="font-medium">{cleaning.property.bathrooms}</span>
          </div>
        </div>

        {/* Cleaning Type */}
        <div className="pt-3 border-t">
          <p className="text-xs text-gray-500 mb-1">Tipo de Limpieza</p>
          <p className="text-sm font-medium capitalize">{cleaning.cleaning_type}</p>
        </div>

        {/* Access Instructions */}
        {cleaning.property.access_instructions && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 mb-1">Instrucciones de Acceso</p>
            <p className="text-sm bg-blue-50 p-3 rounded-lg">
              {cleaning.property.access_instructions}
            </p>
          </div>
        )}

        {/* Notes */}
        {cleaning.notes && (
          <div className="pt-3 border-t">
            <p className="text-xs text-gray-500 mb-1">Notas</p>
            <p className="text-sm bg-yellow-50 p-3 rounded-lg">{cleaning.notes}</p>
          </div>
        )}
      </div>

      {/* Main Content - Tabs */}
      <CleaningTabs cleaningId={cleaning.id} cleaningStatus={cleaning.status} />

      {/* Floating Status Button */}
      <CleaningStatusButton cleaningId={cleaning.id} currentStatus={cleaning.status} />
    </div>
  )
}
