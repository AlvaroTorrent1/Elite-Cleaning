# Guía Rápida de Diseño - My Elite Cleaning

**Fecha:** 9 de Enero de 2026  
**Referencia:** [myelitecleaning.com](https://myelitecleaning.com/)

---

## 🎨 Paleta de Colores Principal

### Uso Rápido en Tailwind

```tsx
// Botón principal (rosa malva)
<button className="bg-[#D4A5B3] hover:bg-[#B8899A] text-white">
  Acción Principal
</button>

// Botón secundario (lila)
<button className="bg-[#8B7BA8] hover:bg-[#6F5F8C] text-white">
  Acción Secundaria
</button>

// Estado: Completada
<span className="bg-green-500 text-white">Completada</span>

// Estado: Pendiente
<span className="bg-amber-500 text-white">Pendiente</span>

// Estado: En Curso (lila)
<span className="bg-[#8B7BA8] text-white">En Curso</span>

// Estado: Asignada (rosa)
<span className="bg-[#D4A5B3] text-white">Asignada</span>

// Estado: Error/Daño
<span className="bg-red-500 text-white">Daño Reportado</span>
```

### Colores Hex

| Nombre | Hex | Uso |
|--------|-----|-----|
| **Primary Rose** | `#D4A5B3` | Botones principales, headers, elementos destacados |
| **Rose Dark** | `#B8899A` | Hover states del rosa |
| **Rose Light** | `#E8D4DC` | Fondos suaves, secciones |
| **Secondary Purple** | `#8B7BA8` | Detalles, iconos, elementos secundarios |
| **Purple Dark** | `#6F5F8C` | Hover states del lila |
| **Success Green** | `#10B981` | Limpiezas completadas, confirmaciones |
| **Warning Amber** | `#F59E0B` | Alertas, limpiezas urgentes |
| **Error Red** | `#EF4444` | Errores, reportes de daños |
| **Background** | `#FFFFFF` | Fondo blanco principal |
| **Surface** | `#FAFAFA` | Tarjetas, secciones |
| **Text Primary** | `#2D2D2D` | Texto principal |
| **Text Secondary** | `#6B7280` | Texto secundario |
| **Border** | `#E5E7EB` | Bordes y separadores |

---

## 📝 Tipografía

**Fuente:** Inter (sans-serif)

```tsx
// Título de página
<h1 className="text-4xl font-bold text-gray-900">Título</h1>

// Título de sección
<h2 className="text-3xl font-semibold text-gray-900">Sección</h2>

// Título de tarjeta
<h3 className="text-xl font-semibold text-gray-900">Tarjeta</h3>

// Texto normal
<p className="text-base text-gray-700">Contenido</p>

// Texto secundario
<p className="text-sm text-gray-600">Información adicional</p>

// Caption/metadata
<span className="text-xs text-gray-500">Hace 2 horas</span>
```

---

## 🧩 Componentes Comunes

### Botones

```tsx
// Primary (Rosa malva)
<button className="px-4 py-2.5 bg-[#D4A5B3] hover:bg-[#B8899A] text-white font-semibold rounded-lg transition-colors">
  Guardar
</button>

// Secondary (Lila)
<button className="px-4 py-2.5 bg-[#8B7BA8] hover:bg-[#6F5F8C] text-white font-semibold rounded-lg transition-colors">
  Ver Detalles
</button>

// Outline (Rosa)
<button className="px-4 py-2.5 border-2 border-[#D4A5B3] text-[#D4A5B3] hover:bg-[#E8D4DC] font-semibold rounded-lg transition-colors">
  Cancelar
</button>

// Success
<button className="px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg">
  Completar
</button>

// Danger
<button className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg">
  Eliminar
</button>
```

### Tarjetas

```tsx
<div className="bg-white border border-gray-200 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
  <h3 className="text-xl font-semibold text-gray-900 mb-2">Título</h3>
  <p className="text-gray-600">Contenido de la tarjeta</p>
</div>
```

### Badges de Estado

```tsx
// Pendiente
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-amber-100 text-amber-800">
  Pendiente
</span>

// Asignada (Rosa)
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-[#E8D4DC] text-[#B8899A]">
  Asignada
</span>

// En Curso (Lila)
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-[#A89DC4]/20 text-[#6F5F8C]">
  En Curso
</span>

// Completada
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-green-100 text-green-800">
  Completada
</span>

// Cancelada
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase bg-gray-100 text-gray-800">
  Cancelada
</span>
```

### Inputs

```tsx
<input 
  type="text"
  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4A5B3] focus:border-[#D4A5B3] outline-none transition-all"
  placeholder="Introduce texto..."
/>
```

### Iconos (Lucide React)

```tsx
import { Home, Calendar, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

<Home className="w-5 h-5 text-gray-700" />
<Calendar className="w-5 h-5 text-[#D4A5B3]" />
<CheckCircle className="w-5 h-5 text-green-500" />
<AlertTriangle className="w-5 h-5 text-amber-500" />
<XCircle className="w-5 h-5 text-red-500" />
```

---

## 📐 Espaciado

```tsx
// Padding de tarjeta
<div className="p-6">...</div>

// Margen entre elementos
<div className="space-y-4">
  <div>Elemento 1</div>
  <div>Elemento 2</div>
</div>

// Gap en grid
<div className="grid grid-cols-3 gap-4">...</div>

// Separación de secciones
<section className="mb-8">...</section>
```

---

## 📱 Responsive

```tsx
// Columnas responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 1 columna en móvil, 2 en tablet, 3 en desktop */}
</div>

// Padding responsive
<div className="p-4 md:p-6 lg:p-8">
  {/* Padding crece en pantallas más grandes */}
</div>

// Texto responsive
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  {/* Tamaño crece en pantallas más grandes */}
</h1>

// Ocultar en móvil
<div className="hidden md:block">
  {/* Solo visible en tablet y desktop */}
</div>

// Solo en móvil
<div className="block md:hidden">
  {/* Solo visible en móvil */}
</div>
```

---

## 🎯 Estados de Limpieza

### Colores por Estado

```typescript
const statusColors = {
  pending: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badge: 'bg-amber-500'
  },
  assigned: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    badge: 'bg-blue-500'
  },
  in_progress: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-200',
    badge: 'bg-purple-500'
  },
  completed: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    badge: 'bg-green-500'
  },
  cancelled: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-200',
    badge: 'bg-gray-500'
  }
};
```

### Uso en Componentes

```tsx
interface CleaningCardProps {
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
}

function CleaningCard({ status }: CleaningCardProps) {
  const colors = statusColors[status];
  
  return (
    <div className={`border-l-4 ${colors.border} bg-white p-4 rounded-lg`}>
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium uppercase ${colors.bg} ${colors.text}`}>
        {status}
      </span>
    </div>
  );
}
```

---

## 📁 Estructura de Assets

```
public/
├── images/
│   ├── placeholders/
│   ├── backgrounds/
│   └── illustrations/
├── icons/
│   ├── favicon.ico
│   ├── icon-192.png
│   └── icon-512.png
└── logos/
    ├── logo-full.svg
    ├── logo-icon.svg
    └── logo-white.svg
```

---

## 🔗 Documentación Completa

- **Sistema de Diseño Completo:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **PRD con Paleta:** [PRD.md](./PRD.md) (Sección 2.2)
- **README del Proyecto:** [elite-cleaning/README.md](./elite-cleaning/README.md)
- **Assets Públicos:** [public/README.md](./public/README.md)
- **Design Tokens CSS:** [src/styles/design-tokens.css](./src/styles/design-tokens.css)

---

## ✅ Checklist de Implementación

### Colores
- [x] Paleta definida en PRD
- [x] Variables CSS en design-tokens.css
- [x] Integración con Tailwind en globals.css
- [x] Colores de estado documentados

### Tipografía
- [x] Fuente Inter definida
- [x] Jerarquía de tamaños documentada
- [x] Estilos base en globals.css

### Componentes
- [x] Botones documentados
- [x] Tarjetas documentadas
- [x] Badges documentados
- [x] Inputs documentados
- [x] Iconos (Lucide) especificados

### Assets
- [x] Carpeta public/ creada
- [x] Subcarpetas (images, icons, logos) creadas
- [x] README.md en public/
- [x] .gitkeep en subcarpetas

### Documentación
- [x] DESIGN_SYSTEM.md completo
- [x] DESIGN_GUIDE_SUMMARY.md (este archivo)
- [x] PRD actualizado con sección de diseño
- [x] README del proyecto actualizado

---

**Próximos Pasos:**

1. Obtener logos oficiales de My Elite Cleaning en formato SVG
2. Generar favicons y app icons para PWA
3. Crear componentes reutilizables en `src/components/ui/` usando shadcn/ui
4. Implementar tema personalizado en `tailwind.config.ts`

---

**Contacto del Proyecto:**
- Web: [myelitecleaning.com](https://myelitecleaning.com/)
- Email: info@myelitecleaning.com
