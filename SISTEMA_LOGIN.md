# Sistema de Login - My Elite Cleaning

**Fecha:** 9 de Enero de 2026

---

## 🔐 Cómo Funciona el Login

### Un Solo Botón para Todos los Roles

El sistema utiliza **Google OAuth** con un único punto de entrada. No hay botones separados para admin, limpiadora o property manager porque:

1. **Google no conoce tu rol** - Solo autentica tu identidad
2. **El rol se determina en la base de datos** - Después de autenticarte
3. **La redirección es automática** - Según tu rol asignado

### Flujo de Autenticación

```
Usuario hace clic en "Continuar con Google"
         ↓
Google OAuth - Selecciona cuenta
         ↓
Callback de autenticación (/auth/callback)
         ↓
Sistema consulta tabla "profiles" en Supabase
         ↓
Obtiene el rol del usuario (admin/cleaner/property_manager)
         ↓
Redirección automática al panel correcto:
  - admin → /admin
  - cleaner → /limpiadora
  - property_manager → /pm (si is_approved = true)
  - property_manager → /pending-approval (si is_approved = false)
```

---

## 👥 Roles y Paneles

| Rol | Panel | URL | Permisos |
|-----|-------|-----|----------|
| **admin** | Administrador | `/admin` | Acceso completo al sistema |
| **cleaner** | Limpiadora | `/limpiadora` | Agenda, checklists, reportes |
| **property_manager** | Property Manager | `/pm` | Propiedades, limpiezas, histórico |

---

## 🎨 Interfaz de Login

La página de login muestra:

### 1. Tarjetas Informativas (3 tipos de acceso)
- **Administrador** - Icono de configuración (azul)
- **Limpiadora** - Icono de check (verde)
- **Property Manager** - Icono de casa (púrpura)

### 2. Botón Único de Login
- "Continuar con Google"
- Funciona para TODOS los roles
- El sistema determina automáticamente a dónde redirigir

### 3. Mensaje Informativo
> "ℹ️ Acceso único para todos los roles"
> "Serás redirigido automáticamente a tu panel según tu rol asignado"

---

## 🔧 Asignación de Roles

### ¿Cómo se asigna el rol a un usuario?

#### Opción 1: Automático (Por defecto)
Cuando un usuario inicia sesión por primera vez:
- Se crea automáticamente un perfil en la tabla `profiles`
- El rol por defecto es `cleaner`
- El trigger `handle_new_user()` gestiona esto

#### Opción 2: Manual (Administrador)
El administrador puede cambiar roles desde:
1. **Panel Admin** → Usuarios → Editar rol
2. **Supabase Dashboard** → Table Editor → profiles

#### Opción 3: SQL Directo
```sql
-- Cambiar rol de un usuario
UPDATE profiles 
SET role = 'admin' -- o 'cleaner' o 'property_manager'
WHERE email = 'usuario@ejemplo.com';

-- Para property managers, también aprobar
UPDATE profiles 
SET role = 'property_manager', is_approved = true
WHERE email = 'pm@ejemplo.com';
```

---

## 🚀 Casos de Uso

### Caso 1: Nueva Limpiadora se Registra
1. Va a `/login`
2. Hace clic en "Continuar con Google"
3. Selecciona su cuenta de Gmail
4. Sistema crea perfil con rol `cleaner`
5. Redirige automáticamente a `/limpiadora`
6. ✅ Puede ver su agenda de limpiezas

### Caso 2: Property Manager se Auto-registra
1. Va a `/login`
2. Hace clic en "Continuar con Google"
3. Sistema crea perfil con rol `property_manager` + `is_approved = false`
4. Redirige a `/pending-approval`
5. ⏳ Espera a que admin lo apruebe
6. Admin aprueba desde panel
7. ✅ Ahora puede acceder a `/pm`

### Caso 3: Admin Accede
1. Va a `/login`
2. Hace clic en "Continuar con Google"
3. Sistema detecta rol `admin`
4. Redirige a `/admin`
5. ✅ Acceso completo al sistema

### Caso 4: Usuario Ya Autenticado Vuelve a /login
1. Va a `/login`
2. Sistema detecta sesión activa
3. Muestra:
   - Nombre y rol actual
   - Botón "Ir a mi Panel"
   - Botón "Cerrar Sesión"
4. No necesita volver a autenticarse

---

## 🔒 Seguridad

### Row Level Security (RLS)
Cada tabla tiene políticas que verifican el rol:

```sql
-- Ejemplo: Solo admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### Verificación en Layouts
Cada panel verifica el rol antes de renderizar:

```typescript
// src/app/admin/layout.tsx
if (profile.role !== 'admin') {
  redirect('/limpiadora') // o el panel correcto
}
```

---

## ❓ Preguntas Frecuentes

### ¿Por qué no hay botones separados para cada rol?

**Respuesta:** Porque Google OAuth no puede saber tu rol antes de autenticarte. El rol está en nuestra base de datos, no en Google.

### ¿Puedo tener múltiples roles?

**Respuesta:** No. Cada usuario tiene un único rol. Si necesitas cambiar de rol, un administrador debe modificarlo en la base de datos.

### ¿Qué pasa si intento acceder a un panel que no me corresponde?

**Respuesta:** El sistema te redirige automáticamente a tu panel correcto. Por ejemplo:
- Si eres limpiadora e intentas ir a `/admin` → Te redirige a `/limpiadora`
- Si eres admin e intentas ir a `/pm` → Te redirige a `/admin`

### ¿Cómo pruebo los diferentes paneles en desarrollo?

**Respuesta:** Tienes 3 opciones:

1. **Cambiar tu rol temporalmente:**
   ```sql
   UPDATE profiles SET role = 'cleaner' WHERE email = 'tu@email.com';
   ```

2. **Iniciar sesión con diferentes cuentas de Google** (en ventanas de incógnito)

3. **Usar la página de desarrollo:**
   ```
   http://localhost:3000/dev/paneles
   ```

### ¿Los property managers necesitan aprobación?

**Respuesta:** Sí. Cuando un PM se auto-registra:
- Se crea con `is_approved = false`
- Ve la página `/pending-approval`
- Un admin debe aprobarlos desde el panel
- Después pueden acceder a `/pm`

---

## 🛠️ Troubleshooting

### Problema: "Siempre me redirige al mismo panel"

**Solución:** Tienes sesión activa. Ve a `/login` y haz clic en "Cerrar Sesión", luego inicia con otra cuenta.

### Problema: "No puedo acceder a ningún panel"

**Solución:** 
1. Verifica que tienes un perfil en la tabla `profiles`
2. Verifica que tu rol está asignado correctamente
3. Usa `/debug` para ver tu estado de autenticación

### Problema: "Property Manager no puede acceder"

**Solución:** Verifica que `is_approved = true` en la tabla `profiles`.

---

## 📚 Archivos Relacionados

- `src/app/login/page.tsx` - Página de login
- `src/app/auth/callback/route.ts` - Callback de Google OAuth
- `src/app/logout/page.tsx` - Página de logout
- `src/app/admin/layout.tsx` - Verificación de rol admin
- `src/app/limpiadora/layout.tsx` - Verificación de rol cleaner
- `src/app/pm/layout.tsx` - Verificación de rol property_manager
- `supabase/migrations/001_initial_schema.sql` - Trigger `handle_new_user()`

---

**Última actualización:** 9 de Enero de 2026
