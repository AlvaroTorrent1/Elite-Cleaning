# Sistema de Diseño - My Elite Cleaning

Guía completa del sistema de diseño basado en la identidad corporativa de [My Elite Cleaning](https://myelitecleaning.com/).

---

## 🎨 Paleta de Colores

### Colores Principales

#### Rosa Malva Corporativo (Primary)
```
#D4A5B3 - Primary Rose
#B8899A - Rose Dark
#E8D4DC - Rose Light
```
**Uso:** Botones principales, headers, navegación, elementos destacados. Color corporativo principal de My Elite Cleaning.

#### Lila/Púrpura (Secondary)
```
#8B7BA8 - Secondary Purple
#6F5F8C - Purple Dark
#A89DC4 - Purple Light
```
**Uso:** Detalles, iconos, elementos secundarios, acentos visuales.

#### Verde Éxito (Success)
```
#10B981 - Success
#059669 - Success Dark
```
**Uso:** Confirmaciones, limpiezas completadas, mensajes de éxito.

### Colores de Estado

| Estado | Color | Hex | Uso |
|--------|-------|-----|-----|
| **Pendiente** | Ámbar | `#F59E0B` | Limpiezas sin asignar |
| **Asignada** | Rosa | `#D4A5B3` | Limpiezas asignadas a limpiadora |
| **En Curso** | Lila | `#8B7BA8` | Limpieza activa |
| **Completada** | Verde | `#10B981` | Limpieza finalizada |
| **Cancelada** | Gris | `#9CA3AF` | Limpieza cancelada |
| **Error/Daño** | Rojo | `#EF4444` | Reportes de daños |

### Colores Neutrales

```
#FFFFFF - Background (Fondo blanco principal)
#FAFAFA - Surface (Tarjetas, secciones)
#F5F5F5 - Surface Alt (Fondos alternativos)

#2D2D2D - Text Primary (Texto principal)
#6B7280 - Text Secondary (Texto secundario)
#9CA3AF - Text Muted (Placeholders)

#E5E7EB - Border (Bordes sutiles)
#D1D5DB - Divider (Separadores)
```

---

## 📝 Tipografía

### Fuente Principal: Inter

**Familia:** Inter (sans-serif)  
**Fallback:** -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif

### Jerarquía de Tamaños

| Nivel | Tamaño | Peso | Uso |
|-------|--------|------|-----|
| **H1** | 36px (2.25rem) | 700 | Títulos de página principales |
| **H2** | 30px (1.875rem) | 600 | Secciones principales |
| **H3** | 24px (1.5rem) | 600 | Subsecciones |
| **H4** | 20px (1.25rem) | 600 | Títulos de tarjetas |
| **Body Large** | 18px (1.125rem) | 400 | Texto destacado |
| **Body** | 16px (1rem) | 400 | Texto estándar |
| **Small** | 14px (0.875rem) | 400 | Texto secundario |
| **Caption** | 12px (0.75rem) | 400 | Metadatos, timestamps |

### Pesos de Fuente

- **Normal:** 400 - Texto de cuerpo
- **Medium:** 500 - Énfasis sutil
- **Semibold:** 600 - Títulos, botones
- **Bold:** 700 - Títulos principales

### Altura de Línea

- **Títulos:** 1.2 (tight)
- **Cuerpo:** 1.5 (normal)
- **Párrafos largos:** 1.7 (relaxed)

---

## 🧩 Componentes

### Botones

#### Primary Button
```tsx
<button className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors">
  Acción Principal
</button>
```
- **Fondo:** `#1E40AF`
- **Hover:** `#1E3A8A`
- **Texto:** Blanco, semibold
- **Padding:** 10px 16px
- **Radius:** 8px

#### Secondary Button
```tsx
<button className="border-2 border-blue-700 text-blue-700 hover:bg-blue-50 font-semibold py-2.5 px-4 rounded-lg transition-colors">
  Acción Secundaria
</button>
```
- **Borde:** 2px `#1E40AF`
- **Texto:** `#1E40AF`
- **Hover:** Fondo `#F0F9FF`

#### Success Button
```tsx
<button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg">
  Completar
</button>
```

#### Danger Button
```tsx
<button className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg">
  Eliminar
</button>
```

#### Ghost Button
```tsx
<button className="text-gray-700 hover:bg-gray-100 font-medium py-2 px-3 rounded-lg transition-colors">
  Cancelar
</button>
```

### Tarjetas (Cards)

```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
  {/* Contenido */}
</div>
```

**Características:**
- Fondo blanco
- Borde sutil (`#E5E7EB`)
- Sombra media (`shadow-md`)
- Hover: Elevación de sombra (`shadow-lg`)
- Padding: 24px
- Radius: 8px

### Badges/Pills

```tsx
{/* Estado: Pendiente */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-amber-100 text-amber-800">
  Pendiente
</span>

{/* Estado: Completada */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-green-100 text-green-800">
  Completada
</span>

{/* Estado: En Curso */}
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-purple-100 text-purple-800">
  En Curso
</span>
```

**Características:**
- Redondeado completo (`rounded-full`)
- Texto en mayúsculas, 12px
- Padding: 4px 12px
- Fondo claro + texto oscuro del mismo color

### Inputs

```tsx
<input 
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
  placeholder="Introduce texto..."
/>
```

**Características:**
- Altura: 40px
- Borde: 1px `#E5E7EB`
- Focus: Ring azul + borde azul
- Radius: 8px
- Placeholder: `#9CA3AF`

### Iconos

**Librería:** [Lucide React](https://lucide.dev/)

```tsx
import { Home, Calendar, CheckCircle } from 'lucide-react';

<Home className="w-5 h-5 text-gray-700" />
<Calendar className="w-5 h-5 text-blue-700" />
<CheckCircle className="w-5 h-5 text-green-500" />
```

**Características:**
- Tamaño base: 20px (1.25rem)
- Stroke width: 2px
- Color: Hereda del contexto o específico según uso

---

## 📐 Espaciado

Sistema basado en múltiplos de 4px:

| Token | Valor | Uso |
|-------|-------|-----|
| `xs` | 4px | Espaciado mínimo entre elementos muy cercanos |
| `sm` | 8px | Espaciado pequeño, padding interno de badges |
| `md` | 16px | Espaciado estándar entre elementos |
| `lg` | 24px | Espaciado grande, padding de tarjetas |
| `xl` | 32px | Espaciado extra grande entre secciones |
| `2xl` | 48px | Separación de bloques principales |
| `3xl` | 64px | Espaciado máximo, secciones de landing |

---

## 🔲 Bordes y Sombras

### Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `sm` | 6px | Botones pequeños, badges cuadrados |
| `md` | 8px | Tarjetas, inputs, botones estándar |
| `lg` | 12px | Modales, diálogos |
| `xl` | 16px | Elementos destacados |
| `full` | 9999px | Avatares, badges circulares |

### Sombras

```css
/* Sombra suave */
shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05)

/* Sombra media (default para tarjetas) */
shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1)

/* Sombra grande (hover en tarjetas) */
shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1)

/* Sombra extra grande (modales) */
shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1)
```

---

## 🎬 Animaciones y Transiciones

### Duraciones

```css
--transition-fast: 150ms   /* Hover en botones */
--transition-base: 200ms   /* Transiciones estándar */
--transition-slow: 300ms   /* Modales, overlays */
```

### Easing

```css
cubic-bezier(0.4, 0, 0.2, 1)  /* Ease-in-out suave */
```

### Ejemplos

```tsx
{/* Fade in */}
<div className="animate-in fade-in duration-200">
  Contenido
</div>

{/* Slide in from bottom */}
<div className="animate-in slide-in-from-bottom-4 duration-300">
  Modal
</div>
```

---

## 📱 Responsive Design

### Breakpoints

```css
sm: 640px   /* Móviles grandes */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Pantallas grandes */
```

### Mobile First

Todos los estilos se escriben primero para móvil y luego se adaptan hacia arriba:

```tsx
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding crece en pantallas más grandes */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 columna en móvil, 2 en tablet, 3 en desktop */}
</div>
```

---

## ♿ Accesibilidad

### Contraste

Todos los pares de colores cumplen con **WCAG AA** (mínimo 4.5:1 para texto normal):

✅ Texto oscuro sobre fondo claro: 12.6:1  
✅ Azul primary sobre blanco: 8.6:1  
✅ Verde success sobre blanco: 3.4:1 (solo para textos grandes)

### Navegación por Teclado

- Todos los elementos interactivos deben ser accesibles con `Tab`
- Focus visible con ring azul: `focus:ring-2 focus:ring-blue-500`
- Orden lógico de tabulación

### ARIA Labels

```tsx
<button aria-label="Cerrar modal">
  <X className="w-5 h-5" />
</button>

<input 
  type="text"
  aria-describedby="email-help"
  aria-invalid={hasError}
/>
```

---

## 🖼️ Imágenes y Media

### Estructura de Carpetas

```
public/
├── images/
│   ├── placeholders/     # Imágenes placeholder
│   ├── backgrounds/      # Fondos
│   └── illustrations/    # Ilustraciones
├── icons/
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
└── logos/
    ├── logo-full.svg     # Logo completo
    ├── logo-icon.svg     # Icono solo
    └── logo-white.svg    # Versión blanca
```

### Optimización

- Formato: WebP para fotos, SVG para logos/iconos
- Lazy loading: `loading="lazy"` en imágenes
- Next.js Image: Usar `<Image>` de `next/image` siempre que sea posible

---

## 🎯 Principios de Diseño

### 1. Claridad sobre Creatividad
La funcionalidad y usabilidad tienen prioridad sobre la estética pura. Cada elemento debe tener un propósito claro.

### 2. Mobile First
Diseñamos primero para dispositivos móviles (limpiadoras en campo) y luego escalamos hacia arriba.

### 3. Consistencia
Usamos componentes reutilizables de shadcn/ui para mantener coherencia visual en toda la aplicación.

### 4. Feedback Visual
Cada acción del usuario debe tener una respuesta visual clara (loading states, success messages, error alerts).

### 5. Jerarquía Visual
Usamos tamaño, color y espaciado estratégicamente para guiar la atención del usuario.

### 6. Accesibilidad
Diseñamos para todos, incluyendo usuarios con discapacidades visuales o motoras.

---

## 📚 Recursos

- **Paleta de Colores:** [Coolors Palette](https://coolors.co/)
- **Iconos:** [Lucide Icons](https://lucide.dev/)
- **Componentes:** [shadcn/ui](https://ui.shadcn.com/)
- **Tipografía:** [Google Fonts - Inter](https://fonts.google.com/specimen/Inter)
- **Referencia:** [My Elite Cleaning](https://myelitecleaning.com/)

---

**Última actualización:** 9 de Enero de 2026  
**Mantenido por:** Equipo de Desarrollo My Elite Cleaning
