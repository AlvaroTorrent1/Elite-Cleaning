# Preguntas Pendientes para el Cliente

> Este archivo contiene preguntas que surgieron durante el análisis y desarrollo del proyecto.
> Cada pregunta resuelta debe marcarse con ✅ y documentar la respuesta.

---

## 🔴 Alta Prioridad

### 1. Política de Cobro por Modificaciones de Última Hora
**Contexto:** Si una reserva se modifica en Airbnb/Booking después de que la limpieza ya fue asignada.

**Pregunta:** 
- Si la modificación ocurre con menos de X horas de anticipación, ¿se cobra desplazamiento?
- ¿Cuál es el umbral de tiempo? (ej: 2 horas, 6 horas, 24 horas)
- ¿Cuánto se cobra por desplazamiento?

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

### 2. Hosting Actual y Acceso al Dominio
**Contexto:** Desarrollaremos la app de forma independiente y la conectaremos al dominio más adelante.

**Preguntas:**
- ¿Dónde está alojada actualmente la web de WordPress? (Hostinger, SiteGround, otro?)
- ¿Quién tiene acceso al panel de control del hosting?
- ¿Quién gestiona el dominio myelitecleaning.com? (registrador: GoDaddy, Namecheap, etc.)
- ¿Hay preferencia de migrar todo el hosting a nuestra gestión?

**Plan actual:** 
- Desarrollar la app en Vercel con dominio temporal
- Conectar al dominio del cliente cuando tengamos acceso
- Posible migración completa del hosting

**Estado:** ⏳ Pendiente - Necesario antes del despliegue a producción  
**Respuesta:** 

---

## 🟡 Media Prioridad

### 3. Precios de Limpiezas Manuales
**Contexto:** Los PM pueden solicitar limpiezas que no vienen de iCal (limpieza puntual).

**Pregunta:** ¿Tienen un precio diferente o se facturan igual que las automáticas?

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

### 4. Información de Acceso a Propiedades
**Pregunta:** ¿Qué información específica de acceso necesitan las limpiadoras?
- ¿Código de entrada?
- ¿Ubicación de llaves?
- ¿Contacto del portero/conserje?
- ¿Instrucciones especiales para complejos grandes?

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

## 🟢 Baja Prioridad (Futuras Fases)

### 5. Objetos Perdidos - Proceso de Reclamación
**Contexto:** Actualmente solo reportamos en el panel. 

**Pregunta:** ¿A futuro necesitaremos un sistema donde el huésped pueda reclamar sus objetos? (ej: formulario público, tracking de envío)

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

### 6. Métricas y Dashboards
**Contexto:** No están en el MVP, pero tenemos los datos.

**Pregunta:** ¿Qué métricas serían útiles a futuro?
- Tiempo promedio de limpieza por propiedad
- Rendimiento por limpiadora
- Tasa de incidencias
- Estadísticas de ocupación

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

### 7. Multi-idioma
**Contexto:** Iniciamos solo en español, operando en Málaga.

**Pregunta:** ¿Hay planes de expansión que requieran inglés u otros idiomas?

**Estado:** ⏳ Pendiente  
**Respuesta:** 

---

## ✅ Resueltas

### ✅ Subdominio vs Ruta
**Pregunta:** ¿Subdominio (app.myelitecleaning.com) o ruta (/app)?  
**Respuesta:** **Ruta (/app)** - Nos haremos con el código del dominio del cliente.  
**Fecha:** 8 de Enero de 2026

---

### ✅ Registro de Property Managers
**Pregunta:** ¿Los PM se auto-registran o los crea el admin?  
**Respuesta:** **Auto-registro** - Los PM se registran solos, el admin aprueba la cuenta.  
**Fecha:** 8 de Enero de 2026

---

**Última actualización:** 8 de Enero de 2026
