'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Edit, 
  Trash2, 
  Loader2,
  Calendar,
  ExternalLink,
  AlertTriangle
} from 'lucide-react'
import Link from 'next/link'
import { Card, Button, Badge } from '@/components/ui'

interface Property {
  id: string
  name: string
  address: string
  bedrooms: number
  bathrooms: number
  notes: string | null
  ical_airbnb: string | null
  ical_booking: string | null
  ical_other: string | null
  default_cleaning_type_id: string | null
  property_manager_id: string
  created_at: string
}

export default function PropertyDetailPage() {
  const router = useRouter()
  const params = useParams()
  const propertyId = params.id as string
  
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchProperty() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('*')
          .eq('id', propertyId)
          .single()

        if (error) throw error
        setProperty(data)
      } catch (err) {
        console.error('Error fetching property:', err)
        setError('No se pudo cargar la propiedad')
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId, supabase])

  const handleDelete = async () => {
    if (!property) return

    try {
      setDeleting(true)
      
      // Primero verificar si hay limpiezas asociadas
      const { count } = await supabase
        .from('cleanings')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', property.id)

      if (count && count > 0) {
        setError(`No se puede eliminar: hay ${count} limpieza(s) asociada(s) a esta propiedad`)
        setShowDeleteConfirm(false)
        setDeleting(false)
        return
      }

      // Eliminar la propiedad (los iCal URLs están en la misma tabla)
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', property.id)

      if (error) throw error

      // Redirigir al dashboard
      router.push('/pm')
      router.refresh()
    } catch (err) {
      console.error('Error deleting property:', err)
      setError('Error al eliminar la propiedad')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error && !property) {
    return (
      <div className="space-y-4">
        <Link
          href="/pm"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <Card className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
        </Card>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <Link
          href="/pm"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Propiedad no encontrada</p>
        </Card>
      </div>
    )
  }

  const hasIcal = property.ical_airbnb || property.ical_booking || property.ical_other

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/pm"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Mis Propiedades
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/pm/propiedades/${property.id}/editar`}>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Property Details */}
      <Card>
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{property.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{property.address}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Bed className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{property.bedrooms}</p>
              <p className="text-sm text-muted-foreground">Habitaciones</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <Bath className="w-6 h-6 mx-auto mb-2 text-secondary" />
              <p className="text-2xl font-bold">{property.bathrooms}</p>
              <p className="text-sm text-muted-foreground">Baños</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center col-span-2">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">
                Creada el {new Date(property.created_at).toLocaleDateString('es-ES')}
              </p>
            </div>
          </div>

          {/* iCal Status */}
          <div className="border-t border-border pt-6">
            <h3 className="font-semibold mb-4">Integración iCal</h3>
            <div className="space-y-3">
              {property.ical_airbnb && (
                <div className="flex items-center gap-3 bg-red-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    A
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Airbnb</p>
                    <p className="text-xs text-muted-foreground truncate">{property.ical_airbnb}</p>
                  </div>
                  <Badge variant="success" size="sm">Conectado</Badge>
                </div>
              )}
              {property.ical_booking && (
                <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    B
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Booking.com</p>
                    <p className="text-xs text-muted-foreground truncate">{property.ical_booking}</p>
                  </div>
                  <Badge variant="success" size="sm">Conectado</Badge>
                </div>
              )}
              {property.ical_other && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    +
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">Otro</p>
                    <p className="text-xs text-muted-foreground truncate">{property.ical_other}</p>
                  </div>
                  <Badge variant="success" size="sm">Conectado</Badge>
                </div>
              )}
              {!hasIcal && (
                <div className="text-center py-6 text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay calendarios iCal configurados</p>
                  <Link 
                    href={`/pm/propiedades/${property.id}/editar`}
                    className="text-primary hover:underline text-sm"
                  >
                    Configurar ahora
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {property.notes && (
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-2">Notas</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">¿Eliminar propiedad?</h3>
              <p className="text-muted-foreground mb-6">
                Esta acción no se puede deshacer. Se eliminarán también las configuraciones iCal asociadas.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    'Sí, eliminar'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
