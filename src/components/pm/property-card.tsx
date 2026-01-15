import { MapPin, Bed, Bath, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui'

/**
 * PropertyCard - Tarjeta de propiedad para el panel PM
 * 
 * Usa la paleta corporativa rosa/lila
 */

interface PropertyCardProps {
  property: any
}

export default function PropertyCard({ property }: PropertyCardProps) {
  // Verificar si tiene alguna conexión iCal
  const hasIcal = property.ical_airbnb || property.ical_booking || property.ical_other

  return (
    <div className="bg-muted/30 rounded-lg border border-border p-4 hover:border-primary hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-foreground">{property.name}</h3>
        <Link
          href={`/pm/propiedades/${property.id}`}
          className="text-primary hover:text-primary/80"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{property.address}</span>
        </div>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          {hasIcal ? (
            <Badge variant="primary" size="sm">
              ✓ iCal Conectado
            </Badge>
          ) : (
            <Badge variant="muted" size="sm">
              Sin iCal
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}
