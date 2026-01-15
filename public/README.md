# Recursos Estáticos - My Elite Cleaning

Esta carpeta contiene todos los recursos estáticos (imágenes, iconos, logos) de la aplicación.

## 📁 Estructura de Carpetas

```
public/
├── images/          # Imágenes generales de la aplicación
├── icons/           # Iconos, favicons y app icons
└── logos/           # Logos de la marca y variaciones
```

---

## 🖼️ `/images/` - Imágenes Generales

Contiene imágenes utilizadas en la interfaz de usuario.

### Subcarpetas Recomendadas

```
images/
├── placeholders/    # Imágenes placeholder para estados vacíos
├── backgrounds/     # Fondos para secciones
├── illustrations/   # Ilustraciones decorativas
└── avatars/         # Avatares por defecto
```

### Convenciones de Nombres

- **Formato:** kebab-case
- **Descriptivos:** `empty-state-cleanings.png`
- **Incluir dimensiones si es relevante:** `hero-background-1920x1080.jpg`

### Formatos Recomendados

- **Fotos:** WebP (fallback: JPG)
- **Ilustraciones con transparencia:** PNG o SVG
- **Iconos decorativos:** SVG

### Ejemplos

```
empty-state-cleanings.svg
property-placeholder.png
cleaning-checklist-illustration.svg
```

---

## 🎨 `/icons/` - Iconos y Favicons

Contiene todos los iconos de la aplicación, incluyendo favicons y app icons para PWA.

### Archivos Requeridos

#### Favicons (Web)
```
favicon.ico           # 32x32, 16x16 (multi-size ICO)
favicon-16x16.png
favicon-32x32.png
```

#### Apple Touch Icons (iOS)
```
apple-touch-icon.png  # 180x180
```

#### Android/PWA Icons
```
icon-192.png          # 192x192
icon-512.png          # 512x512
icon-maskable-192.png # 192x192 (con safe zone)
icon-maskable-512.png # 512x512 (con safe zone)
```

#### Otros
```
safari-pinned-tab.svg # Icono monocromático para Safari
tile-icon.png         # 144x144 para Windows tiles
```

### Generación de Iconos

Puedes usar herramientas como:
- [Favicon.io](https://favicon.io/)
- [RealFaviconGenerator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator)

---

## 🏷️ `/logos/` - Logos de la Marca

Contiene todas las variaciones del logo de My Elite Cleaning.

### Archivos Requeridos

```
logo-full.svg         # Logo completo (texto + icono)
logo-icon.svg         # Solo el icono
logo-horizontal.svg   # Versión horizontal
logo-vertical.svg     # Versión vertical (si aplica)
logo-white.svg        # Versión blanca para fondos oscuros
logo-monochrome.svg   # Versión monocromática
```

### Variaciones de Color

```
logos/
├── color/
│   ├── logo-full.svg
│   └── logo-icon.svg
├── white/
│   ├── logo-full-white.svg
│   └── logo-icon-white.svg
└── monochrome/
    ├── logo-full-mono.svg
    └── logo-icon-mono.svg
```

### Uso en el Código

```tsx
import Image from 'next/image';

// Logo principal
<Image 
  src="/logos/logo-full.svg" 
  alt="My Elite Cleaning" 
  width={200} 
  height={50} 
/>

// Logo en navegación (solo icono)
<Image 
  src="/logos/logo-icon.svg" 
  alt="My Elite Cleaning" 
  width={40} 
  height={40} 
/>

// Logo en footer (versión blanca)
<Image 
  src="/logos/logo-white.svg" 
  alt="My Elite Cleaning" 
  width={150} 
  height={40} 
/>
```

---

## 📐 Dimensiones Recomendadas

### Logos
- **Logo completo:** Ancho flexible, altura ~50-60px
- **Logo icono:** 40x40px, 64x64px, 128x128px

### Imágenes de Contenido
- **Placeholders:** 400x300px (4:3)
- **Avatares:** 128x128px, 256x256px
- **Fondos:** 1920x1080px (Full HD)

### Iconos
- **Favicons:** 16x16, 32x32, 48x48
- **App Icons:** 192x192, 512x512
- **Apple Touch:** 180x180

---

## ⚡ Optimización

### Compresión de Imágenes

Usa herramientas como:
- [TinyPNG](https://tinypng.com/) - Para PNG/JPG
- [Squoosh](https://squoosh.app/) - Para WebP
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Para SVG

### Next.js Image Optimization

Siempre usa el componente `<Image>` de Next.js:

```tsx
import Image from 'next/image';

<Image
  src="/images/property-placeholder.png"
  alt="Propiedad"
  width={400}
  height={300}
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/png;base64,..."
/>
```

### Lazy Loading

Para imágenes fuera del viewport inicial:

```tsx
<Image
  src="/images/background.jpg"
  alt="Fondo"
  width={1920}
  height={1080}
  loading="lazy"
  priority={false}
/>
```

---

## 🔒 Licencias y Derechos

- **Logos de My Elite Cleaning:** Propiedad de My Elite Cleaning. Todos los derechos reservados.
- **Imágenes de stock:** Verificar licencias antes de usar (Unsplash, Pexels, etc.)
- **Iconos:** Lucide Icons (MIT License)

---

## 📝 Checklist de Assets

### Logos
- [ ] Logo completo (color)
- [ ] Logo icono (color)
- [ ] Logo blanco
- [ ] Logo monocromático

### Favicons
- [ ] favicon.ico
- [ ] favicon-16x16.png
- [ ] favicon-32x32.png
- [ ] apple-touch-icon.png
- [ ] icon-192.png
- [ ] icon-512.png

### Imágenes
- [ ] Placeholder de propiedad
- [ ] Empty state para limpiezas
- [ ] Empty state para propiedades
- [ ] Avatar por defecto
- [ ] Ilustración de checklist

---

## 🔗 Referencias

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev - Image Optimization](https://web.dev/fast/#optimize-your-images)
- [PWA Icons Guide](https://web.dev/add-manifest/)

---

**Última actualización:** 9 de Enero de 2026
