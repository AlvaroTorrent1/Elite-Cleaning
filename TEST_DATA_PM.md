# 🧪 Datos de Prueba - Panel Property Manager

## 1. Crear Property Manager de Prueba

```sql
-- Primero, inicia sesión con Google OAuth en la app
-- Luego, actualiza el perfil del usuario con este SQL:

UPDATE profiles 
SET 
  role = 'property_manager',
  is_approved = true,
  full_name = 'María García (PM Test)'
WHERE email = 'TU_EMAIL_AQUI@gmail.com';
```

## 2. Asignar Propiedades al PM

```sql
-- Obtener el ID del PM (reemplaza el email)
DO $$
DECLARE
  pm_id UUID;
BEGIN
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  
  -- Asignar propiedades existentes al PM
  UPDATE properties 
  SET property_manager_id = pm_id
  WHERE name IN ('Villa Marbella', 'Apartamento Centro');
  
  RAISE NOTICE 'Propiedades asignadas al PM: %', pm_id;
END $$;
```

## 3. Crear Limpiezas de Prueba para el PM

```sql
-- Limpiezas variadas para testing
DO $$
DECLARE
  pm_id UUID;
  property_id_1 UUID;
  property_id_2 UUID;
  cleaner_id UUID;
  cleaning_type_standard UUID;
  cleaning_type_deep UUID;
BEGIN
  -- Obtener IDs necesarios
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  SELECT id INTO property_id_1 FROM properties WHERE name = 'Villa Marbella' LIMIT 1;
  SELECT id INTO property_id_2 FROM properties WHERE name = 'Apartamento Centro' LIMIT 1;
  SELECT id INTO cleaner_id FROM profiles WHERE role = 'cleaner' LIMIT 1;
  SELECT id INTO cleaning_type_standard FROM cleaning_types WHERE slug = 'estandar' LIMIT 1;
  SELECT id INTO cleaning_type_deep FROM cleaning_types WHERE slug = 'profunda' LIMIT 1;
  
  -- Limpieza 1: Pendiente, generada por iCal (cancelable)
  INSERT INTO cleanings (
    property_id,
    cleaner_id,
    cleaning_type_id,
    status,
    scheduled_date,
    scheduled_time,
    is_manual,
    ical_event_uid,
    is_urgent
  ) VALUES (
    property_id_1,
    cleaner_id,
    cleaning_type_standard,
    'pending',
    CURRENT_DATE + INTERVAL '2 days',
    '10:00',
    false,
    'ical-test-001',
    false
  );
  
  -- Limpieza 2: Asignada, generada por iCal (cancelable)
  INSERT INTO cleanings (
    property_id,
    cleaner_id,
    cleaning_type_id,
    status,
    scheduled_date,
    scheduled_time,
    is_manual,
    ical_event_uid,
    is_urgent
  ) VALUES (
    property_id_2,
    cleaner_id,
    cleaning_type_standard,
    'assigned',
    CURRENT_DATE + INTERVAL '3 days',
    '14:00',
    false,
    'ical-test-002',
    true
  );
  
  -- Limpieza 3: En curso, manual (NO cancelable)
  INSERT INTO cleanings (
    property_id,
    cleaner_id,
    cleaning_type_id,
    status,
    scheduled_date,
    scheduled_time,
    is_manual,
    started_at
  ) VALUES (
    property_id_1,
    cleaner_id,
    cleaning_type_deep,
    'in_progress',
    CURRENT_DATE,
    '09:00',
    true,
    NOW() - INTERVAL '1 hour'
  );
  
  -- Limpieza 4: Completada (para histórico)
  INSERT INTO cleanings (
    property_id,
    cleaner_id,
    cleaning_type_id,
    status,
    scheduled_date,
    scheduled_time,
    is_manual,
    started_at,
    completed_at,
    notes
  ) VALUES (
    property_id_2,
    cleaner_id,
    cleaning_type_standard,
    'completed',
    CURRENT_DATE - INTERVAL '2 days',
    '11:00',
    false,
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '11 hours',
    CURRENT_DATE - INTERVAL '2 days' + INTERVAL '14 hours',
    'Limpieza completada sin incidencias'
  );
  
  -- Limpieza 5: Cancelada (para histórico)
  INSERT INTO cleanings (
    property_id,
    cleaner_id,
    cleaning_type_id,
    status,
    scheduled_date,
    scheduled_time,
    is_manual,
    ical_event_uid
  ) VALUES (
    property_id_1,
    cleaner_id,
    cleaning_type_standard,
    'cancelled',
    CURRENT_DATE - INTERVAL '5 days',
    '10:00',
    false,
    'ical-test-cancelled'
  );
  
  RAISE NOTICE 'Limpiezas de prueba creadas para PM';
END $$;
```

## 4. Crear Reportes de Daños

```sql
DO $$
DECLARE
  pm_id UUID;
  cleaning_id_test UUID;
  cleaner_id UUID;
  damage_item_1 UUID;
  damage_item_2 UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  SELECT id INTO cleaner_id FROM profiles WHERE role = 'cleaner' LIMIT 1;
  
  -- Obtener una limpieza completada del PM
  SELECT c.id INTO cleaning_id_test 
  FROM cleanings c
  JOIN properties p ON c.property_id = p.id
  WHERE p.property_manager_id = pm_id
  AND c.status = 'completed'
  LIMIT 1;
  
  -- Obtener items del catálogo
  SELECT id INTO damage_item_1 FROM damage_catalog WHERE name = 'Toalla' LIMIT 1;
  SELECT id INTO damage_item_2 FROM damage_catalog WHERE name = 'Sábana' LIMIT 1;
  
  -- Reporte 1: Daño pendiente de revisar
  INSERT INTO damage_reports (
    cleaning_id,
    damage_item_id,
    estimated_cost,
    image_url,
    reported_by,
    acknowledged_by_admin,
    acknowledged_by_pm
  ) VALUES (
    cleaning_id_test,
    damage_item_1,
    15.00,
    'https://placehold.co/600x400/ef4444/ffffff?text=Toalla+Dañada',
    cleaner_id,
    false,
    false
  );
  
  -- Reporte 2: Daño ya revisado
  INSERT INTO damage_reports (
    cleaning_id,
    damage_item_id,
    estimated_cost,
    image_url,
    reported_by,
    acknowledged_by_admin,
    acknowledged_by_pm
  ) VALUES (
    cleaning_id_test,
    damage_item_2,
    25.00,
    'https://placehold.co/600x400/ef4444/ffffff?text=Sábana+Manchada',
    cleaner_id,
    true,
    true
  );
  
  RAISE NOTICE 'Reportes de daños creados';
END $$;
```

## 5. Crear Reportes de Objetos Perdidos

```sql
DO $$
DECLARE
  pm_id UUID;
  cleaning_id_test UUID;
  cleaner_id UUID;
BEGIN
  -- Obtener IDs
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  SELECT id INTO cleaner_id FROM profiles WHERE role = 'cleaner' LIMIT 1;
  
  -- Obtener una limpieza completada del PM
  SELECT c.id INTO cleaning_id_test 
  FROM cleanings c
  JOIN properties p ON c.property_id = p.id
  WHERE p.property_manager_id = pm_id
  AND c.status = 'completed'
  LIMIT 1;
  
  -- Reporte 1: Objeto sin revisar
  INSERT INTO lost_item_reports (
    cleaning_id,
    description,
    image_url,
    reported_by,
    acknowledged_by_admin,
    acknowledged_by_pm
  ) VALUES (
    cleaning_id_test,
    'Reloj de pulsera dorado encontrado en mesita de noche',
    'https://placehold.co/600x400/f59e0b/ffffff?text=Reloj+Dorado',
    cleaner_id,
    false,
    false
  );
  
  -- Reporte 2: Objeto ya revisado
  INSERT INTO lost_item_reports (
    cleaning_id,
    description,
    image_url,
    reported_by,
    acknowledged_by_admin,
    acknowledged_by_pm
  ) VALUES (
    cleaning_id_test,
    'Cargador de móvil iPhone encontrado detrás del sofá',
    'https://placehold.co/600x400/f59e0b/ffffff?text=Cargador+iPhone',
    cleaner_id,
    true,
    true
  );
  
  RAISE NOTICE 'Reportes de objetos perdidos creados';
END $$;
```

## 6. Script Todo-en-Uno (Ejecutar en orden)

```sql
-- ========================================
-- SCRIPT COMPLETO DE TESTING - PANEL PM
-- ========================================
-- IMPORTANTE: Reemplaza 'TU_EMAIL_AQUI@gmail.com' con tu email real

-- Paso 1: Actualizar perfil a PM
UPDATE profiles 
SET 
  role = 'property_manager',
  is_approved = true,
  full_name = 'María García (PM Test)'
WHERE email = 'TU_EMAIL_AQUI@gmail.com';

-- Paso 2: Asignar propiedades
DO $$
DECLARE
  pm_id UUID;
BEGIN
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  
  UPDATE properties 
  SET property_manager_id = pm_id
  WHERE name IN ('Villa Marbella', 'Apartamento Centro');
  
  RAISE NOTICE 'PM ID: %', pm_id;
END $$;

-- Paso 3: Crear limpiezas de prueba
DO $$
DECLARE
  pm_id UUID;
  property_id_1 UUID;
  cleaner_id UUID;
  cleaning_type_id UUID;
BEGIN
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  SELECT id INTO property_id_1 FROM properties WHERE property_manager_id = pm_id LIMIT 1;
  SELECT id INTO cleaner_id FROM profiles WHERE role = 'cleaner' LIMIT 1;
  SELECT id INTO cleaning_type_id FROM cleaning_types WHERE slug = 'estandar' LIMIT 1;
  
  -- Limpieza cancelable (iCal, pending)
  INSERT INTO cleanings (property_id, cleaner_id, cleaning_type_id, status, scheduled_date, scheduled_time, is_manual, ical_event_uid)
  VALUES (property_id_1, cleaner_id, cleaning_type_id, 'pending', CURRENT_DATE + 2, '10:00', false, 'ical-001');
  
  -- Limpieza en curso (manual)
  INSERT INTO cleanings (property_id, cleaner_id, cleaning_type_id, status, scheduled_date, scheduled_time, is_manual, started_at)
  VALUES (property_id_1, cleaner_id, cleaning_type_id, 'in_progress', CURRENT_DATE, '09:00', true, NOW() - INTERVAL '1 hour');
  
  -- Limpieza completada
  INSERT INTO cleanings (property_id, cleaner_id, cleaning_type_id, status, scheduled_date, scheduled_time, is_manual, completed_at)
  VALUES (property_id_1, cleaner_id, cleaning_type_id, 'completed', CURRENT_DATE - 2, '11:00', false, CURRENT_DATE - INTERVAL '2 days' + INTERVAL '14 hours');
  
  RAISE NOTICE 'Limpiezas creadas';
END $$;

-- Paso 4: Crear reportes
DO $$
DECLARE
  cleaning_id_test UUID;
  cleaner_id UUID;
  damage_item_id UUID;
BEGIN
  SELECT id INTO cleaner_id FROM profiles WHERE role = 'cleaner' LIMIT 1;
  SELECT id INTO damage_item_id FROM damage_catalog LIMIT 1;
  
  SELECT c.id INTO cleaning_id_test 
  FROM cleanings c
  JOIN properties p ON c.property_id = p.id
  JOIN profiles pm ON p.property_manager_id = pm.id
  WHERE pm.email = 'TU_EMAIL_AQUI@gmail.com'
  AND c.status = 'completed'
  LIMIT 1;
  
  -- Daño sin revisar
  INSERT INTO damage_reports (cleaning_id, damage_item_id, estimated_cost, image_url, reported_by, acknowledged_by_pm)
  VALUES (cleaning_id_test, damage_item_id, 15.00, 'https://placehold.co/600x400/ef4444/ffffff?text=Daño', cleaner_id, false);
  
  -- Objeto perdido sin revisar
  INSERT INTO lost_item_reports (cleaning_id, description, image_url, reported_by, acknowledged_by_pm)
  VALUES (cleaning_id_test, 'Reloj dorado', 'https://placehold.co/600x400/f59e0b/ffffff?text=Reloj', cleaner_id, false);
  
  RAISE NOTICE 'Reportes creados';
END $$;
```

## 7. Verificación

```sql
-- Verificar que todo se creó correctamente

-- 1. Verificar PM
SELECT id, email, full_name, role, is_approved 
FROM profiles 
WHERE email = 'TU_EMAIL_AQUI@gmail.com';

-- 2. Verificar propiedades asignadas
SELECT p.id, p.name, p.address, pm.full_name as property_manager
FROM properties p
JOIN profiles pm ON p.property_manager_id = pm.id
WHERE pm.email = 'TU_EMAIL_AQUI@gmail.com';

-- 3. Verificar limpiezas
SELECT 
  c.id,
  p.name as property,
  c.status,
  c.scheduled_date,
  c.is_manual,
  c.ical_event_uid
FROM cleanings c
JOIN properties p ON c.property_id = p.id
JOIN profiles pm ON p.property_manager_id = pm.id
WHERE pm.email = 'TU_EMAIL_AQUI@gmail.com'
ORDER BY c.scheduled_date DESC;

-- 4. Verificar reportes de daños
SELECT 
  dr.id,
  p.name as property,
  dc.name as item,
  dr.estimated_cost,
  dr.acknowledged_by_pm
FROM damage_reports dr
JOIN cleanings c ON dr.cleaning_id = c.id
JOIN properties p ON c.property_id = p.id
JOIN profiles pm ON p.property_manager_id = pm.id
LEFT JOIN damage_catalog dc ON dr.damage_item_id = dc.id
WHERE pm.email = 'TU_EMAIL_AQUI@gmail.com';

-- 5. Verificar objetos perdidos
SELECT 
  lir.id,
  p.name as property,
  lir.description,
  lir.acknowledged_by_pm
FROM lost_item_reports lir
JOIN cleanings c ON lir.cleaning_id = c.id
JOIN properties p ON c.property_id = p.id
JOIN profiles pm ON p.property_manager_id = pm.id
WHERE pm.email = 'TU_EMAIL_AQUI@gmail.com';
```

## 8. Limpiar Datos de Prueba (cuando termines)

```sql
-- ⚠️ CUIDADO: Esto eliminará todos los datos de prueba

DO $$
DECLARE
  pm_id UUID;
BEGIN
  SELECT id INTO pm_id FROM profiles WHERE email = 'TU_EMAIL_AQUI@gmail.com';
  
  -- Eliminar reportes
  DELETE FROM damage_reports 
  WHERE cleaning_id IN (
    SELECT c.id FROM cleanings c
    JOIN properties p ON c.property_id = p.id
    WHERE p.property_manager_id = pm_id
  );
  
  DELETE FROM lost_item_reports 
  WHERE cleaning_id IN (
    SELECT c.id FROM cleanings c
    JOIN properties p ON c.property_id = p.id
    WHERE p.property_manager_id = pm_id
  );
  
  -- Eliminar limpiezas
  DELETE FROM cleanings 
  WHERE property_id IN (
    SELECT id FROM properties WHERE property_manager_id = pm_id
  );
  
  -- Desasignar propiedades
  UPDATE properties SET property_manager_id = NULL WHERE property_manager_id = pm_id;
  
  -- Opcional: Volver a rol cleaner
  -- UPDATE profiles SET role = 'cleaner' WHERE id = pm_id;
  
  RAISE NOTICE 'Datos de prueba eliminados';
END $$;
```

---

## 🎯 Checklist de Testing

### Dashboard (`/pm`)
- [ ] Ver estadísticas correctas (propiedades, limpiezas, daños, objetos)
- [ ] Click en "Solicitar Limpieza" redirige a formulario
- [ ] Cards de propiedades muestran información correcta
- [ ] Indicador de iCal funciona

### Limpiezas (`/pm/limpiezas`)
- [ ] Filtro por estado funciona
- [ ] Filtro por fecha funciona
- [ ] Filtro por propiedad funciona
- [ ] Botón "Limpiar" resetea filtros
- [ ] Botón de cancelación solo aparece en limpiezas iCal pendientes/asignadas
- [ ] Cancelar limpieza funciona y actualiza estado

### Nueva Limpieza (`/pm/nueva-limpieza`)
- [ ] Formulario valida campos obligatorios
- [ ] Selección de extras funciona
- [ ] Crear limpieza redirige a lista
- [ ] Limpieza aparece con `is_manual: true`

### Daños (`/pm/danos`)
- [ ] Estadísticas correctas
- [ ] Cards muestran imagen, item, precio
- [ ] Borde rojo en reportes sin revisar
- [ ] "Marcar como Revisado" actualiza estado
- [ ] Borde cambia a gris tras revisar

### Objetos Perdidos (`/pm/objetos-perdidos`)
- [ ] Estadísticas correctas
- [ ] Cards muestran imagen y descripción
- [ ] Borde ámbar en reportes sin revisar
- [ ] "Marcar como Revisado" actualiza estado

### Histórico (`/pm/historico`)
- [ ] Muestra limpiezas de últimos 30 días
- [ ] Estadísticas correctas
- [ ] Timeline ordenado por fecha
- [ ] Badges de estado correctos

---

**Creado:** 9 de Enero de 2026  
**Propósito:** Facilitar testing del Panel PM
