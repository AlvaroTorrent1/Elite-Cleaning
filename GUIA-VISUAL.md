# 📸 Guía Visual - Configuración OAuth

Esta guía te muestra exactamente dónde hacer cada configuración.

---

## 🟣 PARTE 1: VERCEL

### Paso 1: Ir a Environment Variables

```
Vercel Dashboard
└── Tu Proyecto (elite-cleaning)
    └── Settings (pestaña superior)
        └── Environment Variables (menú lateral izquierdo)
```

**Lo que verás:**
- Una lista de variables existentes (si las hay)
- Botón "Add New" en la esquina superior derecha

### Paso 2: Añadir Variable

Click en **"Add New"** y verás un formulario con:

```
┌─────────────────────────────────────────────┐
│ Name                                        │
│ [NEXT_PUBLIC_SITE_URL              ]       │
│                                             │
│ Value                                       │
│ [https://tu-app.vercel.app         ]       │
│                                             │
│ Environment                                 │
│ ☑ Production                               │
│ ☑ Preview                                  │
│ ☑ Development                              │
│                                             │
│         [Cancel]  [Save]                   │
└─────────────────────────────────────────────┘
```

**IMPORTANTE:**
- ✅ Marca las 3 opciones (Production, Preview, Development)
- ✅ Usa tu URL real de Vercel
- ✅ Incluye `https://` al inicio
- ❌ NO pongas `/` al final

### Paso 3: Verificar

Después de guardar, deberías ver:

```
Environment Variables
┌────────────────────────────────────────────────────┐
│ NEXT_PUBLIC_SITE_URL                              │
│ https://elite-cleaning.vercel.app                 │
│ Production, Preview, Development                   │
│                                          [Edit]    │
└────────────────────────────────────────────────────┘
```

---

## 🟢 PARTE 2: SUPABASE

### Paso 1: Ir a Authentication

```
Supabase Dashboard
└── Tu Proyecto (Elite_Cleaning)
    └── Authentication (icono de escudo en menú lateral)
        └── URL Configuration (pestaña superior)
```

### Paso 2: Configurar Site URL

Verás un formulario como este:

```
┌─────────────────────────────────────────────┐
│ Site URL                                    │
│ [https://tu-app.vercel.app         ]       │
│                                             │
│ The base URL of your website. Used as an   │
│ allow-list for redirects and for           │
│ constructing URLs used in emails.          │
└─────────────────────────────────────────────┘
```

**Pon aquí:** Tu URL de Vercel (ej: `https://elite-cleaning.vercel.app`)

### Paso 3: Configurar Redirect URLs

Más abajo verás:

```
┌─────────────────────────────────────────────┐
│ Redirect URLs                               │
│ [                                    ]     │
│                                             │
│ A list of exact URLs or wildcard patterns  │
│ that auth providers are permitted to       │
│ redirect to post authentication.           │
│                                             │
│ Separate multiple URLs with commas.        │
└─────────────────────────────────────────────┘
```

**Añade estas URLs (separadas por comas o líneas):**

```
https://elite-cleaning.vercel.app/auth/callback,
https://*.vercel.app/auth/callback,
http://localhost:3000/auth/callback
```

**NOTA:** Reemplaza `elite-cleaning.vercel.app` con tu URL real.

### Paso 4: Guardar

Al final de la página verás:

```
[Cancel]  [Save]
```

Click en **Save**.

### Paso 5: Verificar

Después de guardar, deberías ver:

```
✅ Successfully updated settings
```

---

## 🔄 PARTE 3: RE-DEPLOY

### Opción A: Desde Vercel Dashboard

```
Vercel Dashboard
└── Tu Proyecto
    └── Deployments (pestaña superior)
        └── [Tu último deployment]
            └── ⋮ (tres puntos)
                └── Redeploy
```

Verás un modal:

```
┌─────────────────────────────────────────────┐
│ Redeploy to Production?                     │
│                                             │
│ This will create a new deployment with     │
│ the same source code.                      │
│                                             │
│ ☐ Use existing Build Cache                │
│                                             │
│         [Cancel]  [Redeploy]               │
└─────────────────────────────────────────────┘
```

Click en **Redeploy**.

### Opción B: Desde Git

En tu terminal:

```bash
# Ver el estado actual
git status

# Añadir todos los cambios
git add .

# Crear commit
git commit -m "fix: OAuth redirect configuration"

# Subir a GitHub/GitLab
git push
```

Vercel detectará el push automáticamente y empezará a desplegar.

---

## ✅ PARTE 4: VERIFICACIÓN

### Ver el Progreso del Deploy

```
Vercel Dashboard
└── Tu Proyecto
    └── Deployments
        └── [Building...] ← Espera a que cambie a "Ready"
```

Estados posibles:
- 🔵 **Building** - Construyendo la app (1-2 min)
- 🟢 **Ready** - Listo y desplegado
- 🔴 **Error** - Algo falló (revisa los logs)

### Probar la App

1. Cuando esté **Ready**, click en el deployment
2. Click en **Visit** (o copia la URL)
3. En la app:
   - Click en cualquier botón "Acceder con Google"
   - Completa el login con Google
   - **Verifica:** ¿Te quedas en tu dominio de Vercel?

**✅ ÉXITO:** Si después del login sigues en `https://tu-app.vercel.app/admin` (o /limpiadora, /pm)

**❌ PROBLEMA:** Si te redirige a `http://localhost:3000/...`

---

## 🐛 TROUBLESHOOTING VISUAL

### Ver Logs en Vercel

```
Vercel Dashboard
└── Tu Proyecto
    └── Deployments
        └── [Tu deployment]
            └── Runtime Logs (pestaña)
```

Busca líneas que contengan:
- `redirect`
- `callback`
- `origin`
- `error`

### Ver Logs en Supabase

```
Supabase Dashboard
└── Tu Proyecto
    └── Logs (menú lateral)
        └── Auth Logs (pestaña)
```

Busca errores relacionados con:
- `redirect_uri`
- `invalid_request`
- `unauthorized`

---

## 📝 RESUMEN DE UBICACIONES

### Variables que Configurar:

| Dónde | Qué | Valor |
|-------|-----|-------|
| Vercel → Settings → Environment Variables | `NEXT_PUBLIC_SITE_URL` | `https://tu-app.vercel.app` |
| Supabase → Auth → URL Config | Site URL | `https://tu-app.vercel.app` |
| Supabase → Auth → URL Config | Redirect URLs | Ver lista arriba |

### Archivos Modificados (ya hechos):

- ✅ `src/app/auth/callback/route.ts` - Lógica de redirect corregida
- ✅ `package.json` - Script de verificación añadido
- ✅ `scripts/verify-deployment.js` - Script de verificación creado

---

**Última actualización:** 15 Enero 2026
