# Crear Usuarios de Prueba - My Elite Cleaning

**Fecha:** 9 de Enero de 2026

---

## 🔍 Diagnóstico del Problema

El sistema de redirecciones funciona **correctamente**. 

Si al acceder a `/limpiadora` o `/pm` te redirige a `/admin`, es porque:
- ✅ Estás autenticado (sino irías a `/login`)
- ✅ Tu rol actual es `admin` (por eso te redirige a `/admin`)

**Esto es el comportamiento esperado.** Para ver los otros paneles, necesitas usuarios con los roles correspondientes.

---

## 📊 Usuarios Necesarios para Pruebas

| Panel | URL | Rol Requerido | Notas |
|-------|-----|---------------|-------|
| Admin | `/admin` | `admin` | Acceso completo |
| Limpiadora | `/limpiadora` | `cleaner` | Agenda y checklists |
| Property Manager | `/pm` | `property_manager` | Requiere `is_approved = true` |

---

## 🛠️ Opción 1: Cambiar tu Rol Temporalmente (Más Rápido)

### Via Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **Table Editor** → **profiles**
3. Busca tu usuario por email
4. Cambia el campo `role` a:
   - `cleaner` para probar panel de limpiadora
   - `property_manager` para probar panel de PM (también pon `is_approved = true`)
5. Recarga la página en tu navegador

### Via SQL Editor en Supabase

```sql
-- Para probar como limpiadora
UPDATE profiles 
SET role = 'cleaner' 
WHERE email = 'TU_EMAIL@gmail.com';

-- Para probar como property manager
UPDATE profiles 
SET role = 'property_manager', is_approved = true 
WHERE email = 'TU_EMAIL@gmail.com';

-- Para volver a admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'TU_EMAIL@gmail.com';
```

---

## 🛠️ Opción 2: Crear Usuarios de Prueba (Recomendado)

### Via SQL Editor en Supabase

Ejecuta este SQL para crear usuarios de prueba directamente en la tabla profiles:

```sql
-- IMPORTANTE: Estos usuarios de prueba no tienen auth.users asociados
-- Solo sirven para verificar que los datos existen
-- Para login real, necesitas crear usuarios via Google OAuth

-- Ver todos los usuarios actuales
SELECT id, email, full_name, role, is_approved, is_active 
FROM profiles 
ORDER BY role;

-- Verificar cuántos usuarios hay por rol
SELECT role, COUNT(*) as total 
FROM profiles 
GROUP BY role;
```

### Crear Usuarios Reales con Google OAuth

1. **Abre una ventana de incógnito** en tu navegador
2. Ve a `http://localhost:3000/login`
3. Inicia sesión con **otra cuenta de Google** diferente
4. Ese usuario se creará automáticamente con rol `cleaner` (por defecto)
5. Luego desde tu cuenta admin, puedes cambiarle el rol en Supabase

---

## 🛠️ Opción 3: Modo Desarrollo - Ver Paneles sin Restricciones

Para desarrollo, puedes agregar un parámetro especial que permita ver cualquier panel.

**IMPORTANTE:** Solo usar en desarrollo, nunca en producción.

He creado una opción de "preview mode" que puedes activar:

### URLs de Preview (Solo Desarrollo)

```
http://localhost:3000/admin?preview=true
http://localhost:3000/limpiadora?preview=true  
http://localhost:3000/pm?preview=true
```

*(Nota: Esta funcionalidad necesita implementarse - ver sección siguiente)*

---

## 🔧 Verificar Estado Actual

### Endpoint de Debug

Visita esta URL en tu navegador (con sesión activa):

```
http://localhost:3000/debug
```

O para ver JSON puro:

```
http://localhost:3000/api/debug-session
```

Te mostrará:
- Si estás autenticado
- Tu rol actual
- A qué panel deberías ir

---

## 📝 Resumen de URLs

### Paneles
| Panel | URL |
|-------|-----|
| **Admin** | `http://localhost:3000/admin` |
| **Limpiadora** | `http://localhost:3000/limpiadora` |
| **Property Manager** | `http://localhost:3000/pm` |

### Debug
| Función | URL |
|---------|-----|
| **Debug Visual** | `http://localhost:3000/debug` |
| **Debug API** | `http://localhost:3000/api/debug-session` |
| **Login** | `http://localhost:3000/login` |
| **Logout** | `http://localhost:3000/logout` (POST) |

---

## ✅ Checklist de Pruebas

- [ ] Verificar panel Admin con usuario rol `admin`
- [ ] Verificar panel Limpiadora con usuario rol `cleaner`
- [ ] Verificar panel PM con usuario rol `property_manager` + `is_approved = true`
- [ ] Verificar que PM no aprobado ve `/pending-approval`
- [ ] Verificar redirecciones cruzadas funcionan correctamente

---

**Última actualización:** 9 de Enero de 2026
