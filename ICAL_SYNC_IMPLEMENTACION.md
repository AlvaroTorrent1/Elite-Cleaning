# Sistema de Sincronización iCal - Elite Cleaning

> **Fecha:** Enero 2026  
> **Estado:** Implementado  
> **Basado en:** Informe técnico `TO-ASK/informe_ical.md`

---

## Resumen

Sistema completo para sincronizar reservas de **Airbnb**, **Booking.com** y otras plataformas vía iCal.
Genera automáticamente limpiezas en las fechas de check-out.

### Características Principales

- **Sincronización automática** cada 15 minutos (Vercel Cron)
- **Sincronización manual** desde el dashboard del PM
- **Algoritmo Merge Intervals** para resolver la fragmentación de Airbnb
- **Detección de limpiezas urgentes** (check-out y check-in mismo día)
- **Logos de plataforma** visibles en las limpiezas
- **PM puede cancelar** limpiezas generadas por iCal

---

## Archivos Creados

### Base de Datos
```
supabase/migrations/004_ical_sync_system.sql
```
- Tabla `ical_sync_configs` - Configuración de calendarios por propiedad
- Nuevas columnas en `cleanings` para tracking de iCal
- Funciones SQL para gestionar sincronización
- Políticas RLS para acceso de PM

### Módulos Core (TypeScript)
```
src/lib/ical/
├── types.ts     # Interfaces y tipos
├── parser.ts    # Parser de iCal (RFC 5545)
├── merger.ts    # Algoritmo Merge Intervals
├── sync.ts      # Orquestador de sincronización
└── index.ts     # Exports
```

### API
```
src/app/api/ical-sync/route.ts
```
- `POST` - Sync manual para una propiedad (autenticado)
- `GET` - Sync automático de todos los calendarios (Vercel Cron)

### Configuración Vercel
```
vercel.json
```
- Cron job cada 15 minutos

### UI del Property Manager
```
src/app/pm/calendario/page.tsx
src/components/pm/ical/
├── ical-property-list.tsx    # Lista de propiedades
├── ical-property-card.tsx    # Tarjeta con estado de sync
├── ical-config-modal.tsx     # Modal para configurar URLs
├── ical-sync-summary.tsx     # Estadísticas
└── index.ts
```

---

## Cómo Funciona

### Flujo de Sincronización

```
1. PM configura URLs de iCal en /pm/calendario
   └─> Se guardan en ical_sync_configs

2. Cada 15 min, Vercel Cron llama a GET /api/ical-sync
   └─> syncAllConfigs() busca configs que necesitan sync

3. Para cada config:
   a) fetchIcalData(url) - Descarga el .ics
   b) parseIcalData(text) - Extrae eventos VEVENT
   c) mergeOverlappingEvents() - Fusiona fragmentos de Airbnb
   d) syncEventsToDatabase() - Crea/actualiza limpiezas

4. Se genera una limpieza por cada check-out detectado
   └─> Si hay check-in el mismo día → is_urgent = true
```

### Algoritmo Merge Intervals

Resuelve el problema de Airbnb que envía reservas fragmentadas:

```
ENTRADA (fragmentos de Airbnb):
  UID: abc123-AAA  Dec 04-05
  UID: abc123-BBB  Dec 05-06
  UID: abc123-CCC  Dec 06-09

DETECCIÓN:
  Todos comparten prefijo "abc123" → misma reserva

SALIDA (fusionado):
  Una sola reserva: Dec 04-09
  Una limpieza generada para: Dec 09 (check-out)
```

---

## Uso desde el Dashboard PM

### 1. Acceder a Calendario
Navegar a `/pm/calendario` desde el menú

### 2. Configurar Calendarios
1. Clic en "Configurar" en una propiedad
2. Añadir URL de Airbnb y/o Booking
3. Guardar

### 3. Sincronizar Manualmente
- Clic en "Sincronizar" en cualquier propiedad
- Esperar resultado

### 4. Ver Limpiezas Generadas
- Las limpiezas aparecen en `/pm/limpiezas`
- Muestran icono de la plataforma (Airbnb/Booking)
- Marcadas como "urgente" si aplica

---

## Variables de Entorno

Añadir a `.env.local` para producción:

```env
# Secreto para autenticar Vercel Cron (opcional pero recomendado)
CRON_SECRET=tu_secreto_aleatorio_aqui
```

---

## Aplicar Migración

Ejecutar en Supabase SQL Editor:

```sql
-- Copiar contenido de:
-- supabase/migrations/004_ical_sync_system.sql
```

---

## Próximos Pasos Recomendados

1. **Ejecutar migración SQL** en Supabase
2. **Probar con URL real** de Airbnb/Booking
3. **Verificar cron** en Vercel después del deploy
4. **Monitorear logs** en Vercel para verificar sincronización

---

## Solución de Problemas

### Error "Invalid iCal format"
- Verificar que la URL es correcta
- Algunas URLs caducan, regenerar en la plataforma

### Limpiezas duplicadas
- El algoritmo previene duplicados por UID prefix
- Si persiste, revisar logs de sync

### Cron no ejecuta
- Verificar `vercel.json` está en raíz del proyecto
- Verificar proyecto está en plan Pro de Vercel (crons requieren Pro)
- En desarrollo, ejecutar manualmente: `GET /api/ical-sync`

---

*Implementación basada en sistema probado en producción (v3.2)*
