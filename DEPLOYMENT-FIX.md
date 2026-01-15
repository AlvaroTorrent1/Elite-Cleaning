# 🔧 FIX: Redirect a localhost después de Google OAuth

## ❌ PROBLEMA
Después del login con Google, la app redirige a `localhost:3000` en lugar de tu dominio de Vercel en producción.

## ✅ CAUSA
El callback de OAuth estaba usando el `origin` del request, que puede ser localhost si Supabase tiene configurado ese URL como redirect permitido.

## 🛠️ SOLUCIÓN APLICADA

### 1. Código Actualizado ✅
Ya actualicé el archivo `src/app/auth/callback/route.ts` para usar correctamente el dominio de producción.

**Cambio realizado:**
```typescript
// ANTES (❌ Incorrecto)
const { searchParams, origin } = new URL(request.url)

// AHORA (✅ Correcto)
const origin = process.env.NEXT_PUBLIC_SITE_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3000'
```

### 2. Configurar Variable de Entorno en Vercel 🔑

**PASO 1: Ve a tu proyecto en Vercel Dashboard**
- https://vercel.com/dashboard

**PASO 2: Settings → Environment Variables**

**PASO 3: Añade esta variable:**
```
Name: NEXT_PUBLIC_SITE_URL
Value: https://tu-app.vercel.app  (reemplaza con tu URL real)
Environment: Production, Preview, Development (marca las 3)
```

**IMPORTANTE:** Usa tu URL real de Vercel. Ejemplo:
- `https://elite-cleaning.vercel.app`
- `https://elite-cleaning-git-main-tu-usuario.vercel.app`

### 3. Configurar Supabase Dashboard 🔐

**PASO 1: Ve a tu proyecto Elite_Cleaning en Supabase**
- https://supabase.com/dashboard/project/oaysmidoxtyykhqrpzai
- Proyecto: `Elite_Cleaning` (oaysmidoxtyykhqrpzai)
- URL API: `https://oaysmidoxtyykhqrpzai.supabase.co`

**PASO 2: Authentication → URL Configuration**
- Click en "Authentication" en el menú lateral
- Click en "URL Configuration"

**PASO 3: Añade estos Redirect URLs (Allowed Redirect URLs):**
```
https://tu-app.vercel.app/auth/callback
https://tu-app-git-*.vercel.app/auth/callback
http://localhost:3000/auth/callback
```

**⚠️ IMPORTANTE:** Separa cada URL con una coma o en líneas diferentes según la interfaz de Supabase.

**PASO 4: Site URL**
Configura el Site URL principal (en la misma sección):
```
https://tu-app.vercel.app
```

**PASO 5: Guarda los cambios**
- Click en "Save" al final de la página

### 4. Re-deploy en Vercel 🚀

Después de configurar las variables de entorno:

**Opción A: Desde Vercel Dashboard**
1. Ve a Deployments
2. Click en los 3 puntos del último deployment
3. Click "Redeploy"

**Opción B: Desde Git**
```bash
git add .
git commit -m "fix: OAuth redirect to production URL"
git push
```

## 🧪 VERIFICACIÓN

Después del deploy:

1. **Abre tu app en producción** (no localhost)
2. **Click en "Acceder con Google"** en cualquier rol
3. **Completa el login con Google**
4. **Verifica que redirige a:** `https://tu-app.vercel.app/admin` (o /limpiadora, /pm)

## 🔍 TROUBLESHOOTING

### Si sigue redirigiendo a localhost:

**1. Verifica las variables de entorno en Vercel:**
```bash
# En tu terminal local
vercel env pull .env.local
cat .env.local | grep SITE_URL
```

**2. Verifica los logs en Vercel:**
- Dashboard → Deployments → Click en el deployment → Runtime Logs
- Busca errores relacionados con "redirect" o "callback"

**3. Limpia caché de Supabase:**
- En Supabase Dashboard → Authentication → Configuration
- Click "Refresh" en la sección de URLs

**4. Verifica que la variable esté disponible:**
Añade temporalmente este log en `src/app/auth/callback/route.ts` (línea 16):
```typescript
console.log('🔍 Origin usado:', origin)
console.log('🔍 SITE_URL:', process.env.NEXT_PUBLIC_SITE_URL)
console.log('🔍 VERCEL_URL:', process.env.VERCEL_URL)
```

Luego revisa los logs en Vercel después de hacer login.

## 📝 NOTAS IMPORTANTES

1. **NEXT_PUBLIC_SITE_URL** tiene prioridad sobre VERCEL_URL
2. **VERCEL_URL** es automática, no la configures manualmente
3. **Siempre usa HTTPS** en producción (nunca http://)
4. **Cada preview deployment** de Vercel tiene su propia URL, por eso usamos el wildcard `*` en Supabase

## ✨ RESULTADO ESPERADO

Después de aplicar estos cambios:
- ✅ Login en producción → redirige a producción
- ✅ Login en localhost → redirige a localhost
- ✅ Login en preview → redirige a preview URL
- ✅ No más redirects a localhost en producción

---

**Última actualización:** 15 Enero 2026
**Estado:** Código actualizado ✅ | Requiere configuración en Vercel y Supabase
