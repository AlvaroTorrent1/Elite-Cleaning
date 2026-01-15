# 🏠 Elite Cleaning - Sistema de Gestión

Sistema de gestión de limpiezas para propiedades vacacionales en Málaga, España.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build para producción
npm run build

# Verificar configuración
npm run verify
```

## 📚 Documentación

### Configuración y Deployment

- **[SOLUCION-COMPLETA.md](./SOLUCION-COMPLETA.md)** - Overview completo del proyecto y soluciones
- **[DEPLOYMENT-FIX.md](./DEPLOYMENT-FIX.md)** - Guía técnica completa de deployment
- **[CHECKLIST-RAPIDO.md](./CHECKLIST-RAPIDO.md)** - Checklist de 15 minutos para deployment
- **[GUIA-VISUAL.md](./GUIA-VISUAL.md)** - Guía visual paso a paso
- **[RESUMEN-PARA-CLIENTE.md](./RESUMEN-PARA-CLIENTE.md)** - Resumen ejecutivo

### Información del Proyecto

- **[TO-ASK/preguntas-cliente.md](./TO-ASK/preguntas-cliente.md)** - Preguntas y decisiones del cliente

## 🛠️ Tech Stack

- **Frontend:** Next.js 14+ (App Router)
- **UI:** shadcn/ui + Tailwind CSS
- **Backend:** Supabase (Auth, Database, Storage, Realtime)
- **State:** TanStack Query v5
- **Language:** TypeScript (strict mode)
- **Deployment:** Vercel

## 🔐 Roles de Usuario

1. **Admin** - Acceso completo al sistema
2. **Limpiadora** - Acceso a agenda y checklists
3. **Property Manager** - Gestión de propiedades

## 🌐 URLs Importantes

- **Supabase Dashboard:** https://supabase.com/dashboard/project/oaysmidoxtyykhqrpzai
- **Supabase API:** https://oaysmidoxtyykhqrpzai.supabase.co
- **Vercel Dashboard:** https://vercel.com/dashboard

## 🔧 Configuración

### Variables de Entorno Requeridas

```env
NEXT_PUBLIC_SUPABASE_URL=https://oaysmidoxtyykhqrpzai.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Verificar Configuración

```bash
npm run verify
```

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   │   ├── admin/         # Panel de administrador
│   │   ├── cleaner/       # Panel de limpiadora
│   │   └── pm/            # Panel de property manager
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── shared/            # Componentes compartidos
│   └── features/          # Componentes por feature
├── lib/
│   ├── supabase/          # Clientes de Supabase
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utilidades
│   └── types/             # TypeScript types
└── styles/                # Estilos globales
```

## 🐛 Troubleshooting

### OAuth Redirect a Localhost

Si después del login con Google redirige a localhost en producción:

1. Lee: [CHECKLIST-RAPIDO.md](./CHECKLIST-RAPIDO.md)
2. Configura `NEXT_PUBLIC_SITE_URL` en Vercel
3. Configura URLs en Supabase
4. Re-deploy

### Verificar Logs

**Vercel:**
```
Dashboard → Deployments → [Deployment] → Runtime Logs
```

**Supabase:**
```
Dashboard → Logs → Auth Logs
```

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter
- `npm run verify` - Verificar configuración

## 🌍 Idioma

- **UI:** Español (Málaga, España)
- **Código:** Inglés
- **Comentarios:** Inglés
- **Timezone:** Europe/Madrid

## 📞 Soporte

- **Email:** info@myelitecleaning.com
- **Documentación:** Ver archivos en la raíz del proyecto

---

**Última actualización:** 15 Enero 2026  
**Versión:** 0.1.0  
**Estado:** En desarrollo activo
