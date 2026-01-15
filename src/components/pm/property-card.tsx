import { MapPin, Bed, Bath, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface PropertyCardProps {
  property: any
}

export default function PropertyCard({ property }: PropertyCardProps) {
  return (
    <div className="bg-[#F9FAFB] rounded-lg border border-[#E5E7EB] p-4 hover:border-[#1E40AF] hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-[#111827]">{property.name}</h3>
        <Link
          href={`/pm/propiedades/${property.id}`}
          className="text-[#1E40AF] hover:text-[#1E3A8A]"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-start gap-2 text-[#6B7280]">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">{property.address}</span>
        </div>

        <div className="flex items-center gap-4 text-[#6B7280]">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{property.bathrooms}</span>
          </div>
        </div>

        {property.ical_url ? (
          <div className="pt-2 border-t border-[#E5E7EB]">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-[#10B981]/10 text-[#10B981]">
              ✓ iCal Conectado
            </span>
          </div>
        ) : (
          <div className="pt-2 border-t border-[#E5E7EB]">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-[#6B7280]/10 text-[#6B7280]">
              Sin iCal
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
