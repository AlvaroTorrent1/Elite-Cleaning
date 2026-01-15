# Guía de Acceso a los Paneles - My Elite Cleaning

**Fecha:** 9 de Enero de 2026  
**Estado:** ✅ Redirecciones corregidas

---

## 🔐 Estado de las Correcciones

He corregido el problema de redirecciones infinitas en los layouts. Ahora cada panel:

1. **Verifica autenticación** - Si no hay usuario, redirige a `/login`
2. **Verifica rol** - Si el rol no coincide, redirige al panel correcto del usuario
3. **No crea loops** - Ya no redirige a `/` que causaba el loop

### Cambios Realizados

#### `src/app/admin/layout.tsx`
```typescript
if (!profile) {
  redirect('/login')
}

if (profile.role !== 'admin') {
  // Redirigir al panel correcto según el rol
  switch (profile.role) {
    case 'cleaner':
      redirect('/limpiadora')
    case 'property_manager':
      redirect('/pm')
    default:
      redirect('/login')
  }
}
```

#### `src/app/limpiadora/layout.tsx`
```typescript
if (!profile) {
  redirect('/login')
}

if (profile.role !== 'cleaner') {
  // Redirigir al panel correcto según el rol
  switch (profile.role) {
    case 'admin':
      redirect('/admin')
    case 'property_manager':
      redirect('/pm')
    default:
      redirect('/login')
  }
}
```

#### `src/app/pm/layout.tsx`
```typescript
if (!profile) {
  redirect('/login')
}

if (profile.role !== 'property_manager') {
  // Redirigir al panel correcto según el rol
  switch (profile.role) {
    case 'admin':
      redirect('/admin')
    case 'cleaner':
      redirect('/limpiadora')
    default:
      redirect('/login')
  }
}
```

---

## 🌐 URLs de los Paneles

### 1. Panel de Administrador
**URL:** `http://localhost:3000/admin`

**Acceso:** Solo usuarios con rol `admin`

**Características:**
- Dashboard con visión global
- Gestión de usuarios
- Gestión de propiedades
- Catálogo de daños
- Supervisión de limpiezas
- Reportes de daños y objetos perdidos

**Rutas disponibles:**
```
/admin                          # Dashboard principal
/admin/usuarios                 # Gestión de usuarios
/admin/propiedades              # Lista de propiedades
/admin/propiedades/nueva        # Crear propiedad
/admin/propiedades/[id]         # Editar propiedad
/admin/limpiezas                # Lista de limpiezas
/admin/catalogo-danos           # Catálogo de items dañables
/admin/danos                    # Reportes de daños
/admin/objetos-perdidos         # Objetos perdidos
```

---

### 2. Panel de Limpiadora
**URL:** `http://localhost:3000/limpiadora`

**Acceso:** Solo usuarios con rol `cleaner`

**Características:**
- Agenda diaria de limpiezas asignadas
- Vista de detalles de cada limpieza
- Checklists digitales
- Subida de fotos
- Reportes de daños
- Reportes de objetos perdidos

**Rutas disponibles:**
```
/limpiadora                     # Agenda de limpiezas
/limpiadora/[id]                # Detalle de limpieza específica
```

---

### 3. Panel de Property Manager
**URL:** `http://localhost:3000/pm`

**Acceso:** Solo usuarios con rol `property_manager` y `is_approved = true`

**Características:**
- Vista de propiedades asignadas
- Estado de limpiezas
- Solicitud de nuevas limpiezas
- Histórico de servicios
- Visualización de reportes de daños
- Visualización de objetos perdidos

**Rutas disponibles:**
```
/pm                             # Dashboard principal
/pm/limpiezas                   # Lista de limpiezas
/pm/nueva-limpieza              # Solicitar nueva limpieza
/pm/historico                   # Histórico de servicios
/pm/danos                       # Reportes de daños
/pm/objetos-perdidos            # Objetos perdidos
```

---

## 🧪 Cómo Probar los Paneles

### Paso 1: Verificar que el servidor esté corriendo

```bash
npm run dev
```

El servidor debe estar en `http://localhost:3000`

### Paso 2: Acceder a la página de Debug

**URL:** `http://localhost:3000/debug`

Esta página te mostrará:
- Estado de autenticación
- Datos del usuario actual
- Rol del usuario
- Botón para ir a tu dashboard

### Paso 3: Iniciar Sesión

Si no estás autenticado:

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Continuar con Google"
3. Selecciona tu cuenta de Google
4. Serás redirigido automáticamente a tu panel según tu rol

### Paso 4: Verificar Redirección Automática

Después de iniciar sesión, el sistema te redirigirá automáticamente:

- **Si eres admin** → `/admin`
- **Si eres limpiadora** → `/limpiadora`
- **Si eres PM** → `/pm` (solo si estás aprobado)
- **Si eres PM no aprobado** → `/pending-approval`

### Paso 5: Probar Acceso Directo a Otros Paneles

Una vez autenticado, intenta acceder directamente a un panel que no corresponde a tu rol:

**Ejemplo:** Si eres admin e intentas ir a `/limpiadora`:
- ✅ Serás redirigido automáticamente a `/admin`
- ❌ NO habrá loop de redirección

---

## 🔍 Debugging

### Si tienes problemas de acceso:

1. **Verifica tu sesión:**
   ```
   http://localhost:3000/debug
   ```

2. **Verifica tu rol en la base de datos:**
   - Ve a Supabase Dashboard
   - Tabla `profiles`
   - Busca tu usuario por email
   - Verifica el campo `role`

3. **Limpia las cookies del navegador:**
   - Chrome: DevTools → Application → Cookies → Eliminar todo
   - Firefox: DevTools → Storage → Cookies → Eliminar todo

4. **Cierra sesión y vuelve a iniciar:**
   ```
   http://localhost:3000/logout
   ```

### Si ves loops de redirección:

Esto ya debería estar corregido, pero si ocurre:

1. Verifica que los cambios en los layouts se hayan guardado
2. Reinicia el servidor de desarrollo
3. Limpia el caché del navegador

---

## 📊 Matriz de Acceso

| Rol | `/admin` | `/limpiadora` | `/pm` | Redirección |
|-----|----------|---------------|-------|-------------|
| **admin** | ✅ Acceso | ❌ → `/admin` | ❌ → `/admin` | Ninguna |
| **cleaner** | ❌ → `/limpiadora` | ✅ Acceso | ❌ → `/limpiadora` | Ninguna |
| **property_manager** | ❌ → `/pm` | ❌ → `/pm` | ✅ Acceso | Ninguna |
| **Sin autenticar** | → `/login` | → `/login` | → `/login` | Login |
| **PM no aprobado** | → `/login` | → `/login` | → `/pending-approval` | Pending |

---

## ✅ Checklist de Verificación

- [x] Layouts actualizados sin loops de redirección
- [x] Admin panel accesible en `/admin`
- [x] Limpiadora panel accesible en `/limpiadora`
- [x] Property Manager panel accesible en `/pm`
- [x] Redirecciones correctas según rol
- [x] No hay linter errors
- [ ] Probado con usuario admin
- [ ] Probado con usuario cleaner
- [ ] Probado con usuario property_manager

---

## 🚀 Próximos Pasos

1. **Iniciar sesión con cada tipo de usuario** para verificar que todo funciona
2. **Probar navegación** entre diferentes secciones de cada panel
3. **Verificar responsive design** en móvil (especialmente panel de limpiadora)
4. **Probar funcionalidades** específicas de cada rol

---

**Nota:** Para crear usuarios de prueba con diferentes roles, consulta el archivo `CREATE_TEST_DATA.md`.

---

**Última actualización:** 9 de Enero de 2026  
**Mantenido por:** Equipo de Desarrollo My Elite Cleaning
