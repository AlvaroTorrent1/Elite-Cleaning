# PRD - Plataforma de Gestión de Limpiezas MyEliteCleaning

**Versión:** 1.0  
**Fecha:** 8 de Enero de 2026  
**Estado:** En Revisión  

---

## 1. Resumen Ejecutivo

### 1.1 Visión del Producto
Plataforma web privada para la gestión integral de equipos de limpieza de propiedades de alquiler turístico en Málaga, con enfoque en automatización operativa, reducción de errores humanos y visibilidad en tiempo real.

### 1.2 Objetivos Principales
- Sincronización automática de reservas desde Airbnb/Booking vía iCal
- Gestión de equipos de limpieza con agendas diarias y checklists digitales
- Visibilidad operativa para property managers
- Sistema de reportes de daños y objetos perdidos con evidencia fotográfica

### 1.3 Usuarios Objetivo
| Rol | Cantidad Estimada | Método de Acceso |
|-----|-------------------|------------------|
| Administrador | 1 | Email/Password |
| Limpiadoras | ~60 | Google OAuth |
| Property Managers | ~15+ | Google OAuth |

---

## 2. Stack Técnico

### 2.1 Decisiones de Arquitectura

| Capa | Tecnología | Justificación |
|------|------------|---------------|
| **Frontend** | Next.js 14+ (App Router) | SSR, integración perfecta con Supabase, fácil de integrar con landing existente vía ruta `/app` |
| **UI Framework** | shadcn/ui + Tailwind CSS | Componentes accesibles, modernos, altamente personalizables |
| **Backend/DB** | Supabase | Auth, Database (PostgreSQL), Storage, Realtime, Edge Functions |
| **Estado Cliente** | TanStack Query v5 | Caché, sincronización, optimistic updates |
| **iCal Parsing** | node-ical | Librería madura para parsear archivos .ics |
| **Imágenes** | Supabase Storage | CDN integrado, económico, RLS compatible |
| **PWA** | next-pwa | Para uso móvil de limpiadoras |
| **Despliegue** | Vercel | Integración nativa con Next.js |

### 2.2 Identidad Visual y Diseño

#### Paleta de Colores

Basada en la identidad corporativa de [My Elite Cleaning](https://myelitecleaning.com/), la paleta refleja profesionalismo, limpieza y elegancia con tonos suaves y femeninos.

**Colores Principales:**
- **Primary Rose:** `#D4A5B3` - Rosa malva corporativo para botones principales, headers y elementos destacados
- **Primary Dark:** `#B8899A` - Rosa oscuro para hover states y énfasis
- **Primary Light:** `#E8D4DC` - Rosa claro para fondos suaves y secciones

**Colores Secundarios:**
- **Secondary Purple:** `#8B7BA8` - Lila/púrpura para detalles, iconos y elementos secundarios
- **Purple Dark:** `#6F5F8C` - Lila oscuro para hover y contraste
- **Success Green:** `#10B981` - Estados completados y confirmaciones

**Colores de Estado:**
- **Pending:** `#F59E0B` (Ámbar) - Limpiezas pendientes
- **Assigned:** `#D4A5B3` (Rosa) - Limpiezas asignadas
- **In Progress:** `#8B7BA8` (Lila) - Limpieza activa
- **Completed:** `#10B981` (Verde) - Limpieza finalizada
- **Cancelled:** `#9CA3AF` (Gris) - Limpieza cancelada
- **Error/Damage:** `#EF4444` (Rojo) - Reportes de daños

**Neutrales:**
- **Background:** `#FFFFFF` - Fondo blanco principal
- **Surface:** `#FAFAFA` - Fondos de tarjetas y secciones
- **Surface Alt:** `#F5F5F5` - Fondos alternativos
- **Text Primary:** `#2D2D2D` - Texto principal oscuro
- **Text Secondary:** `#6B7280` - Texto secundario
- **Border:** `#E5E7EB` - Bordes sutiles

#### Tipografía

**Fuente Principal:** Inter (sans-serif)
- **Headings:** Font weight 600-700
- **Body:** Font weight 400-500
- **Captions:** Font weight 400, size 0.875rem

**Jerarquía de Tamaños:**
- H1: 2.25rem (36px) - Títulos de página
- H2: 1.875rem (30px) - Secciones principales
- H3: 1.5rem (24px) - Subsecciones
- Body: 1rem (16px) - Texto estándar
- Small: 0.875rem (14px) - Texto secundario
- Caption: 0.75rem (12px) - Metadatos, timestamps

#### Componentes UI

**Botones:**
- **Primary:** Fondo rosa (`#D4A5B3`), texto blanco, hover más oscuro (`#B8899A`)
- **Secondary:** Borde rosa, texto rosa, hover con fondo rosa claro
- **Accent:** Fondo lila (`#8B7BA8`), texto blanco, hover más oscuro
- **Success:** Fondo verde (`#10B981`), texto blanco
- **Danger:** Fondo rojo (`#EF4444`), texto blanco
- **Ghost:** Sin fondo, texto gris, hover con fondo sutil
- **Radius:** 0.5rem (8px)
- **Padding:** 0.5rem 1rem (vertical horizontal)

**Tarjetas (Cards):**
- Fondo blanco con sombra suave (`shadow-md`)
- Borde sutil (`#E5E7EB`)
- Radio de borde: 0.5rem (8px)
- Padding interno: 1.5rem (24px)
- Hover: Elevación de sombra

**Badges/Pills:**
- Pequeños, redondeados completamente
- Colores según estado
- Texto en mayúsculas, tamaño 0.75rem
- Padding: 0.25rem 0.75rem

**Inputs:**
- Borde gris (`#E5E7EB`)
- Fondo blanco
- Focus: Borde azul con ring sutil
- Altura: 2.5rem (40px)
- Radius: 0.375rem (6px)

**Iconografía:**
- Librería: Lucide React
- Tamaño base: 20px (1.25rem)
- Stroke width: 2px
- Color: Hereda del texto padre

#### Espaciado

Sistema de espaciado basado en múltiplos de 4px:
- **xs:** 4px - Espaciado mínimo
- **sm:** 8px - Espaciado pequeño
- **md:** 16px - Espaciado estándar
- **lg:** 24px - Espaciado grande
- **xl:** 32px - Espaciado extra grande
- **2xl:** 48px - Separación de secciones
- **3xl:** 64px - Espaciado máximo

#### Principios de Diseño

1. **Mobile First:** Diseño responsive desde dispositivos móviles
2. **Claridad sobre Creatividad:** Interfaz limpia y funcional
3. **Accesibilidad:** Contraste WCAG AA mínimo, navegación por teclado
4. **Feedback Visual:** Estados claros (loading, success, error)
5. **Consistencia:** Componentes reutilizables de shadcn/ui
6. **Jerarquía Visual:** Uso estratégico de tamaño, color y espaciado

### 2.3 Integración con Landing Existente

**Análisis de la Landing Actual (myelitecleaning.com):**
- Stack detectado: **WordPress + WooCommerce** (indicadores: carrito de compras, estructura de menú típica de WP)
- Hosting actual: Por determinar (migración a Vercel planificada)

**Estrategia de Integración:**
```
myelitecleaning.com/          → WordPress (landing actual)
myelitecleaning.com/app/      → Next.js App (nueva plataforma)
```

**Decisión:** ✅ **RUTA** (`/app`)
- El cliente nos proporcionará acceso al dominio
- Desarrollamos la app de forma independiente
- Conectaremos con el dominio más adelante
- Posible migración del hosting a nuestra gestión

---

## 3. Perfiles de Usuario y Funcionalidades

### 3.1 Administrador (Empresa de Limpieza)

**Acceso:** Email/Password (cuenta única)

**Funcionalidades:**
- [ ] Dashboard con visión global de todas las operaciones
- [ ] Gestión de usuarios (CRUD de limpiadoras y property managers)
- [ ] Definición de checklists por tipo de servicio
- [ ] Catálogo de items dañables con precios (para reembolsos)
- [ ] Supervisión del estado de todas las limpiezas
- [ ] Aprobación de reordenaciones de tareas
- [ ] Recepción de alertas:
  - Conflictos de agenda
  - Limpiezas urgentes (check-out/check-in mismo día)
  - Reportes de daños
  - Objetos perdidos
- [ ] Gestión de URLs iCal por propiedad

### 3.2 Limpiadoras

**Acceso:** Google OAuth

**Funcionalidades:**
- [ ] Agenda diaria con limpiezas asignadas
- [ ] Información de cada propiedad:
  - Dirección + enlace a Google Maps
  - Instrucciones de acceso
  - Detalles relevantes
- [ ] **Sección Checklist:**
  - Lista de tareas por tipo de limpieza
  - Subida de fotos obligatorias (desde cámara o galería)
  - Estimado: ~50 fotos por limpieza
- [ ] **Sección Objetos Perdidos:**
  - Reporte con descripción
  - Subida de imagen
  - Notificación automática a Admin + PM
- [ ] **Sección Daños:**
  - Selección de item del catálogo
  - Precio estimado (prellenado desde catálogo)
  - Subida de imagen
  - Notificación automática a Admin + PM
- [ ] Cambio de estado: `pendiente` → `en_curso` → `finalizada`
- [ ] Solicitud de reordenación (requiere aprobación)
- [ ] Campo de notas/comentarios

**Restricciones:**
- ❌ No pueden rechazar limpiezas
- ❌ No pueden modificar orden unilateralmente

### 3.3 Property Manager (Cliente)

**Acceso:** Google OAuth (auto-registro con aprobación)

**Registro:**
- Los PM se auto-registran en la plataforma
- El administrador debe aprobar la cuenta antes de que tengan acceso completo
- Una vez aprobados, se les asignan propiedades

**Funcionalidades:**
- [ ] Gestión de propiedades bajo su responsabilidad
- [ ] Visualización del estado de limpiezas
- [ ] Solicitud de servicios de limpieza:
  - Tipo: Repaso, Estándar, Profunda
  - Extras: Kit bebé, ropa de cama, vaciado nevera, etc.
- [ ] Creación de limpiezas manuales (no vinculadas a iCal)
- [ ] Histórico de servicios (últimos 30 días)
- [ ] **Recepción de alertas:**
  - Daños reportados (con imagen y precio estimado)
  - Objetos perdidos (con imagen)
- [ ] Cancelación de limpiezas generadas por iCal (no se cobra)

---

## 4. Casos de Uso Especiales

### Caso 1: Limpieza No Necesaria
**Escenario:** PM cancela limpieza generada automáticamente por iCal.  
**Flujo:**
1. PM accede a la limpieza programada
2. Selecciona "Cancelar limpieza"
3. Sistema marca como cancelada
4. **No se cobra**

### Caso 2: Turista Rechaza Limpieza
**Escenario:** Limpieza necesaria pero turista dice que no.  
**Flujo:**
1. Limpiadora reporta situación
2. Sistema presenta pantalla de firma digital
3. Turista firma en pantalla táctil
4. Se almacena:
   - Firma como imagen (canvas → PNG)
   - Timestamp
   - Texto legal de exoneración
5. **Se cobra la limpieza** (desplazamiento)

**Texto Legal Propuesto:**
```
"Yo, el abajo firmante, declaro que rechazo voluntariamente el servicio 
de limpieza programado para esta propiedad en la fecha indicada. 
Entiendo que este rechazo no exime al gestor del cumplimiento de sus 
obligaciones contractuales y que se aplicará el cargo correspondiente 
por desplazamiento. Málaga, [FECHA] [HORA]"
```

> 📋 **NOTA LEGAL:** La firma táctil tiene validez probatoria en España según el Código Civil (Art. 1225) y la Ley 6/2020 de firma electrónica. Para mayor seguridad jurídica, se recomienda:
> - Almacenar IP y user-agent del dispositivo
> - Timestamp certificado
> - Hash de la imagen de firma

### Caso 3: Daños en Items
**Escenario:** Limpiadora detecta mal uso de lavandería, sábanas, silla de niño, etc.  
**Flujo:**
1. Limpiadora accede a sección "Daños"
2. Selecciona item del catálogo predefinido
3. Sistema muestra precio estimado
4. Limpiadora sube foto como evidencia
5. Alerta automática a Admin + PM con:
   - Imagen
   - Item dañado
   - Precio estimado

### Caso 4: Objetos Perdidos
**Escenario:** Limpiadora encuentra objetos de huéspedes anteriores.  
**Flujo:**
1. Limpiadora accede a sección "Objetos Perdidos"
2. Descripción del objeto
3. Subida de foto
4. Alerta automática a Admin + PM

---

## 5. Gestión de Propiedades

### 5.1 Ficha de Propiedad
```typescript
interface Property {
  id: string;
  name: string;
  address: string;
  gps_coordinates: { lat: number; lng: number };
  access_instructions: string; // Especialmente útil en complejos grandes
  size_sqm: number;
  bedrooms: number;
  bathrooms: number;
  property_manager_id: string;
  ical_urls: {
    airbnb?: string;
    booking?: string;
    other?: string;
  };
  default_cleaning_type: 'repaso' | 'estandar' | 'profunda';
  created_at: Date;
  updated_at: Date;
}
```

### 5.2 Tipos de Limpieza
| Tipo | Descripción | Duración Estimada |
|------|-------------|-------------------|
| Repaso | Limpieza ligera entre huéspedes | 1-2h |
| Estándar | Limpieza completa post check-out | 2-4h |
| Profunda | Limpieza intensiva periódica | 4-6h |

### 5.3 Servicios Extra
- Kit de bebé (cuna, trona)
- Ropa de cama adicional
- Toallas extra
- Vaciado de nevera
- Lavado de ropa de huésped
- Reposición de amenities

---

## 6. Integración iCal

### 6.1 Especificaciones
- **Frecuencia de sincronización:** Cada 15 minutos
- **Plataformas soportadas:** Airbnb, Booking.com
- **Eventos detectados:**
  - Nueva reserva → Genera limpieza automática
  - Cancelación → Cancela limpieza asociada
  - Modificación → Actualiza limpieza (con condiciones)

### 6.2 Lógica de Modificaciones
```
SI modificación de reserva Y limpieza ya asignada:
  SI faltan > 24 horas para la limpieza:
    → Actualizar automáticamente
  SI faltan < 24 horas:
    → Marcar como "conflicto" + alerta a Admin
    → PREGUNTA AL CLIENTE: ¿Cobrar desplazamiento?
```

### 6.3 Detección de Urgencias
```
SI check_out.date === check_in.date (mismo día):
  → Marcar limpieza como "URGENTE"
  → Priorizar en agenda de limpiadora
  → Alerta especial a Admin
```

---

## 7. Sistema de Notificaciones

### 7.1 Canales
- ✅ Notificaciones in-app (push notifications PWA)
- ❌ Email (no requerido inicialmente)
- ❌ WhatsApp (no requerido inicialmente)
- ❌ SMS (no requerido inicialmente)

### 7.2 Tipos de Alertas

| Evento | Destinatarios | Prioridad |
|--------|--------------|-----------|
| Limpieza urgente (mismo día) | Admin, Limpiadora | Alta |
| Conflicto de agenda | Admin | Alta |
| Daño reportado | Admin, PM | Media |
| Objeto perdido | Admin, PM | Media |
| Nueva limpieza asignada | Limpiadora | Normal |
| Limpieza cancelada | Limpiadora | Normal |
| Solicitud de reordenación | Admin | Normal |

---

## 8. Retención de Datos y GDPR

### 8.1 Política de Retención
| Tipo de Dato | Retención | Justificación |
|--------------|-----------|---------------|
| Imágenes de checklist | 30 días | Evidencia operativa |
| Imágenes de daños | 90 días | Reclamaciones |
| Imágenes de objetos perdidos | 30 días | Gestión de devoluciones |
| Firmas digitales | 1 año | Protección legal |
| Histórico de limpiezas | Indefinido (sin imágenes) | Reporting |

### 8.2 Cumplimiento RGPD/LOPD
- [ ] Política de privacidad en español
- [ ] Consentimiento explícito en registro
- [ ] Derecho de acceso, rectificación y supresión
- [ ] Registro de actividades de tratamiento
- [ ] Notificación a AEPD si aplica (>250 empleados o datos sensibles)

**Datos Personales Tratados:**
- Limpiadoras: Nombre, email, teléfono, foto de perfil
- Property Managers: Nombre, email, teléfono
- Huéspedes: ❌ NO se almacenan (solo firma si rechazan limpieza)

### 8.3 Texto de Política de Privacidad (Borrador)
> Se incluirá política completa conforme a RGPD con:
> - Identidad del responsable (My Elite Cleaning)
> - Finalidad del tratamiento
> - Base legal (ejecución de contrato)
> - Destinatarios (no hay cesión a terceros)
> - Plazo de conservación
> - Derechos del interesado
> - Datos de contacto DPO (si aplica)

---

## 9. Modelo de Base de Datos

```sql
-- Usuarios (gestionados por Supabase Auth + tabla profiles)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cleaner', 'property_manager')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Propiedades
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  access_instructions TEXT,
  size_sqm INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_manager_id UUID REFERENCES profiles(id),
  ical_airbnb TEXT,
  ical_booking TEXT,
  ical_other TEXT,
  default_cleaning_type TEXT DEFAULT 'estandar',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tipos de limpieza
CREATE TABLE cleaning_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Servicios extra
CREATE TABLE cleaning_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Catálogo de items dañables
CREATE TABLE damage_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT, -- 'lavanderia', 'mobiliario', 'equipamiento_bebe', etc.
  estimated_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Limpiezas
CREATE TABLE cleanings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  cleaner_id UUID REFERENCES profiles(id),
  cleaning_type_id UUID REFERENCES cleaning_types(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_urgent BOOLEAN DEFAULT false,
  is_manual BOOLEAN DEFAULT false, -- true si fue creada manualmente por PM
  ical_event_uid TEXT, -- referencia al evento iCal original
  guest_rejected BOOLEAN DEFAULT false,
  guest_signature_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extras seleccionados por limpieza
CREATE TABLE cleaning_selected_extras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  extra_id UUID NOT NULL REFERENCES cleaning_extras(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Templates de checklist
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_type_id UUID REFERENCES cleaning_types(id),
  name TEXT NOT NULL,
  items JSONB NOT NULL, -- Array de items del checklist
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Checklist completados
CREATE TABLE cleaning_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  completed_items JSONB NOT NULL, -- Items completados con timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imágenes de limpieza
CREATE TABLE cleaning_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('checklist', 'damage', 'lost_item')),
  image_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reportes de daños
CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id),
  damage_item_id UUID REFERENCES damage_catalog(id),
  custom_description TEXT,
  estimated_cost DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  acknowledged_by_admin BOOLEAN DEFAULT false,
  acknowledged_by_pm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reportes de objetos perdidos
CREATE TABLE lost_item_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  acknowledged_by_admin BOOLEAN DEFAULT false,
  acknowledged_by_pm BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notificaciones
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sincronización iCal (logs)
CREATE TABLE ical_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id),
  platform TEXT NOT NULL, -- 'airbnb', 'booking', 'other'
  sync_status TEXT NOT NULL, -- 'success', 'error'
  events_found INTEGER,
  events_created INTEGER,
  events_updated INTEGER,
  events_cancelled INTEGER,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 10. Planificación del MVP

### Semana 1-2: Fundamentos
- [ ] Setup proyecto Next.js + Supabase
- [ ] Configuración de autenticación (Google OAuth)
- [ ] Schema de base de datos + migraciones
- [ ] RLS policies básicas
- [ ] Layout principal + navegación

### Semana 3-4: Core Features
- [ ] CRUD de propiedades
- [ ] CRUD de tipos de limpieza y extras
- [ ] Panel de administrador básico
- [ ] Panel de property manager básico

### Semana 5-6: MVP Funcional
- [ ] Integración iCal (sincronización básica)
- [ ] Agenda de limpiadoras
- [ ] Checklists digitales con fotos
- [ ] Sistema de alertas in-app

### Semana 7-8: Funcionalidades Avanzadas
- [ ] Reportes de daños
- [ ] Reportes de objetos perdidos
- [ ] Firma digital para rechazo de limpieza
- [ ] Catálogo de items dañables

### Semana 9-10: Polish y Deploy
- [ ] PWA para limpiadoras
- [ ] Optimización de rendimiento
- [ ] Testing con propiedades reales
- [ ] Despliegue en producción

---

## 11. Preguntas Pendientes para el Cliente

> Estas preguntas se documentarán en `/TO-ASK/` para seguimiento.

1. **iCal + Modificaciones:** Si una reserva se modifica muy poco antes de la limpieza (ej: 2 horas antes), ¿cuál es la política exacta de cobro por desplazamiento?

2. **Subdominio vs Ruta:** ¿Hay preferencia entre `app.myelitecleaning.com` o `myelitecleaning.com/app`?

3. **Hosting actual:** ¿Dónde está alojada actualmente la landing de WordPress?

4. **Property Managers:** ¿Se auto-registran o los crea el administrador?

5. **Limpiezas manuales:** ¿Tienen un precio diferente a las generadas por iCal?

6. **Objetos perdidos:** ¿Hay algún proceso de reclamación por parte del huésped que debamos considerar a futuro?

---

## 12. Anexos

### A. Competidores Analizados
| Software | Fortalezas | Debilidades |
|----------|-----------|-------------|
| Breezeway | Líder del mercado, checklists robustos | Costoso ($8-30/propiedad) |
| Turno | Marketplace de limpiadores | Menos enfocado en gestión interna |
| Properly | Checklists visuales excelentes | Sin integración iCal nativa |
| TIDY | AI-powered | Complejo para usuarios no técnicos |

### B. Referencias Técnicas
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [node-ical](https://github.com/jens-maus/node-ical)
- [shadcn/ui](https://ui.shadcn.com)

---

**Documento preparado por:** AI Assistant  
**Revisado por:** [Pendiente]  
**Aprobado por:** [Pendiente]
