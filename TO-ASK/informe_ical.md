# 📅 Informe Técnico Completo: Sincronización iCal con Booking.com y Airbnb

> **Fecha de generación:** Enero 2026  
> **Propósito:** Documentación exhaustiva para replicar el sistema de sincronización iCal en otros proyectos  
> **Versión del sistema documentado:** v3.2

---

## 📋 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Fundamentos Teóricos: RFC 5545 (iCalendar)](#2-fundamentos-teóricos-rfc-5545-icalendar)
3. [El Problema Principal: Fragmentación de Airbnb](#3-el-problema-principal-fragmentación-de-airbnb)
4. [Arquitectura de la Solución](#4-arquitectura-de-la-solución)
5. [Estructuras de Datos y Tablas](#5-estructuras-de-datos-y-tablas)
6. [Código Completo del Sincronizador](#6-código-completo-del-sincronizador)
7. [Algoritmo Merge Intervals](#7-algoritmo-merge-intervals)
8. [Detección Inteligente del Origen](#8-detección-inteligente-del-origen)
9. [Reconciliación Post-Sincronización](#9-reconciliación-post-sincronización)
10. [Scripts de Mantenimiento SQL](#10-scripts-de-mantenimiento-sql)
11. [Errores Comunes y Soluciones](#11-errores-comunes-y-soluciones)
12. [Checklist de Implementación](#12-checklist-de-implementación)
13. [Adaptación a Otros Proyectos](#13-adaptación-a-otros-proyectos)

---

## 1. RESUMEN EJECUTIVO

### 1.1 ¿Qué hace este sistema?

El sistema de sincronización iCal permite:

1. **Importar calendarios externos** (Airbnb, Booking.com, VRBO) para bloquear fechas ocupadas
2. **Exportar nuestro calendario** como archivo `.ics` para que otras plataformas lo lean
3. **Unificar reservas fragmentadas** que Airbnb envía como múltiples eventos

### 1.2 El Desafío Principal

**Booking.com** exporta calendarios de forma simple: una reserva = un evento iCal. Sin problemas.

**Airbnb** exporta calendarios de forma **problemática**:
- Una reserva de 5 noches puede llegar como **5 eventos separados** (uno por noche)
- Los eventos tienen **UIDs diferentes** pero comparten un **prefijo común**
- A veces envía **eventos solapados** (el evento completo + fragmentos)
- Los fragmentos pueden llegar en **diferentes sincronizaciones** (asíncronos)

### 1.3 La Solución Implementada

1. **Algoritmo Merge Intervals** (LeetCode #56 adaptado) para fusionar eventos solapados/consecutivos
2. **Extracción de prefijo UID** para identificar fragmentos de la misma reserva
3. **Reconciliación post-sync** para limpiar duplicados que llegaron en syncs diferentes
4. **Detección automática del origen** basada en el dominio del UID

---

## 2. FUNDAMENTOS TEÓRICOS: RFC 5545 (iCalendar)

### 2.1 ¿Qué es iCal?

iCalendar (RFC 5545) es un estándar para intercambiar información de calendario. Es un formato de texto plano con estructura jerárquica.

### 2.2 Estructura de un Archivo .ics

```ical
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Provider Name//EN
METHOD:PUBLISH

BEGIN:VEVENT
UID:7f662ec65913-83c79fdf587a@airbnb.com
DTSTART;VALUE=DATE:20261204
DTEND;VALUE=DATE:20261209
SUMMARY:John Doe - Airbnb
DESCRIPTION:Reservation code: HMABCDEF12\nPhone: +34 600 000 000
DTSTAMP:20251208T150000Z
END:VEVENT

BEGIN:VEVENT
UID:79fd71e0f90af48e@booking.com
DTSTART;VALUE=DATE:20261210
DTEND;VALUE=DATE:20261215
SUMMARY:Reserved
DTSTAMP:20251208T150000Z
END:VEVENT

END:VCALENDAR
```

### 2.3 Componentes Clave

| Componente | Descripción | Uso en nuestro sistema |
|------------|-------------|------------------------|
| `UID` | Identificador único del evento | Base para agrupar fragmentos |
| `DTSTART` | Fecha/hora de inicio | `check_in_date` |
| `DTEND` | Fecha/hora de fin | `check_out_date` |
| `SUMMARY` | Título del evento | `guest_name` (si no es genérico) |
| `DESCRIPTION` | Descripción detallada | Posible código de reserva |
| `DTSTAMP` | Timestamp de creación | Auditoría |

### 2.4 Formatos de Fecha

iCal soporta varios formatos de fecha:

```
# Solo fecha (VALUE=DATE)
DTSTART;VALUE=DATE:20261204

# Fecha y hora UTC
DTSTART:20261204T140000Z

# Fecha y hora con timezone
DTSTART;TZID=Europe/Madrid:20261204T140000
```

**Importante:** Nuestro parser normaliza todos a formato `YYYY-MM-DD` para comparaciones.

### 2.5 Line Folding (Desdoblado de líneas)

El estándar iCal permite "doblar" líneas largas. Una línea que continúa en la siguiente empieza con un espacio o tab:

```
DESCRIPTION:Esta es una descripción muy larga que ha sido dob
 lada en múltiples líneas para cumplir con el límite de 75 ca
 racteres por línea.
```

**Nuestro parser lo maneja:**
```typescript
const unfoldedData = icalData.replace(/\r?\n[ \t]/g, '');
```

### 2.6 Limitaciones Inherentes de iCal

1. **Solo disponibilidad:** No incluye precios, pagos, mensajes del huésped
2. **Unidireccional:** Solo lectura (pull) o escritura (push), no bidireccional
3. **Sincronización asíncrona:** Delays de 15 min a 4+ horas según la plataforma
4. **Seguridad baja:** Las URLs son públicas (cualquiera puede leerlas)
5. **Sin transacciones:** No hay garantía de consistencia

---

## 3. EL PROBLEMA PRINCIPAL: FRAGMENTACIÓN DE AIRBNB

### 3.1 Comportamiento de Booking.com vs Airbnb

| Aspecto | Booking.com | Airbnb |
|---------|-------------|--------|
| **Formato UID** | `hash@booking.com` | `prefijo-hash@airbnb.com` |
| **Fragmentación** | ❌ NO fragmenta | ⚠️ **SÍ FRAGMENTA** |
| **Un evento por reserva** | ✅ Siempre | ❌ A veces NO |
| **Patrón UID** | UID único por reserva | Mismo prefijo para fragmentos |
| **Delay de sync** | ~15 minutos | 2-4 horas |
| **Ejemplo UID** | `79fd71e0f90af48e@booking.com` | `7f662ec65913-abc123@airbnb.com` |

### 3.2 Tipos de Fragmentación de Airbnb

#### Tipo 1: Fragmentación por día
Una reserva de 5 noches llega como 5 eventos separados:

```
UID: 7f662ec65913-AAA@airbnb.com  DTSTART: 2026-12-04  DTEND: 2026-12-05
UID: 7f662ec65913-BBB@airbnb.com  DTSTART: 2026-12-05  DTEND: 2026-12-06
UID: 7f662ec65913-CCC@airbnb.com  DTSTART: 2026-12-06  DTEND: 2026-12-07
UID: 7f662ec65913-DDD@airbnb.com  DTSTART: 2026-12-07  DTEND: 2026-12-08
UID: 7f662ec65913-EEE@airbnb.com  DTSTART: 2026-12-08  DTEND: 2026-12-09
```

**Observación clave:** Todos comparten el prefijo `7f662ec65913`.

#### Tipo 2: Fragmentación con solapamiento
Evento completo + fragmentos individuales redundantes:

```
UID: 7f662ec65913-FFF@airbnb.com  DTSTART: 2026-12-04  DTEND: 2026-12-09  (completo)
UID: 7f662ec65913-GGG@airbnb.com  DTSTART: 2026-12-04  DTEND: 2026-12-05  (fragmento)
UID: 7f662ec65913-HHH@airbnb.com  DTSTART: 2026-12-08  DTEND: 2026-12-09  (fragmento)
```

#### Tipo 3: Llegada asíncrona
Fragmentos llegan en diferentes sincronizaciones:

```
Sync #1 (lunes): UID: 7f662ec65913-III  DTSTART: 2026-12-04  DTEND: 2026-12-07
Sync #2 (martes): UID: 7f662ec65913-JJJ  DTSTART: 2026-12-07  DTEND: 2026-12-09  (extensión)
```

### 3.3 Por Qué Airbnb Hace Esto

Airbnb no documenta oficialmente este comportamiento. Teorías:

1. **Bloqueos de disponibilidad:** Cada noche es un "bloqueo" independiente
2. **Cambios en la reserva:** Extensiones generan nuevos eventos
3. **Sistema legacy:** Comportamiento heredado de sistemas antiguos
4. **Optimización interna:** Más fácil de manejar internamente

### 3.4 El Patrón del Prefijo UID

La clave para resolver el problema es el **patrón del UID de Airbnb**:

```
7f662ec65913-83c79fdf587a2227a38a1156b9493155@airbnb.com
└─────┬─────┘└────────────────┬────────────────┘└────┬────┘
  PREFIJO          HASH ÚNICO                    DOMINIO
(12 caracteres)   (variable)                   (constante)
```

**Regla:** Todos los fragmentos de la misma reserva comparten el mismo **prefijo** (los caracteres antes del primer guión).

---

## 4. ARQUITECTURA DE LA SOLUCIÓN

### 4.1 Diagrama de Flujo

```
┌──────────────────────────────────────────────────────────────────────┐
│                     FLUJO DE SINCRONIZACIÓN iCal                      │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────┐                                 │
│  │  URLs de Calendarios Externos   │                                 │
│  │  - Airbnb: ics.airbnb.com/...   │                                 │
│  │  - Booking: admin.booking.com/..│                                 │
│  └─────────────┬───────────────────┘                                 │
│                │                                                     │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │  1. fetchIcalData()             │  Descarga archivo .ics          │
│  │     - HTTP GET con User-Agent   │                                 │
│  │     - Maneja errores de red     │                                 │
│  └─────────────┬───────────────────┘                                 │
│                │                                                     │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │  2. parseIcalData()             │  Parsea texto iCal              │
│  │     - Unfold de líneas          │                                 │
│  │     - Extrae VEVENT             │                                 │
│  │     - Normaliza fechas          │                                 │
│  └─────────────┬───────────────────┘                                 │
│                │                                                     │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │  3. mergeOverlappingEvents()    │  Algoritmo MERGE INTERVALS      │
│  │     - Ordena por fecha inicio   │                                 │
│  │     - Detecta solapamientos     │                                 │
│  │     - Fusiona por prefijo UID   │                                 │
│  └─────────────┬───────────────────┘                                 │
│                │                                                     │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │  4. syncEventsToDatabase()      │  Sincroniza con BD              │
│  │     - Agrupa por prefijo UID    │                                 │
│  │     - Actualiza existentes      │                                 │
│  │     - Crea nuevos               │                                 │
│  │     - Elimina duplicados        │                                 │
│  └─────────────┬───────────────────┘                                 │
│                │                                                     │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │  5. reconcileConsecutive()      │  Limpieza post-sync             │
│  │     - Detecta fragmentos legacy │                                 │
│  │     - Fusiona en BD             │                                 │
│  │     - Corrige booking_source    │                                 │
│  └─────────────────────────────────┘                                 │
│                                                                      │
│                ▼                                                     │
│  ┌─────────────────────────────────┐                                 │
│  │         TABLA: bookings         │  (o synced_bookings)            │
│  │  Reservas unificadas y limpias  │                                 │
│  └─────────────────────────────────┘                                 │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 Componentes del Sistema

| Componente | Archivo | Responsabilidad |
|------------|---------|-----------------|
| Edge Function | `ical-sync/index.ts` | Punto de entrada, orquestación |
| Parser | `parseIcalData()` | Convierte texto iCal a objetos |
| Merger | `mergeOverlappingEvents()` | Fusiona eventos fragmentados |
| Syncer | `syncEventsToDatabase()` | Persiste en base de datos |
| Reconciler | `reconcileConsecutiveBookings()` | Limpieza post-sync |
| Detector | `detectBookingSource()` | Identifica origen (Airbnb/Booking) |

### 4.3 Ejecución

El sistema puede ejecutarse de dos formas:

1. **Automática (Cron):** Un job programado invoca la Edge Function cada X minutos
2. **Manual:** El usuario hace clic en "Sincronizar ahora" en el dashboard

---

## 5. ESTRUCTURAS DE DATOS Y TABLAS

### 5.1 Tabla: ical_configs

Almacena las configuraciones de calendarios externos a sincronizar.

```sql
CREATE TABLE ical_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    property_id UUID NOT NULL REFERENCES properties(id),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    
    -- Configuración
    ical_url TEXT NOT NULL,           -- URL del calendario externo
    ical_name TEXT NOT NULL,          -- Nombre descriptivo (ej: "Airbnb Piso 1")
    platform TEXT,                    -- 'airbnb', 'booking', 'vrbo', etc.
    
    -- Sincronización
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMPTZ,
    sync_status TEXT DEFAULT 'pending',  -- pending, active, error, disabled
    error_message TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices recomendados
CREATE INDEX idx_ical_configs_property ON ical_configs(property_id);
CREATE INDEX idx_ical_configs_active ON ical_configs(is_active, sync_status);
```

### 5.2 Tabla: bookings (o synced_bookings)

Almacena las reservas sincronizadas. **Nota:** En nuestro sistema original teníamos `synced_bookings`, que luego fue migrada a una tabla unificada `bookings`. Adapta según tu arquitectura.

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relaciones
    user_id UUID REFERENCES auth.users(id),
    property_id UUID NOT NULL REFERENCES properties(id),
    ical_config_id UUID REFERENCES ical_configs(id),  -- Null si es manual
    
    -- Origen
    source TEXT NOT NULL DEFAULT 'manual',  -- manual, airbnb, booking, vrbo, etc.
    
    -- Identificadores externos
    booking_uid TEXT UNIQUE,    -- UID del evento iCal (clave para deduplicación)
    booking_number TEXT,        -- Número de confirmación
    
    -- Datos del huésped
    guest_name TEXT NOT NULL,
    guest_surname TEXT,
    guest_phone TEXT,
    guest_email TEXT,
    
    -- Fechas
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    
    -- Estado
    status TEXT NOT NULL DEFAULT 'active',
    -- Valores posibles: active, cancelled, completed, no_show, blocked
    
    -- Metadata
    raw_ical_event JSONB,       -- Evento iCal original (para debugging)
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices críticos
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_ical_config ON bookings(ical_config_id);
CREATE INDEX idx_bookings_uid ON bookings(booking_uid);
CREATE INDEX idx_bookings_dates ON bookings(check_in_date, check_out_date);
CREATE INDEX idx_bookings_source ON bookings(source);
```

### 5.3 Interfaz TypeScript: IcalConfig

```typescript
interface IcalConfig {
  id: string;
  property_id: string;
  user_id: string;
  ical_url: string;
  ical_name: string;
  platform?: 'booking' | 'airbnb' | 'vrbo';
  sync_interval_minutes: number;
  last_sync_at: string | null;
  sync_status: 'pending' | 'active' | 'error' | 'disabled';
  error_message: string | null;
  is_active: boolean;
}
```

### 5.4 Interfaz TypeScript: IcalEvent

```typescript
interface IcalEvent {
  uid: string;              // UID único del evento iCal
  summary: string;          // Título (puede tener nombre del huésped)
  dtstart: string;          // Fecha de inicio (YYYY-MM-DD)
  dtend: string;            // Fecha de fin (YYYY-MM-DD)
  description?: string;     // Descripción (puede tener código de reserva)
  reservation_code?: string; // Código extraído (HM...)
}
```

---

## 6. CÓDIGO COMPLETO DEL SINCRONIZADOR

### 6.1 Punto de Entrada (Edge Function)

```typescript
// supabase/functions/ical-sync/index.ts
// Edge function para sincronización automática de calendarios iCal

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface IcalConfig {
  id: string;
  property_id: string;
  user_id: string;
  ical_url: string;
  ical_name: string;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  sync_status: string;
  error_message: string | null;
  is_active: boolean;
}

interface IcalEvent {
  uid: string;
  summary: string;
  dtstart: string;
  dtend: string;
  description?: string;
  reservation_code?: string;
}

serve(async (req) => {
  try {
    // Verificar método
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    console.log('🔄 Iniciando sincronización automática de calendarios iCal');

    // Obtener todas las configuraciones activas
    const { data: icalConfigs, error: configError } = await supabase
      .from('ical_configs')
      .select('*')
      .eq('is_active', true)
      .in('sync_status', ['pending', 'active']);

    if (configError) {
      console.error('Error obteniendo configuraciones iCal:', configError);
      return new Response('Error obteniendo configuraciones', { status: 500 });
    }

    if (!icalConfigs || icalConfigs.length === 0) {
      console.log('📭 No hay configuraciones iCal activas para sincronizar');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No hay configuraciones activas',
        processed: 0 
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`📊 Procesando ${icalConfigs.length} configuraciones iCal`);

    let processed = 0;
    let errors = 0;

    // Procesar cada configuración
    for (const config of icalConfigs) {
      try {
        // Verificar si necesita sincronización
        const shouldSync = await shouldSyncConfig(config);
        if (!shouldSync) {
          console.log(`⏭️ Saltando ${config.ical_name} - no necesita sync`);
          continue;
        }

        console.log(`🔄 Sincronizando ${config.ical_name} para property ${config.property_id}`);

        // Realizar sincronización
        await syncIcalConfig(config);
        processed++;

        console.log(`✅ ${config.ical_name} sincronizado exitosamente`);

      } catch (syncError) {
        console.error(`❌ Error sincronizando ${config.ical_name}:`, syncError);
        errors++;

        // Marcar configuración con error
        await supabase
          .from('ical_configs')
          .update({
            sync_status: 'error',
            error_message: syncError.message || 'Error desconocido',
            last_sync_at: new Date().toISOString()
          })
          .eq('id', config.id);
      }
    }

    const result = {
      success: true,
      processed,
      errors,
      total: icalConfigs.length,
      timestamp: new Date().toISOString()
    };

    console.log(`🎉 Sincronización completada:`, result);

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Error en sincronización iCal:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
```

### 6.2 Determinar si Necesita Sincronización

```typescript
/**
 * Determinar si una configuración necesita sincronización
 * Basado en el intervalo configurado desde la última sincronización
 */
async function shouldSyncConfig(config: IcalConfig): Promise<boolean> {
  // Si nunca se ha sincronizado, sincronizar
  if (!config.last_sync_at) {
    return true;
  }

  // Calcular tiempo transcurrido desde última sincronización
  const lastSyncTime = new Date(config.last_sync_at).getTime();
  const now = new Date().getTime();
  const minutesSinceLastSync = (now - lastSyncTime) / (1000 * 60);

  // Sincronizar si ha pasado el intervalo configurado
  return minutesSinceLastSync >= config.sync_interval_minutes;
}
```

### 6.3 Sincronizar una Configuración

```typescript
/**
 * Sincronizar una configuración iCal específica
 * Este es el flujo principal de sincronización
 */
async function syncIcalConfig(config: IcalConfig): Promise<void> {
  try {
    // 1. Descargar iCal
    console.log(`📥 Descargando iCal de ${config.ical_url}`);
    const icalData = await fetchIcalData(config.ical_url);

    // 2. Parsear eventos
    const events = parseIcalData(icalData);
    console.log(`📅 Parsed ${events.length} eventos del iCal`);

    // 3. Agrupar eventos consecutivos (especialmente para Airbnb que divide reservas por día)
    const groupedEvents = mergeOverlappingEvents(events, config.ical_name);
    console.log(`🔗 Agrupados en ${groupedEvents.length} reservas (de ${events.length} eventos originales)`);

    // 4. Sincronizar eventos agrupados con la base de datos
    await syncEventsToDatabase(config, groupedEvents);

    // 5. Actualizar estado de la configuración
    await supabase
      .from('ical_configs')
      .update({
        sync_status: 'active',
        error_message: null,
        last_sync_at: new Date().toISOString()
      })
      .eq('id', config.id);

  } catch (error) {
    console.error(`Error en syncIcalConfig para ${config.id}:`, error);
    throw error;
  }
}
```

### 6.4 Descargar Datos iCal

```typescript
/**
 * Descargar datos iCal desde URL
 * Importante: Usar un User-Agent apropiado para evitar bloqueos
 */
async function fetchIcalData(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Your App Name Calendar Sync/1.0'
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.text();
}
```

### 6.5 Parser de iCal

```typescript
/**
 * Parsear datos iCal y extraer eventos
 * Maneja unfolding de líneas y extracción de propiedades clave
 */
function parseIcalData(icalData: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  
  // 1. Unfold lines: remove newline followed by space/tab (standard iCal folding)
  // Replace CRLF+Space/Tab or LF+Space/Tab with nothing
  const unfoldedData = icalData.replace(/\r?\n[ \t]/g, '');
  
  // 2. Split by line
  const lines = unfoldedData.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);

  let currentEvent: Partial<IcalEvent> = {};
  let inEvent = false;

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true;
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent.uid && currentEvent.dtstart && currentEvent.dtend) {
        // Intentar extraer código de reserva de description o summary
        currentEvent.reservation_code = extractReservationCode(currentEvent.description || '') 
          || extractReservationCode(currentEvent.summary || '');
        events.push(currentEvent as IcalEvent);
      }
      inEvent = false;
      currentEvent = {};
    } else if (inEvent) {
      // Parsear propiedades del evento
      // Nota: Las líneas ya están unfolded, pero pueden tener params: "DTSTART;VALUE=DATE:..."
      
      if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4);
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('DTSTART')) {
        // Buscar el primer ':' para separar propiedad/params del valor
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const value = line.substring(separatorIndex + 1);
          currentEvent.dtstart = formatIcalDate(value);
        }
      } else if (line.startsWith('DTEND')) {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex !== -1) {
          const value = line.substring(separatorIndex + 1);
          currentEvent.dtend = formatIcalDate(value);
        }
      } else if (line.startsWith('DESCRIPTION:')) {
        currentEvent.description = line.substring(12);
      }
    }
  }

  return events;
}

/**
 * Formatear fecha iCal a formato ISO (YYYY-MM-DD)
 * Maneja formatos: YYYYMMDD y YYYYMMDDTHHMMSSZ
 */
function formatIcalDate(icalDate: string): string {
  // Formato iCal: YYYYMMDD o YYYYMMDDTHHMMSSZ
  if (icalDate.length === 8) {
    // Solo fecha: YYYYMMDD
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6);
    const day = icalDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  } else if (icalDate.length >= 15) {
    // Fecha y hora: YYYYMMDDTHHMMSSZ
    const year = icalDate.substring(0, 4);
    const month = icalDate.substring(4, 6);
    const day = icalDate.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  
  return icalDate; // Fallback
}
```

### 6.6 Extracción de Código de Reserva

```typescript
/**
 * Extraer código de reserva del texto (description o summary)
 * Busca patrones como "Reservation code: XXXXX" o similar
 */
function extractReservationCode(text: string): string | undefined {
  if (!text) return undefined;
  
  // Patrones comunes de códigos de reserva
  // 1. "Reservation code: XXXXX" (Airbnb común en description)
  const codeMatch = text.match(/Reservation code:\s*([A-Z0-9]+)/i);
  if (codeMatch) return codeMatch[1];
  
  // 2. "HMXXXXX" (Airbnb codes start with HM usually, 10 chars)
  const airbnbMatch = text.match(/\b(HM[A-Z0-9]{8})\b/);
  if (airbnbMatch) return airbnbMatch[1];
  
  return undefined;
}
```

---

## 7. ALGORITMO MERGE INTERVALS

### 7.1 Fundamento Teórico

El algoritmo **Merge Intervals** es un problema clásico de programación (LeetCode #56). La idea es:

1. Ordenar intervalos por su punto de inicio
2. Iterar y fusionar intervalos que se solapan o son consecutivos
3. Resultado: lista de intervalos no solapados

### 7.2 Adaptación para iCal

Nuestra adaptación añade criterios de **identidad** para no fusionar reservas de diferentes huéspedes:

- Mismo prefijo UID
- Mismo código de reserva
- Mismo nombre de huésped (si no es genérico)

### 7.3 Código del Algoritmo

```typescript
/**
 * MERGE INTERVALS ALGORITHM (LeetCode #56 adaptado)
 * Fusiona eventos que se SOLAPAN o son CONSECUTIVOS de la misma reserva.
 * 
 * PROBLEMA RESUELTO: Airbnb envía eventos solapados/redundantes:
 *   - Evento A: 25 Nov - 02 Dic (7 noches)
 *   - Evento B: 01 Dic - 02 Dic (1 noche, YA INCLUIDA en A)
 *   - Evento C: 02 Dic - 03 Dic (1 noche, consecutiva)
 * 
 * La lógica anterior solo detectaba consecutivos exactos (fin == inicio).
 * Esta nueva lógica detecta: fin >= inicio (solapamiento O consecutivo).
 * 
 * Corner cases cubiertos:
 *   1. Consecutivos: [1-5], [5-8] → [1-8]
 *   2. Solapados: [1-10], [3-5] → [1-10]
 *   3. Extensión: [1-5], [3-8] → [1-8]
 *   4. Contenidos: [1-10], [2-3], [4-5] → [1-10]
 *   5. Con gap: [1-3], [5-7] → [1-3], [5-7] (NO fusionar)
 */
function mergeOverlappingEvents(events: IcalEvent[], sourceName: string): IcalEvent[] {
  // Si no hay eventos, retornar vacío
  if (events.length === 0) {
    return [];
  }

  // PASO 1: Ordenar por fecha de inicio (crítico para el algoritmo)
  const sorted = [...events].sort((a, b) => 
    a.dtstart.localeCompare(b.dtstart)
  );

  const merged: IcalEvent[] = [];
  // Clonar el primer evento para no mutar el original
  let current: IcalEvent = { ...sorted[0] };

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i];
    
    // Normalizar fechas para comparación (eliminar componente de hora)
    const currentEnd = current.dtend.split('T')[0];
    const nextStart = next.dtstart.split('T')[0];
    const nextEnd = next.dtend.split('T')[0];

    // CLAVE DEL ALGORITMO: Detectar solapamiento O consecutivo
    // nextStart <= currentEnd significa que se tocan o solapan
    const overlapsOrConsecutive = nextStart <= currentEnd;

    // Verificar si pertenecen a la misma "reserva"
    const sameReservation = shouldMergeEvents(current, next);

    if (overlapsOrConsecutive && sameReservation) {
      // FUSIONAR: Extender el fin al máximo de ambos
      if (nextEnd > currentEnd) {
        current.dtend = next.dtend;
      }
      // Preservar código de reserva si el actual no tiene pero el siguiente sí
      if (!current.reservation_code && next.reservation_code) {
        current.reservation_code = next.reservation_code;
      }
      // Preservar description más informativa
      if (!current.description && next.description) {
        current.description = next.description;
      }
    } else {
      // NO fusionar: guardar actual y empezar nuevo grupo
      merged.push(current);
      current = { ...next };
    }
  }
  
  // No olvidar el último evento
  merged.push(current);

  // Log para debugging
  if (events.length !== merged.length) {
    console.log(`🔗 Merge intervals: ${events.length} eventos → ${merged.length} reservas`);
  }

  return merged;
}
```

### 7.4 Criterios de Identidad

```typescript
/**
 * Determina si dos eventos pertenecen a la misma reserva.
 * Criterios de identidad ordenados por prioridad.
 * 
 * Esta función es la "salvaguarda" que evita fusionar reservas
 * de diferentes huéspedes que casualmente se solapan (overbooking).
 */
function shouldMergeEvents(a: IcalEvent, b: IcalEvent): boolean {
  // 1. PRIORIDAD MÁXIMA: Mismo código de reserva
  // Si ambos tienen código, deben coincidir exactamente
  if (a.reservation_code && b.reservation_code) {
    return a.reservation_code === b.reservation_code;
  }

  // 2. Mismo prefijo UID (patrón Airbnb: "7f662ec65913-HASH@airbnb.com")
  const prefixA = extractUidPrefix(a.uid);
  const prefixB = extractUidPrefix(b.uid);
  if (prefixA && prefixB && prefixA === prefixB) {
    return true;
  }

  // 3. Mismo summary no-genérico (nombre del huésped)
  if (a.summary === b.summary && !isGenericBlocked(a.summary)) {
    return true;
  }

  // 4. Ambos son bloqueos genéricos del mismo prefijo UID → fusionar
  // Esto cubre el caso de "Airbnb (Not available)" fragmentado
  if (isGenericBlocked(a.summary) && isGenericBlocked(b.summary)) {
    return prefixA === prefixB && prefixA !== null;
  }

  // Por defecto: NO fusionar (seguridad)
  return false;
}

/**
 * Verifica si un summary es un bloqueo genérico
 * Estos no tienen información del huésped
 */
function isGenericBlocked(summary: string): boolean {
  const s = summary.toLowerCase();
  return s === 'not available' 
      || s === 'blocked' 
      || s === 'airbnb (not available)'
      || s === 'reserved';
}
```

### 7.5 Extracción de Prefijo UID

```typescript
/**
 * Extraer el prefijo del UID para identificar eventos de la misma reserva.
 * Soporta múltiples formatos de diferentes proveedores.
 * 
 * Patrones soportados:
 *   - Airbnb: "7f662ec65913-HASH@airbnb.com" → "7f662ec65913"
 *   - Booking.com: "79fd71e0f90af48e0bae29eee538f859@booking.com" → "79fd71e0" (primeros 8 chars)
 *   - Otros: primeros 8 caracteres del UID (fallback)
 */
function extractUidPrefix(uid: string): string | null {
  if (!uid) return null;
  
  // 1. Patrón Airbnb: prefijo antes del primer guión
  const airbnbMatch = uid.match(/^([^-]+)-/);
  if (airbnbMatch && airbnbMatch[1].length >= 8) {
    return airbnbMatch[1];
  }
  
  // 2. Patrón Booking.com: usar primeros 8 chars del hash
  // Esto agrupa eventos del mismo "lote" si Booking algún día fragmenta
  if (uid.includes('@booking.com')) {
    return uid.substring(0, 8);
  }
  
  // 3. Patrón genérico con guión pero prefijo muy corto: usar primeros 8 chars
  if (uid.length >= 8) {
    return uid.substring(0, 8);
  }
  
  return null;
}
```

---

## 8. DETECCIÓN INTELIGENTE DEL ORIGEN

### 8.1 El Problema

Necesitamos saber si una reserva viene de Airbnb, Booking.com, u otra fuente. Esta información es crítica para:

1. **UI:** Mostrar el ícono/logo correcto
2. **Lógica:** Aplicar reglas específicas por plataforma
3. **Auditoría:** Debugging cuando hay problemas

### 8.2 Estrategia de Detección

**Prioridad 1:** Detectar por **dominio del UID**. Es infalible porque el UID viene directamente del proveedor.

**Prioridad 2:** Usar el **nombre de la configuración iCal** como fallback.

### 8.3 Código de Detección

```typescript
/**
 * Detectar booking_source de forma robusta.
 * PRIORIDAD: Dominio del UID > ical_name
 * 
 * FIX v2.3: Previene inconsistencias donde reservas de Airbnb
 * terminaban con booking_source "booking.com" por bugs anteriores.
 */
function detectBookingSource(uid: string, icalName: string): string {
  // 1. PRIORIDAD MÁXIMA: Detectar por dominio del UID
  // Esto es infalible porque el UID viene directamente del proveedor
  if (uid.includes('@airbnb.com')) {
    return 'airbnb';
  }
  if (uid.includes('@booking.com')) {
    return 'booking.com';
  }
  if (uid.toLowerCase().includes('vrbo')) {
    return 'vrbo';
  }
  
  // 2. FALLBACK: Usar ical_name normalizado
  const normalizedName = icalName.toLowerCase();
  if (normalizedName.includes('airbnb')) {
    return 'airbnb';
  }
  if (normalizedName.includes('booking')) {
    return 'booking.com';
  }
  if (normalizedName.includes('vrbo')) {
    return 'vrbo';
  }
  
  // 3. DEFAULT: Usar el nombre tal cual (lowercase)
  return normalizedName;
}
```

---

## 9. RECONCILIACIÓN POST-SINCRONIZACIÓN

### 9.1 ¿Por Qué es Necesaria?

El algoritmo Merge Intervals funciona bien cuando todos los fragmentos llegan en la **misma sincronización**. Pero Airbnb puede enviar fragmentos en **diferentes sincronizaciones**:

- **Sync #1:** Reserva parcial [04-07 Dic]
- **Sync #2:** Extensión [07-09 Dic]

Si solo aplicamos merge en el parseo, estos fragmentos se guardarán como dos reservas separadas. La **reconciliación post-sync** los detecta y fusiona en la base de datos.

### 9.2 Sincronización con Base de Datos (Código Completo)

```typescript
/**
 * Sincronizar eventos con la base de datos
 * 
 * REGLA ESTRICTA v2.7: Eventos con mismo prefijo UID = MISMA RESERVA
 * - Si llega un evento con prefijo UID que ya existe en BD → EXTENDER la reserva existente
 * - No crear duplicados fragmentados
 * 
 * Estrategia:
 * 1. Agrupar eventos entrantes por prefijo UID
 * 2. Para cada grupo, calcular el rango total (min start, max end)
 * 3. Buscar si existe reserva con ese prefijo → ACTUALIZAR
 * 4. Si no existe → CREAR nueva
 */
async function syncEventsToDatabase(config: IcalConfig, events: IcalEvent[]): Promise<void> {
  // 1. Obtener TODOS los eventos existentes para esta config
  const { data: existingBookings, error: fetchError } = await supabase
    .from('bookings')  // o 'synced_bookings' según tu tabla
    .select('*')
    .eq('property_id', config.property_id)
    .eq('ical_config_id', config.id);
  
  if (fetchError) {
    console.error('Error fetching existing bookings:', fetchError);
    throw fetchError;
  }

  console.log(`📊 Reconciliando: ${existingBookings?.length || 0} existentes vs ${events.length} entrantes`);

  // ============================================================================
  // v3.0 FIX: Almacenar TODOS los fragmentos existentes por prefijo
  // PROBLEMA ANTERIOR: El Map sobrescribía, guardando solo 1 fragmento por prefijo.
  // SOLUCIÓN: Usar Map<string, any[]> para acumular TODOS los fragmentos.
  // Esto permite consolidarlos y eliminar duplicados correctamente.
  // ============================================================================
  const existingByPrefix = new Map<string, any[]>();  // ← CAMBIO: Array en lugar de single
  const existingByUid = new Map<string, any>();

  for (const booking of (existingBookings || [])) {
    // Mapa por UID exacto (para búsquedas directas)
    existingByUid.set(booking.booking_uid, booking);
    
    // Mapa por prefijo (para agrupar fragmentos de la misma reserva)
    const prefix = extractUidPrefix(booking.booking_uid);
    if (prefix) {
      // NUEVO v3.0: Acumular TODOS los fragmentos con el mismo prefijo
      const existingGroup = existingByPrefix.get(prefix) || [];
      existingGroup.push(booking);
      existingByPrefix.set(prefix, existingGroup);
    }
  }

  // Log de diagnóstico: mostrar prefijos con múltiples fragmentos
  for (const [prefix, group] of existingByPrefix) {
    if (group.length > 1) {
      console.log(`⚠️ Prefijo ${prefix} tiene ${group.length} fragmentos existentes en BD - serán consolidados`);
    }
  }

  // 3. NUEVO v2.7: Agrupar eventos entrantes por prefijo UID
  // Cada grupo se convertirá en UNA sola reserva
  const eventsByPrefix = new Map<string, IcalEvent[]>();
  
  for (const event of events) {
    const prefix = extractUidPrefix(event.uid) || event.uid; // Fallback al UID completo
    const group = eventsByPrefix.get(prefix) || [];
    group.push(event);
    eventsByPrefix.set(prefix, group);
  }

  console.log(`🔗 ${events.length} eventos agrupados en ${eventsByPrefix.size} grupos por prefijo UID`);

  // 4. Procesar cada grupo de eventos
  let created = 0;
  let updated = 0;
  let extended = 0;
  const processedPrefixes = new Set<string>();

  // Variable para rastrear fragmentos eliminados (para el resumen)
  let fragmentsDeleted = 0;

  for (const [prefix, groupEvents] of eventsByPrefix) {
    // ============================================================================
    // PASO 1: Calcular rango consolidado de eventos ENTRANTES
    // ============================================================================
    let minStart = groupEvents[0].dtstart.split('T')[0];
    let maxEnd = groupEvents[0].dtend.split('T')[0];
    let bestEvent = groupEvents[0];
    
    for (const event of groupEvents) {
      const start = event.dtstart.split('T')[0];
      const end = event.dtend.split('T')[0];
      if (start < minStart) minStart = start;
      if (end > maxEnd) maxEnd = end;
      // Preferir evento con más información
      if ((event.reservation_code || event.summary) && !bestEvent.reservation_code) {
        bestEvent = event;
      }
    }

    const detectedSource = detectBookingSource(bestEvent.uid, config.ical_name);
    
    // ============================================================================
    // PASO 2: Obtener TODOS los fragmentos existentes con este prefijo (v3.0)
    // ============================================================================
    const existingFragments = existingByPrefix.get(prefix) || [];
    
    if (existingFragments.length > 0) {
      // ========================================================================
      // PASO 3: Calcular rango COMBINADO (existentes + entrantes)
      // ========================================================================
      let finalStart = minStart;
      let finalEnd = maxEnd;
      
      for (const fragment of existingFragments) {
        const fragStart = fragment.check_in_date.split('T')[0];
        const fragEnd = fragment.check_out_date.split('T')[0];
        if (fragStart < finalStart) finalStart = fragStart;
        if (fragEnd > finalEnd) finalEnd = fragEnd;
      }
      
      // ========================================================================
      // PASO 4: ACTUALIZAR el primer fragmento con el rango consolidado
      // ========================================================================
      const primaryBooking = existingFragments[0];
      const rangeChanged = finalStart !== primaryBooking.check_in_date.split('T')[0] || 
                           finalEnd !== primaryBooking.check_out_date.split('T')[0];
      
      if (rangeChanged || existingFragments.length > 1) {
        console.log(`🔄 Consolidando prefijo ${prefix}: ${existingFragments.length} fragmentos → [${finalStart} - ${finalEnd}]`);
        
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            check_in_date: finalStart,
            check_out_date: finalEnd,
            source: detectedSource,  // Adaptar nombre de columna según tu tabla
            status: determineBookingStatus(bestEvent.summary),
            guest_name: extractGuestName(bestEvent.summary) || primaryBooking.guest_name,
            raw_ical_event: {
              ...bestEvent,
              consolidated_from: groupEvents.length + existingFragments.length - 1,
              original_fragments: existingFragments.map((f: any) => f.id),
              consolidated_at: new Date().toISOString()
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', primaryBooking.id);
        
        if (updateError) {
          console.error(`❌ Error actualizando reserva ${primaryBooking.id}:`, updateError);
        } else {
          extended++;
        }
      }
      
      // ========================================================================
      // PASO 5: ELIMINAR los fragmentos duplicados (todos excepto el primario)
      // ========================================================================
      if (existingFragments.length > 1) {
        const idsToDelete = existingFragments.slice(1).map((f: any) => f.id);
        console.log(`🗑️ Eliminando ${idsToDelete.length} fragmentos duplicados: [${idsToDelete.join(', ')}]`);
        
        const { error: deleteError } = await supabase
          .from('bookings')
          .delete()
          .in('id', idsToDelete);
        
        if (deleteError) {
          console.error(`❌ Error eliminando duplicados:`, deleteError);
        } else {
          fragmentsDeleted += idsToDelete.length;
          console.log(`✅ Eliminados ${idsToDelete.length} fragmentos duplicados para prefijo ${prefix}`);
        }
      }
      
      processedPrefixes.add(prefix);
      
    } else {
      // ========================================================================
      // PASO 6: No existe → Crear nueva reserva
      // ========================================================================
      console.log(`➕ Creando nueva reserva para prefijo ${prefix}: [${minStart} - ${maxEnd}]`);
      
      const newBooking = {
        property_id: config.property_id,
        user_id: config.user_id,
        ical_config_id: config.id,
        booking_uid: bestEvent.uid,
        check_in_date: minStart,
        check_out_date: maxEnd,
        guest_name: extractGuestName(bestEvent.summary) || 'Guest',
        source: detectedSource,
        status: determineBookingStatus(bestEvent.summary),
        raw_ical_event: {
          ...bestEvent,
          consolidated_from: groupEvents.length,
          original_range: `${minStart} to ${maxEnd}`
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error: insertError } = await supabase
        .from('bookings')
        .insert(newBooking);
      
      if (insertError) {
        console.error(`❌ Error creando reserva:`, insertError);
      } else {
        created++;
      }
      
      processedPrefixes.add(prefix);
    }
  }

  // 5. Limpiar reservas con prefijos que ya no existen en el iCal
  // (Solo si el prefijo no fue procesado en esta sincronización)
  const prefixesToDelete: string[] = [];
  for (const booking of (existingBookings || [])) {
    const prefix = extractUidPrefix(booking.booking_uid);
    if (prefix && !processedPrefixes.has(prefix)) {
      prefixesToDelete.push(booking.id);
    }
  }

  if (prefixesToDelete.length > 0) {
    console.log(`🗑️ Eliminando ${prefixesToDelete.length} reservas obsoletas`);
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .in('id', prefixesToDelete);
      
    if (deleteError) {
      console.error('Error eliminando reservas obsoletas:', deleteError);
    }
  }
  
  // ============================================================================
  // v3.0: Resumen de sincronización
  // ============================================================================
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    RESUMEN DE SINCRONIZACIÓN v3.0            ║
╠══════════════════════════════════════════════════════════════╣
║  Eventos recibidos:        ${events.length.toString().padStart(5)}                            ║
║  Grupos por prefijo:       ${eventsByPrefix.size.toString().padStart(5)}                            ║
║  Reservas creadas:         ${created.toString().padStart(5)}                            ║
║  Reservas extendidas:      ${extended.toString().padStart(5)}                            ║
║  Fragmentos eliminados:    ${fragmentsDeleted.toString().padStart(5)}                            ║
║  Obsoletas eliminadas:     ${prefixesToDelete.length.toString().padStart(5)}                            ║
╚══════════════════════════════════════════════════════════════╝
`);

  // 6. Reconciliación final por si quedaron fragmentos de syncs anteriores
  await reconcileConsecutiveBookings(config);
}
```

### 9.3 Funciones Auxiliares de Sincronización

```typescript
/**
 * Determinar estado de reserva basado en el summary
 */
function determineBookingStatus(summary: string): string {
  const lowerSummary = summary.toLowerCase();
  
  if (lowerSummary.includes('blocked') || lowerSummary.includes('bloqueado')) {
    return 'blocked';
  }
  if (lowerSummary.includes('available') || lowerSummary.includes('disponible')) {
    return 'available';
  }
  if (lowerSummary.includes('reserved') || lowerSummary.includes('reservado')) {
    return 'reserved';
  }
  
  return 'blocked'; // Default para eventos desconocidos
}

/**
 * Extraer nombre del huésped del summary si está disponible
 */
function extractGuestName(summary: string): string | null {
  // Intentar extraer nombre del formato común "Reserved for John Doe"
  const match = summary.match(/(?:reserved for|reservado para|for)\s+([a-zA-Z\s]+)/i);
  return match ? match[1].trim() : null;
}
```

### 9.4 Reconciliación de Reservas Consecutivas en BD

```typescript
/**
 * RECONCILIACIÓN POST-SYNC (MERGE INTERVALS en BD)
 * Fusiona eventos SOLAPADOS o CONSECUTIVOS que ya están en la base de datos.
 * Usa la misma lógica que mergeOverlappingEvents para consistencia.
 * 
 * PROBLEMA RESUELTO: Eventos que llegaron en sincronizaciones diferentes
 * y no fueron fusionados en el momento de parseo inicial.
 * 
 * Criterios para fusionar (mismos que shouldMergeEvents):
 *   1. Fechas solapadas O consecutivas (check_in_B <= check_out_A)
 *   2. Y pertenecen a la misma reserva (prefijo UID, summary, código)
 */
async function reconcileConsecutiveBookings(config: IcalConfig): Promise<void> {
  console.log(`🔄 Reconciliando eventos solapados/consecutivos para ${config.ical_name}...`);

  // 1. Obtener todos los bookings de esta config ordenados por fecha
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('property_id', config.property_id)
    .eq('ical_config_id', config.id)
    .order('check_in_date', { ascending: true });

  if (error) {
    console.error('Error obteniendo bookings para reconciliación:', error);
    return;
  }

  // Si hay 0 o 1 booking, no hay nada que reconciliar
  if (!bookings || bookings.length <= 1) {
    console.log('  ℹ️ No hay suficientes bookings para reconciliar');
    return;
  }

  // 2. Identificar grupos usando MERGE INTERVALS (solapados O consecutivos)
  const groups: typeof bookings[] = [];
  let currentGroup: typeof bookings = [bookings[0]];

  for (let i = 1; i < bookings.length; i++) {
    const current = bookings[i];
    const last = currentGroup[currentGroup.length - 1];

    // Normalizar fechas para comparación
    const lastCheckOut = last.check_out_date.split('T')[0];
    const currentCheckIn = current.check_in_date.split('T')[0];
    
    // CAMBIO CLAVE: Detectar SOLAPAMIENTO O CONSECUTIVO
    // currentCheckIn <= lastCheckOut significa que se tocan o solapan
    const overlapsOrConsecutive = currentCheckIn <= lastCheckOut;

    // Extraer prefijos UID para verificar misma reserva
    const lastPrefix = extractUidPrefix(last.booking_uid || '');
    const currentPrefix = extractUidPrefix(current.booking_uid || '');
    const samePrefix = lastPrefix && currentPrefix && lastPrefix === currentPrefix;

    // Comparar summaries
    const lastSummary = last.raw_ical_event?.summary || '';
    const currentSummary = current.raw_ical_event?.summary || '';
    const sameSummary = lastSummary === currentSummary;

    // Criterios de agrupación: (solapado O consecutivo) + misma reserva
    // Misma reserva = mismo prefijo UID O mismo summary no-genérico
    const sameReservation = (
      samePrefix ||
      (sameSummary && !isGenericBlocked(currentSummary)) ||
      (isGenericBlocked(lastSummary) && isGenericBlocked(currentSummary) && samePrefix)
    );

    const shouldGroup = overlapsOrConsecutive && sameReservation;

    if (shouldGroup) {
      // Añadir al grupo actual
      currentGroup.push(current);
    } else {
      // Cerrar grupo actual y empezar uno nuevo
      groups.push(currentGroup);
      currentGroup = [current];
    }
  }
  // No olvidar el último grupo
  groups.push(currentGroup);

  // 3. Fusionar grupos que tienen más de 1 elemento
  let merged = 0;
  let deleted = 0;
  let sourceCorrected = 0;

  for (const group of groups) {
    if (group.length <= 1) continue; // Nada que fusionar

    // El primer elemento se convierte en el "padre" consolidado
    const first = group[0];
    
    // CAMBIO: Encontrar la fecha de checkout MÁXIMA del grupo
    // (no solo del último, porque pueden estar solapados)
    let maxCheckOut = first.check_out_date.split('T')[0];
    for (const booking of group) {
      const bookingEnd = booking.check_out_date.split('T')[0];
      if (bookingEnd > maxCheckOut) {
        maxCheckOut = bookingEnd;
      }
    }

    // FIX v2.5: Detectar y corregir booking_source basado en el UID
    const correctSource = detectBookingSource(first.booking_uid || '', config.ical_name);
    const needsSourceCorrection = first.source !== correctSource;
    
    if (needsSourceCorrection) {
      console.log(`  🔧 Corrigiendo source en reconciliación: "${first.source}" → "${correctSource}"`);
      sourceCorrected++;
    }

    const consolidatedDescription = `Reserva consolidada de ${group.length} eventos (${first.check_in_date} a ${maxCheckOut})`;

    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        check_out_date: maxCheckOut,
        source: correctSource,
        raw_ical_event: {
          ...first.raw_ical_event,
          description: consolidatedDescription,
          consolidated_from: group.length,
          consolidated_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', first.id);

    if (updateError) {
      console.error(`  ❌ Error actualizando booking ${first.id}:`, updateError);
      continue;
    }

    // Eliminar los demás elementos del grupo (ya están fusionados en el primero)
    const idsToDelete = group.slice(1).map(b => b.id);
    
    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error(`  ❌ Error eliminando bookings fusionados:`, deleteError);
    } else {
      merged++;
      deleted += idsToDelete.length;
      console.log(`  🔗 Fusionados ${group.length} eventos: ${first.check_in_date} → ${maxCheckOut}`);
    }
  }

  if (merged > 0 || sourceCorrected > 0) {
    console.log(`✅ Reconciliación completada: ${merged} grupos fusionados, ${deleted} duplicados eliminados, ${sourceCorrected} sources corregidos`);
  } else {
    console.log('  ℹ️ No se encontraron eventos solapados/consecutivos para fusionar');
  }
}
```

---

## 10. SCRIPTS DE MANTENIMIENTO SQL

### 10.1 Script de Limpieza de Fragmentos Históricos

```sql
-- ============================================================================
-- cleanup-fragmented-bookings.sql
-- Propósito: Consolidar fragmentos históricos con mismo prefijo UID
-- Ejecutar: DESPUÉS de desplegar el fix de la Edge Function
-- ============================================================================

-- Paso 0: Crear backup antes de modificar
CREATE TABLE IF NOT EXISTS bookings_backup AS 
SELECT * FROM bookings WHERE source != 'manual';

-- Paso 1: Identificar fragmentos a consolidar
WITH fragment_analysis AS (
  SELECT 
    property_id,
    -- Extraer prefijo según el patrón del proveedor
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END as uid_prefix,
    COUNT(*) as num_fragments,
    MIN(id) as primary_id,
    MIN(check_in_date) as first_checkin,
    MAX(check_out_date) as last_checkout,
    array_agg(id ORDER BY check_in_date) as all_ids,
    array_agg(check_in_date ORDER BY check_in_date) as all_checkins,
    array_agg(check_out_date ORDER BY check_in_date) as all_checkouts
  FROM bookings
  WHERE booking_uid IS NOT NULL
    AND booking_uid != ''
    AND source != 'manual'
  GROUP BY property_id, 
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END
  HAVING COUNT(*) > 1
)
SELECT * FROM fragment_analysis ORDER BY num_fragments DESC;

-- Paso 2: Actualizar el registro primario con el rango consolidado
WITH consolidated AS (
  SELECT 
    property_id,
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END as uid_prefix,
    MIN(id) as primary_id,
    MIN(check_in_date) as first_checkin,
    MAX(check_out_date) as last_checkout
  FROM bookings
  WHERE booking_uid IS NOT NULL AND booking_uid != '' AND source != 'manual'
  GROUP BY property_id, 
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END
  HAVING COUNT(*) > 1
)
UPDATE bookings b
SET 
  check_in_date = c.first_checkin,
  check_out_date = c.last_checkout,
  updated_at = now(),
  raw_ical_event = jsonb_set(
    COALESCE(raw_ical_event, '{}'::jsonb),
    '{consolidated_by_cleanup}',
    'true'::jsonb
  )
FROM consolidated c
WHERE b.id = c.primary_id;

-- Paso 3: Eliminar duplicados (todos excepto el primario)
WITH consolidated AS (
  SELECT 
    property_id,
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END as uid_prefix,
    MIN(id) as primary_id,
    array_agg(id ORDER BY check_in_date) as all_ids
  FROM bookings
  WHERE booking_uid IS NOT NULL AND booking_uid != '' AND source != 'manual'
  GROUP BY property_id, 
    CASE 
      WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
      WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
      ELSE substring(booking_uid from 1 for 8)
    END
  HAVING COUNT(*) > 1
)
DELETE FROM bookings
WHERE id IN (
  SELECT unnest(all_ids[2:])  -- Todos excepto el primero
  FROM consolidated
);

-- Paso 4: Verificar que no quedan duplicados
SELECT 
  property_id,
  CASE 
    WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
    WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
    ELSE substring(booking_uid from 1 for 8)
  END as uid_prefix,
  COUNT(*) as count
FROM bookings
WHERE booking_uid IS NOT NULL AND booking_uid != '' AND source != 'manual'
GROUP BY property_id, 
  CASE 
    WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
    WHEN booking_uid LIKE '%@booking.com' THEN substring(booking_uid from 1 for 8)
    ELSE substring(booking_uid from 1 for 8)
  END
HAVING COUNT(*) > 1;
-- RESULTADO ESPERADO: 0 filas (no hay duplicados)
```

### 10.2 Script de Auditoría

```sql
-- ============================================================================
-- audit-bookings-integrity.sql
-- Script de auditoría para detectar inconsistencias en reservas sincronizadas
-- EJECUTAR: Periódicamente o cuando se sospeche de datos corruptos
-- ============================================================================

-- AUDITORÍA 1: UID vs source inconsistentes
-- Detecta cuando el dominio del UID no coincide con el source
SELECT 
  '❌ UID_SOURCE_MISMATCH' as issue,
  id,
  booking_uid,
  source,
  check_in_date,
  check_out_date,
  CASE 
    WHEN booking_uid LIKE '%@airbnb.com' THEN 'debería ser: airbnb'
    WHEN booking_uid LIKE '%@booking.com' THEN 'debería ser: booking.com'
    ELSE 'verificar manualmente'
  END as fix_needed
FROM bookings
WHERE 
  source != 'manual'
  AND (
    (booking_uid LIKE '%@airbnb.com' AND source NOT LIKE '%airbnb%')
    OR (booking_uid LIKE '%@booking.com' AND source NOT LIKE '%booking%')
  );

-- AUDITORÍA 2: Reservas contenidas (duplicados potenciales)
SELECT 
  '❌ CONTAINED_DUPLICATE' as issue,
  b.id as duplicate_id,
  b.booking_uid as duplicate_uid,
  b.check_in_date as duplicate_checkin,
  b.check_out_date as duplicate_checkout,
  a.id as parent_id,
  a.check_in_date as parent_checkin,
  a.check_out_date as parent_checkout
FROM bookings a
JOIN bookings b ON 
  a.id != b.id 
  AND a.property_id = b.property_id
  -- Mismo prefijo UID (misma reserva fragmentada)
  AND SUBSTRING(a.booking_uid FROM '^([^-]+)') = SUBSTRING(b.booking_uid FROM '^([^-]+)')
  -- b está contenido en a
  AND a.check_in_date <= b.check_in_date 
  AND a.check_out_date >= b.check_out_date
  -- a es más grande que b
  AND (a.check_out_date - a.check_in_date) > (b.check_out_date - b.check_in_date);

-- AUDITORÍA 3: Reservas huérfanas (sin ical_config)
SELECT 
  '❌ ORPHAN_BOOKING' as issue,
  b.id,
  b.booking_uid,
  b.source,
  b.ical_config_id as missing_config_id,
  b.check_in_date,
  b.check_out_date
FROM bookings b
LEFT JOIN ical_configs ic ON b.ical_config_id = ic.id
WHERE b.source != 'manual' AND ic.id IS NULL;

-- RESUMEN: Conteo de problemas
SELECT 'RESUMEN DE AUDITORÍA' as section;

SELECT 
  'uid_source_mismatch' as check_type,
  COUNT(*) as issues_found
FROM bookings
WHERE 
  source != 'manual'
  AND (
    (booking_uid LIKE '%@airbnb.com' AND source NOT LIKE '%airbnb%')
    OR (booking_uid LIKE '%@booking.com' AND source NOT LIKE '%booking%')
  )

UNION ALL

SELECT 
  'orphan_bookings' as check_type,
  COUNT(*) as issues_found
FROM bookings b
LEFT JOIN ical_configs ic ON b.ical_config_id = ic.id
WHERE b.source != 'manual' AND ic.id IS NULL;
```

---

## 11. ERRORES COMUNES Y SOLUCIONES

### 11.1 Error: Reservas Fragmentadas Persisten

**Síntoma:** A pesar de desplegar el código, las reservas siguen apareciendo fragmentadas.

**Causas posibles:**

1. **Código no desplegado:** El código local fue modificado pero no desplegado.
   ```bash
   # Solución: Forzar despliegue
   npx supabase functions deploy ical-sync --no-verify-jwt
   ```

2. **Sistema paralelo activo:** Existe un cron job o función SQL escribiendo en la tabla.
   ```sql
   -- Verificar cron jobs activos
   SELECT * FROM cron.job WHERE active = true AND command LIKE '%booking%';
   
   -- Deshabilitar si existe
   SELECT cron.unschedule('nombre-del-job');
   ```

3. **Datos legacy corruptos:** Fragmentos creados antes del fix que nunca fueron limpiados.
   ```sql
   -- Ejecutar script de limpieza
   -- (ver sección 10.1)
   ```

### 11.2 Error: booking_source Incorrecto

**Síntoma:** Reservas de Airbnb muestran `source = 'booking.com'`.

**Causa:** El código anterior no detectaba correctamente el origen, o había un script manual mal configurado.

**Solución:**
```sql
-- Corregir sources basado en el UID
UPDATE bookings
SET source = 'airbnb', updated_at = now()
WHERE booking_uid LIKE '%@airbnb.com' AND source != 'airbnb';

UPDATE bookings
SET source = 'booking.com', updated_at = now()
WHERE booking_uid LIKE '%@booking.com' AND source != 'booking.com';
```

### 11.3 Error: Reservas Desaparecen

**Síntoma:** Después de una sincronización, reservas válidas ya no aparecen.

**Causa posible:** La lógica de eliminación de "obsoletas" borró reservas que no deberían borrarse.

**Diagnóstico:**
1. Revisar logs de la Edge Function
2. Buscar "Eliminando reservas obsoletas"
3. Verificar que el prefijo UID extraído sea correcto

**Prevención:** El campo `raw_ical_event` guarda el evento original para debugging.

### 11.4 Error: Timeout en Sincronización

**Síntoma:** La Edge Function falla por timeout con muchas propiedades.

**Solución:** Procesar en lotes o aumentar timeout:
```typescript
// Procesar máximo 10 configs por invocación
const batch = icalConfigs.slice(0, 10);
for (const config of batch) {
  // ...
}
```

---

## 12. CHECKLIST DE IMPLEMENTACIÓN

### 12.1 Pre-Requisitos

- [ ] Base de datos PostgreSQL (Supabase, PlanetScale, etc.)
- [ ] Capacidad de ejecutar funciones serverless (Edge Functions, Lambda, etc.)
- [ ] URLs de calendarios iCal de prueba (Airbnb y Booking)

### 12.2 Pasos de Implementación

1. **Crear tablas de base de datos**
   - [ ] Tabla `ical_configs`
   - [ ] Tabla `bookings` (o equivalente)
   - [ ] Índices necesarios

2. **Implementar Edge Function**
   - [ ] Parser de iCal (`parseIcalData`)
   - [ ] Algoritmo Merge Intervals (`mergeOverlappingEvents`)
   - [ ] Sincronización con BD (`syncEventsToDatabase`)
   - [ ] Reconciliación (`reconcileConsecutiveBookings`)
   - [ ] Detección de origen (`detectBookingSource`)

3. **Configurar ejecución**
   - [ ] Cron job o trigger para sincronización automática
   - [ ] Endpoint para sincronización manual
   - [ ] Logging adecuado para debugging

4. **Testing**
   - [ ] Probar con calendario Booking.com (sin fragmentación)
   - [ ] Probar con calendario Airbnb (con fragmentación)
   - [ ] Simular fragmentación por día
   - [ ] Simular extensión de reserva

5. **Mantenimiento**
   - [ ] Script de auditoría configurado
   - [ ] Script de limpieza disponible
   - [ ] Documentación actualizada

### 12.3 Verificación Post-Implementación

```sql
-- Verificar que no hay fragmentos duplicados
SELECT 
  CASE 
    WHEN booking_uid LIKE '%@airbnb.com' THEN split_part(booking_uid, '-', 1)
    ELSE substring(booking_uid from 1 for 8)
  END as prefix,
  COUNT(*) as count
FROM bookings
WHERE booking_uid IS NOT NULL AND source != 'manual'
GROUP BY prefix
HAVING COUNT(*) > 1;
-- RESULTADO ESPERADO: 0 filas
```

---

## 13. ADAPTACIÓN A OTROS PROYECTOS

### 13.1 Consideraciones de Arquitectura

El código presentado está diseñado para **Supabase Edge Functions** (Deno). Para adaptarlo:

| Plataforma | Cambios Necesarios |
|------------|-------------------|
| **Node.js / Express** | Cambiar imports de Deno a Node, usar `node-fetch` |
| **AWS Lambda** | Envolver en handler Lambda, configurar timeout |
| **Vercel Serverless** | Adaptar a estructura de Vercel, usar `@vercel/edge` |
| **Firebase Functions** | Usar `firebase-functions`, adaptar sintaxis |

### 13.2 Adaptación de Tablas

El esquema de tablas puede variar según tu proyecto. Lo importante es mantener:

1. **`booking_uid`:** Campo único para el UID del iCal (clave para deduplicación)
2. **`check_in_date` / `check_out_date`:** Fechas de la reserva
3. **`source`:** Origen de la reserva (airbnb, booking, etc.)
4. **`raw_ical_event`:** JSON con evento original (para debugging)
5. **`ical_config_id`:** Relación con la configuración que generó la reserva

### 13.3 Nombres de Campos

Adapta los nombres de campos según tu convención:

| Este documento | Alternativas comunes |
|----------------|---------------------|
| `booking_uid` | `external_id`, `ical_uid`, `reservation_id` |
| `check_in_date` | `start_date`, `arrival_date`, `from_date` |
| `check_out_date` | `end_date`, `departure_date`, `to_date` |
| `source` | `booking_source`, `channel`, `platform` |
| `raw_ical_event` | `ical_data`, `original_event`, `metadata` |

### 13.4 Ejemplo de Adaptación Mínima

Si tienes una tabla `reservations` con estructura diferente:

```typescript
// Adaptar el INSERT
const newReservation = {
  // Tu campo para property
  property_uuid: config.property_id,
  
  // Tu campo para UID (CRÍTICO para deduplicación)
  external_reference: bestEvent.uid,
  
  // Tus campos de fecha
  arrival: minStart,
  departure: maxEnd,
  
  // Tu campo de origen
  channel: detectedSource,
  
  // Datos del huésped
  guest_full_name: extractGuestName(bestEvent.summary) || 'Guest',
  
  // Metadata
  sync_metadata: JSON.stringify({
    ...bestEvent,
    consolidated_from: groupEvents.length
  })
};

await db.insert('reservations', newReservation);
```

### 13.5 Lo que NO Debes Cambiar

**Crítico:** La lógica del algoritmo Merge Intervals y la extracción de prefijo UID son el corazón del sistema. Cámbialos con extremo cuidado:

1. **`extractUidPrefix()`:** Solo modifica si Airbnb/Booking cambian su formato de UID
2. **`shouldMergeEvents()`:** Los criterios de identidad son fundamentales
3. **`mergeOverlappingEvents()`:** El algoritmo de fusión es probado y estable

---

## 📎 REFERENCIAS

- **RFC 5545 (iCalendar):** https://datatracker.ietf.org/doc/html/rfc5545
- **LeetCode #56 Merge Intervals:** https://leetcode.com/problems/merge-intervals/
- **Supabase Edge Functions:** https://supabase.com/docs/guides/functions

---

## 📝 HISTORIAL DE VERSIONES DEL SISTEMA

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| v1.0 | Nov 2025 | Versión inicial con detección de consecutivos |
| v2.0 | Dic 2025 | Algoritmo Merge Intervals para solapados |
| v2.1 | Dic 2025 | Inmunidad a eventos contenidos |
| v2.2 | Dic 2025 | Soporte multi-proveedor para prefijos |
| v2.3 | Dic 2025 | Detección robusta de booking_source |
| v2.4 | Dic 2025 | Fix de corrección de sources en updates |
| v2.5 | Dic 2025 | Corrección automática en reconciliación |
| v2.6 | Dic 2025 | Fix de JOINs en queries de frontend |
| v2.7 | Dic 2025 | Regla estricta de prefijo UID |
| v3.0 | Dic 2025 | Map → Array para múltiples fragmentos |
| v3.1 | Dic 2025 | Fix de phantom code (no desplegado) |
| v3.2 | Dic 2025 | Eliminación de sistema dual (cron SQL buggy) |

---

*Documento generado en Enero 2026 para transferencia de conocimiento entre proyectos.*
