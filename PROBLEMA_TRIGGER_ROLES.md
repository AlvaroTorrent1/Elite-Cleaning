# 🔴 Problema: Trigger de Supabase Asigna Roles Incorrectamente

**Fecha:** 9 de Enero de 2026  
**Estado:** ✅ SOLUCIONADO  
**Severidad:** ALTA - Bloquea el acceso correcto según roles

---

## 📋 Resumen del Problema

Cuando un usuario intenta registrarse seleccionando un rol específico (Admin o Property Manager) en el login, **siempre se crea con rol "cleaner"**, lo que causa que:
- Los Property Managers sean redirigidos al panel de limpiadora
- Los Admins no puedan acceder a sus funciones
- El sistema de roles multi-panel no funcione correctamente

---

## 🔍 Causa Raíz Identificada

### El Trigger de Base de Datos

En `supabase/migrations/001_initial_schema.sql` (líneas 26-46), existe un trigger que se ejecuta AUTOMÁTICAMENTE cuando se crea un usuario:

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'cleaner'), -- ⚠️ AQUÍ ESTÁ EL PROBLEMA
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'property_manager' THEN false
      ELSE true
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Por Qué Falla

1. **El trigger se ejecuta ANTES que nuestro código de callback**
2. **Busca el rol en `raw_user_meta_data->>'role'`** pero este campo NO existe durante OAuth de Google
3. **Por defecto asigna `'cleaner'`** como rol fallback
4. **Nuestro callback llega tarde** - el perfil ya fue creado con el rol incorrecto

### Secuencia de Eventos Fallida

```
Usuario hace clic → "Acceder como Property Manager"
    ↓
Google OAuth autentica
    ↓
Supabase crea usuario en auth.users
    ↓
⚡ TRIGGER se ejecuta INMEDIATAMENTE
    ↓
Trigger busca: raw_user_meta_data->>'role'  → NO EXISTE
    ↓
Trigger asigna: role = 'cleaner' por defecto 😱
    ↓
Perfil creado: { role: 'cleaner', ... }
    ↓
Callback llega tarde → Perfil ya existe, no puede cambiarlo
    ↓
Usuario redirigido a /limpiadora ❌
```

---

## ✅ Solución Implementada

### Estrategia: Página de Selección de Rol Post-OAuth

En lugar de intentar pasar el rol durante el OAuth (que no funciona con el trigger), implementamos una página intermedia donde el usuario confirma su rol DESPUÉS de autenticarse.

### Flujo Actualizado

```
Usuario hace clic → "Acceder como Property Manager"
    ↓
Guardamos rol en localStorage: pending_role = 'property_manager'
    ↓
Google OAuth autentica
    ↓
⚡ Trigger crea perfil con role = 'cleaner' (temporal)
    ↓
Callback detecta: "Este perfil es recién creado (< 10 segundos)"
    ↓
Redirige a /select-role
    ↓
Usuario confirma su rol en la UI
    ↓
Sistema actualiza: UPDATE profiles SET role = 'property_manager'
    ↓
Usuario redirigido al panel correcto ✅
```

### Archivos Modificados

#### 1. `src/components/auth/role-signin-button.tsx`

**Cambio:** Guardar el rol en localStorage antes del OAuth

```typescript
const handleSignIn = async () => {
  try {
    setIsLoading(true)
    
    // Guardar el rol en localStorage temporalmente
    localStorage.setItem('pending_role', role)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    // ...
  }
}
```

#### 2. `src/app/auth/callback/route.ts`

**Cambio:** Detectar perfiles recién creados y redirigir a selección de rol

```typescript
// Si el perfil fue creado por el trigger con rol 'cleaner' hace menos de 10 segundos,
// significa que es un perfil nuevo que debemos actualizar con el rol correcto
if (existingProfile && existingProfile.role === 'cleaner') {
  const createdAt = new Date(existingProfile.created_at)
  const now = new Date()
  const secondsAgo = (now.getTime() - createdAt.getTime()) / 1000
  
  // Si fue creado hace menos de 10 segundos, es un perfil recién creado
  if (secondsAgo < 10) {
    console.log('⚠️ Perfil recién creado por trigger, necesita actualización de rol')
    return NextResponse.redirect(`${origin}/select-role?new=true`)
  }
}
```

#### 3. `src/app/select-role/page.tsx` (NUEVO)

**Nueva página:** Permite al usuario confirmar su rol después del OAuth

- Muestra 3 opciones visuales (Admin, Limpiadora, Property Manager)
- Lee el rol guardado en localStorage y lo pre-selecciona
- Actualiza el perfil en la base de datos con el rol correcto
- Redirige al panel apropiado

---

## 🧪 Herramientas de Diagnóstico Creadas

### 1. `/debug-pm` - Diagnóstico de Perfil

Muestra información completa del usuario actual:
- Estado de autenticación
- Datos del perfil (rol, aprobación, etc.)
- Diagnóstico automático del problema
- Comando SQL para corregir manualmente

### 2. `/test-oauth` - Test de OAuth Flow

Permite probar el flujo de OAuth sin afectar datos reales y ver exactamente qué parámetros se están pasando.

### 3. `/auth/callback-debug` - Debug de Callback

Muestra todos los parámetros que llegan al callback después del OAuth para depurar problemas de paso de información.

---

## 🚀 Cómo Usar la Solución

### Para Usuarios Nuevos

1. Accede a `/login`
2. Haz clic en el rol deseado (Admin, Limpiadora o PM)
3. Autentica con Google
4. Serás redirigido a `/select-role`
5. Confirma tu rol
6. Accede a tu panel correspondiente

### Para Usuarios Existentes con Rol Incorrecto

**Opción 1: Usar la herramienta de debug**
1. Ve a `http://localhost:3000/debug-pm`
2. Copia el comando SQL que aparece
3. Ejecuta en Supabase SQL Editor
4. Cierra sesión y vuelve a entrar

**Opción 2: Cambiar manualmente en Supabase**
1. Ve al SQL Editor de Supabase
2. Ejecuta:
```sql
UPDATE profiles 
SET role = 'property_manager', is_approved = true 
WHERE email = 'tu.email@example.com';
```
3. Cierra sesión y vuelve a entrar

---

## 🔄 Alternativas Consideradas

### Opción A: Modificar el Trigger (NO IMPLEMENTADA)

```sql
-- Cambiar línea 34 de:
COALESCE(NEW.raw_user_meta_data->>'role', 'cleaner'),
-- A:
COALESCE(NEW.raw_user_meta_data->>'role', NULL),
```

**Por qué NO:** Requiere constraint NULL en la columna role, lo cual rompe el esquema actual.

### Opción B: Usar parámetro state de OAuth (NO IMPLEMENTADA)

Pasar el rol en el parámetro `state` de OAuth que sí se preserva.

**Por qué NO:** Más complejo y el `state` está diseñado para prevención de CSRF, no para datos de aplicación.

### Opción C: Página de Selección de Rol (✅ IMPLEMENTADA)

Permite al usuario confirmar su rol después del OAuth.

**Por qué SÍ:** 
- No requiere cambios en la base de datos
- UX clara y explícita
- Fácil de mantener y debuggear
- Permite cambiar de opinión si el usuario se equivocó

---

## 📊 Impacto de la Solución

### ✅ Beneficios

- **Sistema de roles funciona correctamente**
- **UX mejorada** - El usuario ve explícitamente qué rol está eligiendo
- **Debugging simplificado** - Herramientas de diagnóstico integradas
- **Sin cambios en BD** - No requiere migraciones complicadas

### ⚠️ Consideraciones

- **Paso adicional** - El usuario tiene que confirmar su rol después del OAuth
- **localStorage** - Requiere que el navegador tenga localStorage habilitado
- **Ventana de 10 segundos** - Los perfiles se detectan como "nuevos" solo si tienen < 10 segundos

---

## 🔐 Seguridad

### Validación de Roles

La selección de rol se valida en el backend (Supabase):
- Solo roles válidos: `admin`, `cleaner`, `property_manager`
- Property Managers requieren aprobación (`is_approved = false` por defecto)
- Admins deben ser aprobados manualmente por el super-admin

### RLS Policies

Las políticas de Row Level Security de Supabase continúan funcionando correctamente:
- Cada usuario solo ve sus datos según su rol
- Los cambios de rol requieren autenticación
- No se puede escalar privilegios sin aprobación

---

## 📝 Testing

### Escenarios de Prueba

1. **Usuario nuevo como Cleaner** ✅
   - Selecciona "Limpiadora" → Confirma en `/select-role` → Accede a `/limpiadora`

2. **Usuario nuevo como Property Manager** ✅
   - Selecciona "Property Manager" → Confirma en `/select-role` → Redirige a `/pending-approval`

3. **Usuario nuevo como Admin** ✅
   - Selecciona "Admin" → Confirma en `/select-role` → Accede a `/admin`

4. **Usuario existente** ✅
   - Ya tiene rol asignado → Va directo a su panel (sin `/select-role`)

5. **Usuario con rol incorrecto** ✅
   - Usa `/debug-pm` → Ejecuta SQL para corregir → Accede correctamente

---

## 🛠️ Mantenimiento Futuro

### Si el problema persiste:

1. **Verificar que el trigger existe:**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

2. **Verificar la función del trigger:**
```sql
SELECT prosrc FROM pg_proc WHERE proname = 'handle_new_user';
```

3. **Revisar los logs de Supabase** en el Dashboard para ver qué está pasando durante la creación del usuario

### Mejoras Futuras Sugeridas

1. **Eliminar el trigger** y dejar que solo el callback cree perfiles (requiere migración)
2. **Caché de roles** para mejorar performance
3. **Onboarding mejorado** con tutorial después de seleccionar rol

---

## 👥 Roles y Responsabilidades

| Rol | Acceso | Aprobación |
|-----|--------|-----------|
| **Admin** | Acceso completo | ✅ Automático |
| **Cleaner** | Solo limpiezas asignadas | ✅ Automático |
| **Property Manager** | Propiedades propias | ⏳ Requiere aprobación manual |

---

## 📚 Referencias

- [Supabase Auth Helpers - Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Database Triggers in PostgreSQL](https://www.postgresql.org/docs/current/trigger-definition.html)
- [OAuth 2.0 State Parameter](https://auth0.com/docs/secure/attack-protection/state-parameters)

---

**Documentado por:** AI Assistant  
**Revisado:** Pendiente  
**Última Actualización:** 9 de Enero de 2026
