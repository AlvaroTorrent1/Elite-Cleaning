'use client'

import { useState } from 'react'
import { ClipboardCheck, Package, AlertTriangle } from 'lucide-react'
import ChecklistTab from './checklist-tab'
import LostItemsTab from './lost-items-tab'
import DamagesTab from './damages-tab'

type Tab = 'checklist' | 'lost-items' | 'damages'

interface CleaningTabsProps {
  cleaningId: string
  cleaningStatus: string
}

export default function CleaningTabs({ cleaningId, cleaningStatus }: CleaningTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('checklist')

  const tabs = [
    {
      id: 'checklist' as Tab,
      label: 'Checklist',
      icon: ClipboardCheck,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'lost-items' as Tab,
      label: 'Objetos Perdidos',
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      id: 'damages' as Tab,
      label: 'Daños',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ]

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white border-b sticky top-[60px] z-10">
        <div className="flex">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 font-medium text-sm transition-colors relative ${
                  isActive
                    ? `${tab.color} bg-gray-50`
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-current" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'checklist' && (
          <ChecklistTab cleaningId={cleaningId} cleaningStatus={cleaningStatus} />
        )}
        {activeTab === 'lost-items' && (
          <LostItemsTab cleaningId={cleaningId} cleaningStatus={cleaningStatus} />
        )}
        {activeTab === 'damages' && (
          <DamagesTab cleaningId={cleaningId} cleaningStatus={cleaningStatus} />
        )}
      </div>
    </div>
  )
}
