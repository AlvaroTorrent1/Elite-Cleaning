# 🎯 Solución Completa - OAuth Redirect a Localhost

## 📋 RESUMEN EJECUTIVO

**Problema:** Después del login con Google, la app redirige a `localhost:3000` en lugar de tu dominio de Vercel.

**Causa:** El callback de OAuth usaba el `origin` del request sin considerar el entorno de producción.

**Solución:** Código actualizado + configuración de variables de entorno.

**Tiempo de implementación:** 15-20 minutos

---

## ✅ LO QUE YA ESTÁ HECHO

### 1. Código Actualizado

**Archivo modificado:** `src/app/auth/callback/route.ts`

**Cambio aplicado:**
```typescript
// ANTES (❌)
const { searchParams, origin } = new URL(request.url)

// AHORA (✅)
const origin = process.env.NEXT_PUBLIC_SITE_URL 
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
  || 'http://localhost:3000'
```

**Lógica:**
1. Prioriza `NEXT_PUBLIC_SITE_URL` (configurada manualmente)
2. Si no existe, usa `VERCEL_URL` (automática de Vercel)
3. Si ninguna existe, usa localhost (desarrollo)

### 2. Archivos de Documentación Creados

| Archivo | Propósito |
|---------|-----------|
| `DEPLOYMENT-FIX.md` | Guía técnica completa con troubleshooting |
| `CHECKLIST-RAPIDO.md` | Checklist paso a paso (15 min) |
| `GUIA-VISUAL.md` | Guía visual con capturas descritas |
| `RESUMEN-PARA-CLIENTE.md` | Resumen ejecutivo para mostrar al cliente |
| `SOLUCION-COMPLETA.md` | Este archivo (overview completo) |

### 3. Script de Verificación

**Archivo creado:** `scripts/verify-deployment.js`

**Uso:**
```bash
npm run verify
```

**Qué hace:**
- ✅ Verifica que todas las variables de entorno estén configuradas
- ✅ Valida el formato de las URLs
- ✅ Muestra qué origin se usará para redirects
- ✅ Detecta errores comunes

### 4. Package.json Actualizado

**Script añadido:**
```json
"verify": "node scripts/verify-deployment.js"
```

---

## 🔧 LO QUE FALTA POR HACER (TÚ)

### Paso 1: Configurar Vercel (5 min)

1. Ve a: https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Add New:
   - **Name:** `NEXT_PUBLIC_SITE_URL`
   - **Value:** `https://tu-app.vercel.app` (tu URL real)
   - **Environment:** ✅ Production ✅ Preview ✅ Development
5. Save

### Paso 2: Configurar Supabase (5 min)

1. Ve a: https://supabase.com/dashboard/project/oaysmidoxtyykhqrpzai
2. Authentication → URL Configuration
3. **Site URL:** `https://tu-app.vercel.app`
4. **Redirect URLs:**
   ```
   https://tu-app.vercel.app/auth/callback
   https://*.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
5. Save

### Paso 3: Re-deploy (3 min)

**Opción A - Vercel Dashboard:**
- Deployments → ⋮ (tres puntos) → Redeploy

**Opción B - Git:**
```bash
git add .
git commit -m "fix: OAuth redirect configuration"
git push
```

### Paso 4: Verificar (2 min)

1. Espera a que el deploy termine (2-3 min)
2. Abre tu app: `https://tu-app.vercel.app`
3. Click en "Acceder con Google"
4. Completa el login
5. **Verifica:** ¿Te quedas en tu dominio de Vercel?

---

## 🎓 EXPLICACIÓN TÉCNICA

### ¿Por qué pasaba esto?

**Flujo OAuth normal:**
1. Usuario click en "Acceder con Google"
2. App redirige a Google con `redirect_uri=https://tu-app.vercel.app/auth/callback`
3. Google valida el login
4. Google redirige a `redirect_uri` con un `code`
5. **AQUÍ ESTABA EL PROBLEMA:** El callback usaba `request.url.origin` que podía ser localhost

### ¿Por qué `request.url.origin` era localhost?

Cuando Supabase tiene múltiples redirect URLs configurados (localhost + producción), puede usar el primero de la lista o el que coincida con el contexto de la petición. Si el request venía con headers que indicaban localhost, usaba ese origin.

### ¿Cómo lo arreglamos?

En lugar de confiar en el `origin` del request, ahora usamos variables de entorno explícitas:

```typescript
const origin = process.env.NEXT_PUBLIC_SITE_URL  // ← Configurado por ti
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)  // ← Automático de Vercel
  || 'http://localhost:3000'  // ← Fallback para desarrollo
```

Esto garantiza que:
- ✅ En producción: usa tu dominio de Vercel
- ✅ En preview: usa la URL del preview
- ✅ En local: usa localhost

---

## 🔍 VERIFICACIÓN POST-DEPLOY

### Test Manual

1. **Producción:**
   - URL: `https://tu-app.vercel.app`
   - Login con Google
   - Debe redirigir a: `https://tu-app.vercel.app/admin` (o /limpiadora, /pm)

2. **Preview (si aplica):**
   - URL: `https://tu-app-git-branch.vercel.app`
   - Login con Google
   - Debe redirigir a: `https://tu-app-git-branch.vercel.app/admin`

3. **Local:**
   - URL: `http://localhost:3000`
   - Login con Google
   - Debe redirigir a: `http://localhost:3000/admin`

### Test Automatizado

```bash
# Verificar configuración local
npm run verify

# Verificar en Vercel (después de deploy)
vercel env pull .env.local
npm run verify
```

### Verificar Logs

**Vercel:**
```
Dashboard → Deployments → [Tu deployment] → Runtime Logs
```

Busca:
```
🔍 Origin usado: https://tu-app.vercel.app
```

**Supabase:**
```
Dashboard → Logs → Auth Logs
```

No debería haber errores de `invalid_redirect_uri`.

---

## 🐛 TROUBLESHOOTING

### Problema 1: Sigue redirigiendo a localhost

**Causa posible:** Variable de entorno no configurada correctamente.

**Solución:**
1. Verifica en Vercel que `NEXT_PUBLIC_SITE_URL` esté configurada
2. Verifica que el valor sea correcto (con `https://`)
3. Re-deploy después de cambiar variables

### Problema 2: Error "Invalid redirect URI"

**Causa posible:** URL no configurada en Supabase.

**Solución:**
1. Ve a Supabase → Authentication → URL Configuration
2. Añade tu URL a "Redirect URLs"
3. Usa wildcard `https://*.vercel.app/auth/callback` para previews

### Problema 3: Funciona en producción pero no en preview

**Causa posible:** Preview URL no está en la lista de Supabase.

**Solución:**
1. Usa el wildcard `https://*.vercel.app/auth/callback` en Supabase
2. O añade cada preview URL manualmente

### Problema 4: Variables de entorno no se actualizan

**Causa posible:** Vercel cachea las variables.

**Solución:**
1. Después de cambiar variables, SIEMPRE re-deploy
2. No uses "Use existing Build Cache" al re-deployar
3. Espera 2-3 minutos para que se propague

---

## 📊 IMPACTO Y BENEFICIOS

### Antes (❌)
- Login en producción → redirect a localhost
- Usuario no puede acceder a la app
- No se puede mostrar al cliente
- Mala experiencia de usuario

### Después (✅)
- Login en producción → redirect a producción
- Usuario accede directamente a su panel
- App lista para mostrar al cliente
- Experiencia de usuario fluida y profesional

---

## 🎯 PRÓXIMOS PASOS

1. [ ] Configurar `NEXT_PUBLIC_SITE_URL` en Vercel
2. [ ] Configurar URLs en Supabase
3. [ ] Re-deploy la aplicación
4. [ ] Verificar funcionamiento
5. [ ] Mostrar al cliente

**Tiempo total estimado:** 15-20 minutos

---

## 📞 SOPORTE

Si después de seguir todos los pasos sigue sin funcionar:

1. **Lee:** `DEPLOYMENT-FIX.md` (guía técnica completa)
2. **Verifica:** `npm run verify` (script de verificación)
3. **Revisa:** Logs en Vercel y Supabase
4. **Contacta:** Soporte técnico con los logs

---

## 📚 ARCHIVOS DE REFERENCIA

- **Técnico completo:** `DEPLOYMENT-FIX.md`
- **Checklist rápido:** `CHECKLIST-RAPIDO.md`
- **Guía visual:** `GUIA-VISUAL.md`
- **Para cliente:** `RESUMEN-PARA-CLIENTE.md`
- **Este archivo:** `SOLUCION-COMPLETA.md`

---

**Fecha:** 15 Enero 2026  
**Estado:** Código actualizado ✅ | Requiere configuración  
**Prioridad:** Alta  
**Complejidad:** Baja (solo configuración)  
**Tiempo estimado:** 15-20 minutos
