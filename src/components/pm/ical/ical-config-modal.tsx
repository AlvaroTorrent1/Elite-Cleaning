'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui'
import { createClient } from '@/lib/supabase/client'

interface IcalConfig {
  id: string
  platform: 'airbnb' | 'booking' | 'other'
  ical_url: string
  ical_name: string | null
  last_sync_at: string | null
  last_sync_status: 'pending' | 'syncing' | 'success' | 'error'
  last_sync_error: string | null
  is_active: boolean
}

interface Property {
  id: string
  name: string
  address: string
  ical_sync_configs: IcalConfig[]
}

interface IcalConfigModalProps {
  isOpen: boolean
  onClose: () => void
  property: Property
}

const platformOptions = [
  { value: 'airbnb', label: 'Airbnb', icon: '🏠', helpUrl: 'https://www.airbnb.es/help/article/99' },
  { value: 'booking', label: 'Booking.com', icon: '🅱️', helpUrl: 'https://partner.booking.com/en-gb/help/rates-availability/how-do-i-export-my-calendar' },
  { value: 'other', label: 'Otro', icon: '📅', helpUrl: null },
] as const

export default function IcalConfigModal({ isOpen, onClose, property }: IcalConfigModalProps) {
  const [configs, setConfigs] = useState<IcalConfig[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize configs from property
  useEffect(() => {
    if (property.ical_sync_configs) {
      setConfigs([...property.ical_sync_configs])
    } else {
      setConfigs([])
    }
  }, [property])

  const supabase = createClient()

  const handleAddConfig = () => {
    // Find a platform that's not yet configured
    const usedPlatforms = configs.map(c => c.platform)
    const availablePlatform = platformOptions.find(p => !usedPlatforms.includes(p.value))?.value || 'other'

    const newConfig: IcalConfig = {
      id: `new-${Date.now()}`,
      platform: availablePlatform,
      ical_url: '',
      ical_name: null,
      last_sync_at: null,
      last_sync_status: 'pending',
      last_sync_error: null,
      is_active: true,
    }
    setConfigs([...configs, newConfig])
  }

  const handleRemoveConfig = async (configId: string) => {
    // If it's a new config (not saved yet), just remove from state
    if (configId.startsWith('new-')) {
      setConfigs(configs.filter(c => c.id !== configId))
      return
    }

    // Otherwise, delete from database
    setIsSaving(true)
    try {
      const { error: deleteError } = await supabase
        .from('ical_sync_configs')
        .delete()
        .eq('id', configId)

      if (deleteError) throw deleteError

      setConfigs(configs.filter(c => c.id !== configId))
      setSuccess('Configuración eliminada')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Error al eliminar configuración')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateConfig = (configId: string, field: keyof IcalConfig, value: string) => {
    setConfigs(configs.map(c => 
      c.id === configId ? { ...c, [field]: value } : c
    ))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      for (const config of configs) {
        // Validate URL
        if (!config.ical_url) {
          setError('Todas las configuraciones deben tener una URL')
          setIsSaving(false)
          return
        }

        // Basic URL validation
        try {
          new URL(config.ical_url)
        } catch {
          setError(`URL inválida para ${config.platform}`)
          setIsSaving(false)
          return
        }

        if (config.id.startsWith('new-')) {
          // Insert new config
          const { error: insertError } = await supabase
            .from('ical_sync_configs')
            .insert({
              property_id: property.id,
              platform: config.platform,
              ical_url: config.ical_url,
              ical_name: config.ical_name || platformOptions.find(p => p.value === config.platform)?.label,
              is_active: true,
            })

          if (insertError) {
            if (insertError.code === '23505') {
              setError(`Ya existe una configuración de ${config.platform} para esta propiedad`)
            } else {
              throw insertError
            }
            setIsSaving(false)
            return
          }
        } else {
          // Update existing config
          const { error: updateError } = await supabase
            .from('ical_sync_configs')
            .update({
              ical_url: config.ical_url,
              ical_name: config.ical_name,
              platform: config.platform,
            })
            .eq('id', config.id)

          if (updateError) throw updateError
        }
      }

      setSuccess('Configuración guardada correctamente')
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error('Error saving configs:', err)
      setError('Error al guardar la configuración')
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Configurar Calendarios iCal</h2>
            <p className="text-sm text-muted-foreground">{property.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Configs List */}
          {configs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No hay calendarios configurados para esta propiedad
              </p>
              <Button onClick={handleAddConfig} variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Calendario
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config, index) => (
                <ConfigForm
                  key={config.id}
                  config={config}
                  index={index}
                  onUpdate={handleUpdateConfig}
                  onRemove={() => handleRemoveConfig(config.id)}
                  disabled={isSaving}
                />
              ))}

              {configs.length < 3 && (
                <button
                  onClick={handleAddConfig}
                  disabled={isSaving}
                  className="w-full py-3 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Añadir otro calendario
                </button>
              )}
            </div>
          )}

          {/* Help Text */}
          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-foreground mb-2">¿Cómo obtener la URL del calendario?</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                <strong>Airbnb:</strong> Calendario → Exportar → Copiar enlace
                <a 
                  href="https://www.airbnb.es/help/article/99" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1 inline-flex items-center"
                >
                  Ver ayuda <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
              <li>
                <strong>Booking:</strong> Extranet → Tarifas → Sincronización de calendario
                <a 
                  href="https://partner.booking.com/en-gb/help/rates-availability/how-do-i-export-my-calendar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline ml-1 inline-flex items-center"
                >
                  Ver ayuda <ExternalLink className="w-3 h-3 ml-0.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving || configs.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface ConfigFormProps {
  config: IcalConfig
  index: number
  onUpdate: (id: string, field: keyof IcalConfig, value: string) => void
  onRemove: () => void
  disabled: boolean
}

function ConfigForm({ config, index, onUpdate, onRemove, disabled }: ConfigFormProps) {
  return (
    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Calendario {index + 1}</span>
        <button
          onClick={onRemove}
          disabled={disabled}
          className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Platform Select */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Plataforma
          </label>
          <select
            value={config.platform}
            onChange={(e) => onUpdate(config.id, 'platform', e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {platformOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Nombre (opcional)
          </label>
          <input
            type="text"
            value={config.ical_name || ''}
            onChange={(e) => onUpdate(config.id, 'ical_name', e.target.value)}
            disabled={disabled}
            placeholder="Ej: Airbnb Piso Centro"
            className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* URL Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          URL del Calendario iCal
        </label>
        <input
          type="url"
          value={config.ical_url}
          onChange={(e) => onUpdate(config.id, 'ical_url', e.target.value)}
          disabled={disabled}
          placeholder="https://www.airbnb.es/calendar/ical/..."
          className="w-full px-3 py-2 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {config.last_sync_status === 'error' && config.last_sync_error && (
          <p className="mt-1 text-xs text-red-500">
            Error: {config.last_sync_error}
          </p>
        )}
      </div>
    </div>
  )
}
