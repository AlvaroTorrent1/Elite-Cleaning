# Imágenes de Roles - Login Page

Esta carpeta debe contener las imágenes ilustrativas para cada tipo de usuario en la página de login.

## Imágenes Requeridas

### 1. admin.png / admin.svg
- **Descripción:** Ilustración de administrador/gestor
- **Sugerencia:** Persona con portapapeles, dashboard, o gráficos
- **Dimensiones:** 400x400px
- **Fondo:** Transparente (PNG) o vectorial (SVG)

### 2. cleaner.png / cleaner.svg
- **Descripción:** Ilustración de profesional de limpieza
- **Sugerencia:** Persona con utensilios de limpieza, checklist, o casa limpia
- **Dimensiones:** 400x400px
- **Fondo:** Transparente (PNG) o vectorial (SVG)

### 3. property_manager.png / property_manager.svg
- **Descripción:** Ilustración de gestor de propiedades
- **Sugerencia:** Persona con llaves, propiedades, o apartamentos
- **Dimensiones:** 400x400px
- **Fondo:** Transparente (PNG) o vectorial (SVG)

## Estilo Recomendado

- **Estilo:** Ilustraciones modernas, flat o isométricas
- **Colores:** Alineados con la paleta de My Elite Cleaning
  - Azul: #1E40AF (Admin)
  - Verde: #10B981 (Cleaner)
  - Púrpura: #8B5CF6 (PM)
- **Estética:** Profesional pero amigable

## Fuentes de Ilustraciones

### Gratuitas
- [unDraw](https://undraw.co/) - Ilustraciones personalizables
- [Storyset](https://storyset.com/) - Ilustraciones animadas
- [Humaaans](https://www.humaaans.com/) - Personas personalizables
- [Open Peeps](https://www.openpeeps.com/) - Ilustraciones de personas

### De Pago
- [Icons8 Illustrations](https://icons8.com/illustrations)
- [Blush Design](https://blush.design/)
- [Absurd Design](https://absurd.design/)

## Uso en el Código

```tsx
import Image from 'next/image'

<Image
  src="/images/roles/admin.png"
  alt="Administrador"
  width={400}
  height={400}
  className="object-contain"
/>
```

---

**Última actualización:** 9 de Enero de 2026
