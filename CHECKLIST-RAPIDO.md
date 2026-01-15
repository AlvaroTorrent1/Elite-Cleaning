# ✅ Checklist Rápido - Arreglar OAuth Redirect

## 🎯 OBJETIVO
Arreglar el redirect a localhost después del login con Google en producción.

## 📋 PASOS A SEGUIR (15 minutos)

### 1️⃣ Obtener tu URL de Vercel (2 min)

Ve a tu dashboard de Vercel y copia la URL de tu app:
- https://vercel.com/dashboard
- Busca tu proyecto "elite-cleaning" (o similar)
- Copia la URL de producción (ej: `https://elite-cleaning.vercel.app`)

**Tu URL es:** `_______________________________`

---

### 2️⃣ Configurar Variable en Vercel (3 min)

1. En Vercel Dashboard → Tu Proyecto → **Settings**
2. Click en **Environment Variables** (menú lateral)
3. Click en **Add New**
4. Configura:
   ```
   Name: NEXT_PUBLIC_SITE_URL
   Value: https://tu-url-de-vercel.vercel.app
   Environment: ✅ Production ✅ Preview ✅ Development
   ```
5. Click **Save**

**✅ Completado:** ☐

---

### 3️⃣ Configurar Supabase (5 min)

1. Ve a: https://supabase.com/dashboard/project/oaysmidoxtyykhqrpzai
2. Click en **Authentication** (menú lateral)
3. Click en **URL Configuration**
4. En **Site URL**, pon:
   ```
   https://tu-url-de-vercel.vercel.app
   ```
5. En **Redirect URLs**, añade (uno por línea o separado por comas):
   ```
   https://tu-url-de-vercel.vercel.app/auth/callback
   https://*.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
6. Click **Save** al final de la página

**✅ Completado:** ☐

---

### 4️⃣ Re-deploy en Vercel (3 min)

**Opción A - Desde Vercel Dashboard:**
1. Ve a **Deployments**
2. Click en los **3 puntos** (⋮) del último deployment
3. Click **Redeploy**
4. Espera 2-3 minutos

**Opción B - Desde Git:**
```bash
git add .
git commit -m "fix: OAuth redirect configuration"
git push
```

**✅ Completado:** ☐

---

### 5️⃣ Verificar que Funciona (2 min)

1. Abre tu app en producción: `https://tu-url.vercel.app`
2. Click en "Acceder con Google" (cualquier rol)
3. Completa el login con Google
4. **Verifica:** ¿Te redirige a tu dominio de Vercel? (no a localhost)

**✅ Funciona correctamente:** ☐

---

## 🐛 Si NO Funciona

### Verificación Local
```bash
npm run verify
```

Este comando verificará tu configuración local.

### Verificar en Vercel
1. Ve a Vercel Dashboard → Deployments
2. Click en el último deployment
3. Click en **Runtime Logs**
4. Busca errores relacionados con "redirect" o "callback"

### Verificar Variables de Entorno
```bash
# En tu terminal
vercel env pull .env.local
cat .env.local | grep SITE_URL
```

Deberías ver:
```
NEXT_PUBLIC_SITE_URL="https://tu-url.vercel.app"
```

---

## 📞 AYUDA

Si después de seguir todos los pasos sigue sin funcionar:

1. Lee el archivo completo: `DEPLOYMENT-FIX.md`
2. Revisa la sección de Troubleshooting
3. Verifica los logs en Vercel

---

## 📝 NOTAS

- ✅ El código ya está actualizado
- ⚙️ Solo necesitas configurar las variables de entorno
- 🔐 Asegúrate de usar HTTPS (no HTTP) en producción
- 🌐 Usa tu URL real de Vercel, no ejemplos

---

**Última actualización:** 15 Enero 2026
