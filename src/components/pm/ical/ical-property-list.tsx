'use client'

import { useState } from 'react'
import IcalPropertyCard from './ical-property-card'
import IcalConfigModal from './ical-config-modal'

interface IcalConfig {
  id: string
  platform: 'airbnb' | 'booking' | 'other'
  ical_url: string
  ical_name: string | null
  last_sync_at: string | null
  last_sync_status: 'pending' | 'syncing' | 'success' | 'error'
  last_sync_error: string | null
  last_sync_events_found: number
  last_sync_cleanings_created: number
  is_active: boolean
}

interface Property {
  id: string
  name: string
  address: string
  ical_sync_configs: IcalConfig[]
}

interface IcalPropertyListProps {
  properties: Property[]
}

export default function IcalPropertyList({ properties }: IcalPropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleConfigureClick = (property: Property) => {
    setSelectedProperty(property)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedProperty(null)
  }

  return (
    <>
      <div className="space-y-3">
        {properties.map((property) => (
          <IcalPropertyCard
            key={property.id}
            property={property}
            onConfigureClick={() => handleConfigureClick(property)}
          />
        ))}
      </div>

      {selectedProperty && (
        <IcalConfigModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          property={selectedProperty}
        />
      )}
    </>
  )
}
