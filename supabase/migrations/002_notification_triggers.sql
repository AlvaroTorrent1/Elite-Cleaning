-- =====================================================
-- ADDITIONAL NOTIFICATION TRIGGERS
-- Version: 1.1
-- Date: 2026-01-15
-- =====================================================

-- =====================================================
-- 1. TRIGGER: Notificar cuando se asigna una limpieza
-- =====================================================
CREATE OR REPLACE FUNCTION notify_cleaning_assigned()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name TEXT;
BEGIN
  -- Solo notificar cuando se asigna un cleaner (antes era null, ahora tiene valor)
  IF NEW.cleaner_id IS NOT NULL AND (OLD.cleaner_id IS NULL OR OLD.cleaner_id != NEW.cleaner_id) THEN
    -- Obtener nombre de la propiedad
    SELECT name INTO v_property_name
    FROM properties
    WHERE id = NEW.property_id;

    -- Notificar a la limpiadora
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.cleaner_id,
      'cleaning_assigned',
      'Nueva limpieza asignada',
      'Se te ha asignado una limpieza en ' || v_property_name || ' para el ' || TO_CHAR(NEW.scheduled_date, 'DD/MM/YYYY'),
      jsonb_build_object(
        'cleaning_id', NEW.id, 
        'property_id', NEW.property_id,
        'scheduled_date', NEW.scheduled_date,
        'is_urgent', NEW.is_urgent
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_cleaning_assigned ON cleanings;

CREATE TRIGGER on_cleaning_assigned
  AFTER UPDATE ON cleanings
  FOR EACH ROW EXECUTE FUNCTION notify_cleaning_assigned();

-- =====================================================
-- 2. TRIGGER: Notificar limpieza urgente al admin
-- =====================================================
CREATE OR REPLACE FUNCTION notify_urgent_cleaning()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name TEXT;
BEGIN
  -- Notificar cuando una limpieza se marca como urgente
  IF NEW.is_urgent = true AND (OLD.is_urgent = false OR OLD IS NULL) THEN
    -- Obtener nombre de la propiedad
    SELECT name INTO v_property_name
    FROM properties
    WHERE id = NEW.property_id;

    -- Notificar a todos los admins
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
      id,
      'urgent_cleaning',
      '⚠️ Limpieza URGENTE',
      'Limpieza urgente en ' || v_property_name || ' para el ' || TO_CHAR(NEW.scheduled_date, 'DD/MM/YYYY'),
      jsonb_build_object(
        'cleaning_id', NEW.id, 
        'property_id', NEW.property_id,
        'scheduled_date', NEW.scheduled_date
      )
    FROM profiles WHERE role = 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_urgent_cleaning ON cleanings;

CREATE TRIGGER on_urgent_cleaning
  AFTER INSERT OR UPDATE ON cleanings
  FOR EACH ROW EXECUTE FUNCTION notify_urgent_cleaning();

-- =====================================================
-- 3. TRIGGER: Notificar cuando un PM es aprobado
-- =====================================================
CREATE OR REPLACE FUNCTION notify_pm_approved()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar cuando un PM cambia de no aprobado a aprobado
  IF NEW.role = 'property_manager' 
     AND NEW.is_approved = true 
     AND OLD.is_approved = false THEN
    
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      NEW.id,
      'pm_approved',
      '¡Cuenta aprobada!',
      'Tu cuenta ha sido aprobada. Ya puedes acceder a todas las funcionalidades.',
      jsonb_build_object('approved_at', NOW())
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_pm_approved ON profiles;

CREATE TRIGGER on_pm_approved
  AFTER UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_pm_approved();

-- =====================================================
-- 4. TRIGGER: Notificar al admin cuando hay nuevo PM pendiente
-- =====================================================
CREATE OR REPLACE FUNCTION notify_new_pm_pending()
RETURNS TRIGGER AS $$
BEGIN
  -- Notificar cuando un nuevo PM se registra (pendiente de aprobación)
  IF NEW.role = 'property_manager' AND NEW.is_approved = false THEN
    
    INSERT INTO notifications (user_id, type, title, message, data)
    SELECT 
      id,
      'new_pm_pending',
      'Nuevo Property Manager pendiente',
      NEW.full_name || ' (' || NEW.email || ') ha solicitado acceso como Property Manager.',
      jsonb_build_object('pm_id', NEW.id, 'email', NEW.email, 'full_name', NEW.full_name)
    FROM profiles WHERE role = 'admin';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_new_pm_pending ON profiles;

CREATE TRIGGER on_new_pm_pending
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION notify_new_pm_pending();

-- =====================================================
-- 5. TRIGGER: Notificar cuando una limpieza cambia de estado
-- =====================================================
CREATE OR REPLACE FUNCTION notify_cleaning_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_property_name TEXT;
  v_property_manager_id UUID;
BEGIN
  -- Solo si el estado cambió
  IF OLD.status != NEW.status THEN
    -- Obtener info de la propiedad
    SELECT name, property_manager_id 
    INTO v_property_name, v_property_manager_id
    FROM properties
    WHERE id = NEW.property_id;

    -- Notificar según el nuevo estado
    CASE NEW.status
      WHEN 'in_progress' THEN
        -- Notificar al PM que la limpieza ha comenzado
        IF v_property_manager_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (
            v_property_manager_id,
            'cleaning_started',
            'Limpieza en curso',
            'La limpieza de ' || v_property_name || ' ha comenzado.',
            jsonb_build_object('cleaning_id', NEW.id, 'property_id', NEW.property_id)
          );
        END IF;
        
      WHEN 'completed' THEN
        -- Notificar al PM que la limpieza se completó
        IF v_property_manager_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (
            v_property_manager_id,
            'cleaning_completed',
            'Limpieza completada ✓',
            'La limpieza de ' || v_property_name || ' ha sido completada.',
            jsonb_build_object('cleaning_id', NEW.id, 'property_id', NEW.property_id)
          );
        END IF;
        
      WHEN 'cancelled' THEN
        -- Si tenía asignada una limpiadora, notificarle
        IF NEW.cleaner_id IS NOT NULL THEN
          INSERT INTO notifications (user_id, type, title, message, data)
          VALUES (
            NEW.cleaner_id,
            'cleaning_cancelled',
            'Limpieza cancelada',
            'La limpieza de ' || v_property_name || ' del ' || TO_CHAR(NEW.scheduled_date, 'DD/MM/YYYY') || ' ha sido cancelada.',
            jsonb_build_object('cleaning_id', NEW.id, 'property_id', NEW.property_id)
          );
        END IF;
        
      ELSE
        -- No hacer nada para otros estados
        NULL;
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists to avoid errors
DROP TRIGGER IF EXISTS on_cleaning_status_change ON cleanings;

CREATE TRIGGER on_cleaning_status_change
  AFTER UPDATE ON cleanings
  FOR EACH ROW EXECUTE FUNCTION notify_cleaning_status_change();

-- =====================================================
-- POLICY: Allow system to insert notifications
-- =====================================================
-- Esta política permite que los triggers inserten notificaciones
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- ENABLE REALTIME FOR NOTIFICATIONS TABLE
-- =====================================================
-- Esto es necesario para que Supabase Realtime funcione
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
