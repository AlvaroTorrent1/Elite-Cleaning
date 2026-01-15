# 🔴 Problema: Redirección Incorrecta a Panel de Limpiadora

**Fecha:** 9 de Enero de 2026  
**Estado:** ✅ SOLUCIONADO DEFINITIVAMENTE  
**Severidad:** ALTA

---

## 📋 Resumen del Problema

Usuarios que intentaban acceder como **Admin** o **Property Manager** eran sistemáticamente redirigidos al panel de **Limpiadora**, incluso después de seleccionar explícitamente el rol correcto en el login.

## 🔍 Causa Raíz

1. **Trigger de Base de Datos:** Existe un trigger `handle_new_user` en Supabase que se ejecuta *inmediatamente* al crear un usuario y le asigna el rol `'cleaner'` por defecto (fallback).
2. **Race Condition:** El trigger gana la carrera contra el código de la aplicación. Para cuando el usuario regresa del login de Google, su perfil ya existe y es `'cleaner'`.
3. **Validación Insuficiente:** El callback anterior confiaba en el perfil existente. Si veía `'cleaner'`, asumía que era correcto y redirigía al panel de limpiadora.

## ✅ Solución Implementada: "Intención Forzada"

Hemos implementado una estrategia de **corrección automática en el callback** que no depende de timing ni de estados temporales.

### Lógica del Nuevo Callback (`src/app/auth/callback/route.ts`)

1. **Captura de Intención:** El botón de login ahora envía el rol deseado en la URL (`?role=admin`).
2. **Detección de Conflicto:** El callback lee el perfil actual de la BD.
3. **Corrección Automática:**
   ```typescript
   // Si el usuario pidió un rol específico (admin/pm) 
   // Y el perfil actual es 'cleaner' (el default débil del trigger)
   // ENTONCES: Asumimos que el trigger se equivocó y forzamos la actualización.
   if (profile.role === 'cleaner' && requestedRole !== 'cleaner') {
       // UPDATE profiles SET role = requestedRole ...
   }
   ```
4. **Redirección Correcta:** Una vez corregido el rol en la BD, se redirige al panel correspondiente.

### Archivos Clave Modificados

- `src/components/auth/role-signin-button.tsx`: Pasa `?role=...` en el `redirectTo`.
- `src/app/auth/callback/route.ts`: Implementa la lógica de detección y corrección de roles.

## 🧪 Verificación

1. **Usuario Nuevo:**
   - Click "Property Manager" → Google OAuth → Trigger crea 'cleaner' → Callback detecta 'cleaner' vs 'pm' → Corrige a 'pm' → Redirige a `/pending-approval` ✅

2. **Usuario Existente (Atrapado como Cleaner):**
   - Click "Property Manager" → Callback detecta 'cleaner' vs 'pm' → Corrige a 'pm' → Redirige a `/pending-approval` ✅

3. **Usuario Correcto (Admin):**
   - Click "Admin" → Callback ve perfil 'admin' (coincide o es superior) → Redirige a `/admin` ✅

## 🛠️ Herramientas de Diagnóstico

- `/debug-pm`: Permite verificar el estado actual del perfil de cualquier usuario.
- `/select-role`: Página de fallback por si falla la detección automática (aunque ahora es menos necesaria).

---

**Documentado por:** AI Assistant  
**Última Actualización:** 9 de Enero de 2026
