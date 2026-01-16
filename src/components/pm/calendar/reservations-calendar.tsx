'use client'

import { useState, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Home, User } from 'lucide-react'

import 'react-big-calendar/lib/css/react-big-calendar.css'

// Localizador para español usando date-fns
const locales = { es }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }), // Lunes como inicio de semana
  getDay,
  locales,
})

// Tipos para los eventos del calendario
interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: {
    propertyId: string
    propertyName: string
    guestName: string | null
    platform: 'airbnb' | 'booking' | 'other' | null
    isUrgent: boolean
    status: string
    cleaningId: string
  }
}

interface Cleaning {
  id: string
  property_id: string
  ical_guest_name: string | null
  ical_check_in_date: string | null
  ical_check_out_date: string | null
  ical_platform: 'airbnb' | 'booking' | 'other' | null
  is_urgent: boolean
  status: string
  scheduled_date: string
  property?: {
    id: string
    name: string
  }
}

interface Property {
  id: string
  name: string
  cleanings?: Cleaning[]
}

interface ReservationsCalendarProps {
  properties: Property[]
  cleanings: Cleaning[]
}

// Colores para cada propiedad (se asignan dinámicamente)
const PROPERTY_COLORS = [
  { bg: '#E91E63', text: '#fff' }, // Pink
  { bg: '#2196F3', text: '#fff' }, // Blue
  { bg: '#4CAF50', text: '#fff' }, // Green
  { bg: '#FF9800', text: '#fff' }, // Orange
  { bg: '#9C27B0', text: '#fff' }, // Purple
  { bg: '#00BCD4', text: '#fff' }, // Cyan
  { bg: '#795548', text: '#fff' }, // Brown
  { bg: '#607D8B', text: '#fff' }, // Blue Grey
  { bg: '#F44336', text: '#fff' }, // Red
  { bg: '#3F51B5', text: '#fff' }, // Indigo
]

// Mensajes en español
const messages = {
  allDay: 'Todo el día',
  previous: 'Anterior',
  next: 'Siguiente',
  today: 'Hoy',
  month: 'Mes',
  week: 'Semana',
  day: 'Día',
  agenda: 'Agenda',
  date: 'Fecha',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'No hay reservas en este rango.',
  showMore: (total: number) => `+ Ver ${total} más`,
}

export default function ReservationsCalendar({ properties, cleanings }: ReservationsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>(Views.MONTH)
  const [selectedProperty, setSelectedProperty] = useState<string | 'all'>('all')
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  // Mapa de colores por propiedad
  const propertyColorMap = useMemo(() => {
    const map = new Map<string, { bg: string; text: string }>()
    properties.forEach((prop, index) => {
      map.set(prop.id, PROPERTY_COLORS[index % PROPERTY_COLORS.length])
    })
    return map
  }, [properties])

  // Convertir cleanings a eventos del calendario
  const events: CalendarEvent[] = useMemo(() => {
    return cleanings
      .filter((cleaning) => {
        // Filtrar por propiedad seleccionada
        if (selectedProperty !== 'all' && cleaning.property_id !== selectedProperty) {
          return false
        }
        // Solo mostrar reservas con fechas de iCal (check-in y check-out)
        return cleaning.ical_check_in_date && cleaning.ical_check_out_date
      })
      .map((cleaning) => {
        const propertyName = cleaning.property?.name || 'Propiedad'
        const guestName = cleaning.ical_guest_name || 'Huésped'
        
        return {
          id: cleaning.id,
          title: `${propertyName} - ${guestName}`,
          start: new Date(cleaning.ical_check_in_date!),
          end: new Date(cleaning.ical_check_out_date!),
          resource: {
            propertyId: cleaning.property_id,
            propertyName,
            guestName: cleaning.ical_guest_name,
            platform: cleaning.ical_platform,
            isUrgent: cleaning.is_urgent,
            status: cleaning.status,
            cleaningId: cleaning.id,
          },
        }
      })
  }, [cleanings, selectedProperty])

  // Navegación del calendario
  const handleNavigate = useCallback((action: 'PREV' | 'NEXT' | 'TODAY') => {
    setCurrentDate((prev) => {
      switch (action) {
        case 'PREV':
          return view === Views.MONTH ? subMonths(prev, 1) : prev
        case 'NEXT':
          return view === Views.MONTH ? addMonths(prev, 1) : prev
        case 'TODAY':
          return new Date()
        default:
          return prev
      }
    })
  }, [view])

  // Estilo personalizado para los eventos
  const eventStyleGetter = useCallback(
    (event: CalendarEvent) => {
      const colors = propertyColorMap.get(event.resource.propertyId) || PROPERTY_COLORS[0]
      
      return {
        style: {
          backgroundColor: colors.bg,
          color: colors.text,
          borderRadius: '4px',
          border: 'none',
          opacity: event.resource.status === 'cancelled' ? 0.5 : 1,
          fontSize: '12px',
          padding: '2px 4px',
        },
      }
    },
    [propertyColorMap]
  )

  // Componente personalizado para el evento
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const platformIcon = event.resource.platform === 'airbnb' 
      ? '🏠' 
      : event.resource.platform === 'booking' 
        ? '📘' 
        : '📅'
    
    return (
      <div className="truncate">
        <span className="mr-1">{platformIcon}</span>
        <span className="font-medium">{event.resource.propertyName}</span>
        {event.resource.guestName && (
          <span className="hidden md:inline text-xs opacity-90"> • {event.resource.guestName}</span>
        )}
      </div>
    )
  }, [])

  // Cuando se selecciona un evento
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event)
  }, [])

  return (
    <div className="space-y-4">
      {/* Header con controles */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navegación */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate('PREV')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNavigate('TODAY')}
            className="px-4 py-2 text-sm font-medium text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
          >
            Hoy
          </button>
          <button
            onClick={() => handleNavigate('NEXT')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-foreground ml-2 capitalize">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </h2>
        </div>

        {/* Filtro por propiedad */}
        <div className="flex items-center gap-2">
          <Home className="w-4 h-4 text-muted-foreground" />
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="all">Todas las propiedades</option>
            {properties.map((prop) => (
              <option key={prop.id} value={prop.id}>
                {prop.name}
              </option>
            ))}
          </select>
        </div>

        {/* Vistas */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: Views.MONTH, label: 'Mes' },
            { key: Views.WEEK, label: 'Semana' },
            { key: Views.AGENDA, label: 'Lista' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === key
                  ? 'bg-white text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Leyenda de propiedades */}
      <div className="flex flex-wrap gap-2">
        {properties.map((prop) => {
          const colors = propertyColorMap.get(prop.id)
          return (
            <button
              key={prop.id}
              onClick={() => setSelectedProperty(selectedProperty === prop.id ? 'all' : prop.id)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                selectedProperty === prop.id || selectedProperty === 'all'
                  ? 'opacity-100'
                  : 'opacity-50'
              }`}
              style={{ backgroundColor: `${colors?.bg}20`, color: colors?.bg }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors?.bg }}
              />
              {prop.name}
            </button>
          )
        })}
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          onNavigate={(date) => setCurrentDate(date)}
          view={view}
          onView={setView}
          messages={messages}
          culture="es"
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
          }}
          onSelectEvent={handleSelectEvent}
          popup
          selectable={false}
          style={{ height: 600 }}
          formats={{
            monthHeaderFormat: (date) => format(date, 'MMMM yyyy', { locale: es }),
            weekdayFormat: (date) => format(date, 'EEE', { locale: es }),
            dayFormat: (date) => format(date, 'd', { locale: es }),
            dayHeaderFormat: (date) => format(date, 'EEEE d MMMM', { locale: es }),
            dayRangeHeaderFormat: ({ start, end }) =>
              `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`,
            agendaDateFormat: (date) => format(date, 'd MMM yyyy', { locale: es }),
            agendaHeaderFormat: ({ start, end }) =>
              `${format(start, 'd MMM', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`,
          }}
          toolbar={false} // Usamos nuestro propio toolbar
        />
      </div>

      {/* Modal/Panel de detalle del evento seleccionado */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div 
              className="p-4"
              style={{ 
                backgroundColor: propertyColorMap.get(selectedEvent.resource.propertyId)?.bg,
                color: propertyColorMap.get(selectedEvent.resource.propertyId)?.text,
              }}
            >
              <h3 className="text-lg font-bold">{selectedEvent.resource.propertyName}</h3>
              <p className="text-sm opacity-90">
                {selectedEvent.resource.platform === 'airbnb' && '🏠 Airbnb'}
                {selectedEvent.resource.platform === 'booking' && '📘 Booking'}
                {selectedEvent.resource.platform === 'other' && '📅 Otro'}
                {!selectedEvent.resource.platform && '📅 Reserva'}
              </p>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Huésped</p>
                  <p className="font-medium">{selectedEvent.resource.guestName || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Fechas</p>
                  <p className="font-medium">
                    {format(selectedEvent.start, 'd MMM', { locale: es })} → {format(selectedEvent.end, 'd MMM yyyy', { locale: es })}
                  </p>
                </div>
              </div>
              {selectedEvent.resource.isUrgent && (
                <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg text-sm font-medium">
                  ⚠️ Limpieza urgente (check-in el mismo día)
                </div>
              )}
            </div>
            <div className="border-t border-border p-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cerrar
              </button>
              <a
                href={`/pm/limpiezas?property=${selectedEvent.resource.propertyId}`}
                className="px-4 py-2 text-sm font-medium bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors"
              >
                Ver limpiezas
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
