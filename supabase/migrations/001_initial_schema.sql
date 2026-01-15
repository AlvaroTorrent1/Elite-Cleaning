-- Elite Cleaning Database Schema
-- Version: 1.0
-- Date: 2026-01-08

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with role and metadata
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'cleaner', 'property_manager')),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false, -- Para property managers que se auto-registran
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, is_approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cleaner'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'property_manager' THEN false
      ELSE true
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PROPERTIES TABLE
-- =====================================================
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  access_instructions TEXT,
  size_sqm INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_manager_id UUID REFERENCES profiles(id),
  ical_airbnb TEXT,
  ical_booking TEXT,
  ical_other TEXT,
  default_cleaning_type TEXT DEFAULT 'estandar' CHECK (default_cleaning_type IN ('repaso', 'estandar', 'profunda')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLEANING TYPES TABLE
-- =====================================================
CREATE TABLE cleaning_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  estimated_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar tipos por defecto
INSERT INTO cleaning_types (name, slug, description, estimated_duration_minutes) VALUES
  ('Repaso', 'repaso', 'Limpieza ligera entre huéspedes', 90),
  ('Estándar', 'estandar', 'Limpieza completa post check-out', 180),
  ('Profunda', 'profunda', 'Limpieza intensiva periódica', 300);

-- =====================================================
-- CLEANING EXTRAS TABLE
-- =====================================================
CREATE TABLE cleaning_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar extras por defecto
INSERT INTO cleaning_extras (name, description) VALUES
  ('Kit de bebé', 'Preparar cuna y trona'),
  ('Ropa de cama adicional', 'Cambiar ropa de cama extra'),
  ('Toallas extra', 'Preparar toallas adicionales'),
  ('Vaciado de nevera', 'Vaciar y limpiar nevera completamente'),
  ('Lavado de ropa', 'Lavar ropa dejada por huésped'),
  ('Reposición de amenities', 'Reponer jabones, champús, etc.');

-- =====================================================
-- DAMAGE CATALOG TABLE
-- Catálogo de items que pueden dañarse
-- =====================================================
CREATE TABLE damage_catalog (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  estimated_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_damage_catalog_updated_at
  BEFORE UPDATE ON damage_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar items por defecto
INSERT INTO damage_catalog (name, category, estimated_price) VALUES
  ('Sábanas (juego completo)', 'lavanderia', 45.00),
  ('Toallas (juego)', 'lavanderia', 25.00),
  ('Edredón', 'lavanderia', 80.00),
  ('Almohada', 'lavanderia', 15.00),
  ('Mantel', 'lavanderia', 20.00),
  ('Silla de bebé', 'equipamiento', 120.00),
  ('Cuna portátil', 'equipamiento', 150.00),
  ('Vajilla (plato)', 'menaje', 8.00),
  ('Vaso/Copa', 'menaje', 5.00),
  ('Sartén', 'menaje', 25.00),
  ('Olla', 'menaje', 30.00),
  ('Lámpara', 'mobiliario', 40.00),
  ('Espejo', 'mobiliario', 35.00);

-- =====================================================
-- CLEANINGS TABLE
-- =====================================================
CREATE TABLE cleanings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  cleaner_id UUID REFERENCES profiles(id),
  cleaning_type_id UUID REFERENCES cleaning_types(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled')),
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_urgent BOOLEAN DEFAULT false,
  is_manual BOOLEAN DEFAULT false,
  ical_event_uid TEXT,
  ical_platform TEXT CHECK (ical_platform IN ('airbnb', 'booking', 'other')),
  guest_rejected BOOLEAN DEFAULT false,
  guest_signature_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cleanings_cleaner_id ON cleanings(cleaner_id);
CREATE INDEX idx_cleanings_property_id ON cleanings(property_id);
CREATE INDEX idx_cleanings_scheduled_date ON cleanings(scheduled_date);
CREATE INDEX idx_cleanings_status ON cleanings(status);

CREATE TRIGGER update_cleanings_updated_at
  BEFORE UPDATE ON cleanings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLEANING SELECTED EXTRAS TABLE
-- =====================================================
CREATE TABLE cleaning_selected_extras (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  extra_id UUID NOT NULL REFERENCES cleaning_extras(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CHECKLIST TEMPLATES TABLE
-- =====================================================
CREATE TABLE checklist_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_type_id UUID REFERENCES cleaning_types(id),
  name TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_checklist_templates_updated_at
  BEFORE UPDATE ON checklist_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Template por defecto para limpieza estándar
INSERT INTO checklist_templates (cleaning_type_id, name, items)
SELECT 
  id,
  'Checklist Estándar',
  '[
    {"id": "cocina-1", "section": "Cocina", "task": "Limpiar encimera", "requires_photo": true},
    {"id": "cocina-2", "section": "Cocina", "task": "Limpiar electrodomésticos", "requires_photo": true},
    {"id": "cocina-3", "section": "Cocina", "task": "Vaciar y limpiar nevera", "requires_photo": true},
    {"id": "cocina-4", "section": "Cocina", "task": "Fregar suelo", "requires_photo": true},
    {"id": "bano-1", "section": "Baño", "task": "Limpiar sanitarios", "requires_photo": true},
    {"id": "bano-2", "section": "Baño", "task": "Limpiar espejo", "requires_photo": true},
    {"id": "bano-3", "section": "Baño", "task": "Cambiar toallas", "requires_photo": true},
    {"id": "bano-4", "section": "Baño", "task": "Reponer amenities", "requires_photo": false},
    {"id": "habitacion-1", "section": "Habitaciones", "task": "Cambiar sábanas", "requires_photo": true},
    {"id": "habitacion-2", "section": "Habitaciones", "task": "Aspirar y fregar", "requires_photo": true},
    {"id": "salon-1", "section": "Salón", "task": "Limpiar superficies", "requires_photo": true},
    {"id": "salon-2", "section": "Salón", "task": "Aspirar sofá", "requires_photo": true},
    {"id": "salon-3", "section": "Salón", "task": "Fregar suelo", "requires_photo": true},
    {"id": "general-1", "section": "General", "task": "Sacar basura", "requires_photo": false},
    {"id": "general-2", "section": "General", "task": "Revisar ventanas", "requires_photo": true}
  ]'::jsonb
FROM cleaning_types WHERE slug = 'estandar';

-- =====================================================
-- CLEANING CHECKLISTS TABLE
-- =====================================================
CREATE TABLE cleaning_checklists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  template_id UUID REFERENCES checklist_templates(id),
  completed_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_cleaning_checklists_updated_at
  BEFORE UPDATE ON cleaning_checklists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CLEANING IMAGES TABLE
-- =====================================================
CREATE TABLE cleaning_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('checklist', 'damage', 'lost_item', 'signature')),
  checklist_item_id TEXT, -- ID del item del checklist si aplica
  image_url TEXT NOT NULL,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cleaning_images_cleaning_id ON cleaning_images(cleaning_id);
CREATE INDEX idx_cleaning_images_category ON cleaning_images(category);

-- =====================================================
-- DAMAGE REPORTS TABLE
-- =====================================================
CREATE TABLE damage_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id),
  damage_item_id UUID REFERENCES damage_catalog(id),
  custom_description TEXT,
  estimated_cost DECIMAL(10, 2),
  image_url TEXT NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  acknowledged_by_admin BOOLEAN DEFAULT false,
  acknowledged_by_pm BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_damage_reports_cleaning_id ON damage_reports(cleaning_id);

-- =====================================================
-- LOST ITEM REPORTS TABLE
-- =====================================================
CREATE TABLE lost_item_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cleaning_id UUID NOT NULL REFERENCES cleanings(id),
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  reported_by UUID REFERENCES profiles(id),
  acknowledged_by_admin BOOLEAN DEFAULT false,
  acknowledged_by_pm BOOLEAN DEFAULT false,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_lost_item_reports_cleaning_id ON lost_item_reports(cleaning_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- =====================================================
-- ICAL SYNC LOGS TABLE
-- =====================================================
CREATE TABLE ical_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id),
  platform TEXT NOT NULL CHECK (platform IN ('airbnb', 'booking', 'other')),
  sync_status TEXT NOT NULL CHECK (sync_status IN ('success', 'error')),
  events_found INTEGER,
  events_created INTEGER,
  events_updated INTEGER,
  events_cancelled INTEGER,
  error_message TEXT,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ical_sync_logs_property_id ON ical_sync_logs(property_id);
CREATE INDEX idx_ical_sync_logs_synced_at ON ical_sync_logs(synced_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_selected_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE damage_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE lost_item_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- PROPERTIES POLICIES
CREATE POLICY "Property managers can view own properties" ON properties
  FOR SELECT USING (
    property_manager_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Cleaners can view properties of assigned cleanings" ON properties
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cleanings 
      WHERE cleanings.property_id = properties.id 
      AND cleanings.cleaner_id = auth.uid()
    )
  );

-- CLEANINGS POLICIES
CREATE POLICY "Cleaners view assigned cleanings" ON cleanings
  FOR SELECT USING (
    cleaner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Cleaners update own cleanings" ON cleanings
  FOR UPDATE USING (cleaner_id = auth.uid())
  WITH CHECK (cleaner_id = auth.uid());

CREATE POLICY "Property managers view own property cleanings" ON cleanings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties 
      WHERE properties.id = cleanings.property_id 
      AND properties.property_manager_id = auth.uid()
    )
  );

-- CLEANING IMAGES POLICIES
CREATE POLICY "Cleaners upload images to own cleanings" ON cleaning_images
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM cleanings 
      WHERE cleanings.id = cleaning_images.cleaning_id 
      AND cleanings.cleaner_id = auth.uid()
    )
  );

CREATE POLICY "Users view images of accessible cleanings" ON cleaning_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cleanings 
      WHERE cleanings.id = cleaning_images.cleaning_id 
      AND (
        cleanings.cleaner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM properties 
          WHERE properties.id = cleanings.property_id 
          AND properties.property_manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- DAMAGE REPORTS POLICIES
CREATE POLICY "Cleaners create damage reports" ON damage_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users view damage reports of accessible cleanings" ON damage_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cleanings 
      WHERE cleanings.id = damage_reports.cleaning_id 
      AND (
        cleanings.cleaner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM properties 
          WHERE properties.id = cleanings.property_id 
          AND properties.property_manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- LOST ITEM REPORTS POLICIES
CREATE POLICY "Cleaners create lost item reports" ON lost_item_reports
  FOR INSERT WITH CHECK (reported_by = auth.uid());

CREATE POLICY "Users view lost item reports of accessible cleanings" ON lost_item_reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cleanings 
      WHERE cleanings.id = lost_item_reports.cleaning_id 
      AND (
        cleanings.cleaner_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM properties 
          WHERE properties.id = cleanings.property_id 
          AND properties.property_manager_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
      )
    )
  );

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Crear bucket para imágenes de limpieza
INSERT INTO storage.buckets (id, name, public)
VALUES ('cleaning-images', 'cleaning-images', false);

-- Policy para subir imágenes
CREATE POLICY "Cleaners can upload images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cleaning-images' AND
    auth.role() = 'authenticated'
  );

-- Policy para ver imágenes
CREATE POLICY "Users can view images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cleaning-images' AND
    auth.role() = 'authenticated'
  );

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Función para crear notificación cuando se reporta un daño
CREATE OR REPLACE FUNCTION notify_damage_report()
RETURNS TRIGGER AS $$
DECLARE
  v_property_manager_id UUID;
  v_property_name TEXT;
BEGIN
  -- Obtener property manager
  SELECT p.property_manager_id, p.name INTO v_property_manager_id, v_property_name
  FROM properties p
  JOIN cleanings c ON c.property_id = p.id
  WHERE c.id = NEW.cleaning_id;

  -- Notificar al property manager
  IF v_property_manager_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_property_manager_id,
      'damage_report',
      'Nuevo reporte de daño',
      'Se ha reportado un daño en ' || v_property_name,
      jsonb_build_object('damage_report_id', NEW.id, 'cleaning_id', NEW.cleaning_id)
    );
  END IF;

  -- Notificar al admin
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    id,
    'damage_report',
    'Nuevo reporte de daño',
    'Se ha reportado un daño en ' || v_property_name,
    jsonb_build_object('damage_report_id', NEW.id, 'cleaning_id', NEW.cleaning_id)
  FROM profiles WHERE role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_damage_report_created
  AFTER INSERT ON damage_reports
  FOR EACH ROW EXECUTE FUNCTION notify_damage_report();

-- Función para crear notificación cuando se reporta un objeto perdido
CREATE OR REPLACE FUNCTION notify_lost_item_report()
RETURNS TRIGGER AS $$
DECLARE
  v_property_manager_id UUID;
  v_property_name TEXT;
BEGIN
  -- Obtener property manager
  SELECT p.property_manager_id, p.name INTO v_property_manager_id, v_property_name
  FROM properties p
  JOIN cleanings c ON c.property_id = p.id
  WHERE c.id = NEW.cleaning_id;

  -- Notificar al property manager
  IF v_property_manager_id IS NOT NULL THEN
    INSERT INTO notifications (user_id, type, title, message, data)
    VALUES (
      v_property_manager_id,
      'lost_item_report',
      'Objeto perdido encontrado',
      'Se ha encontrado un objeto perdido en ' || v_property_name,
      jsonb_build_object('lost_item_report_id', NEW.id, 'cleaning_id', NEW.cleaning_id)
    );
  END IF;

  -- Notificar al admin
  INSERT INTO notifications (user_id, type, title, message, data)
  SELECT 
    id,
    'lost_item_report',
    'Objeto perdido encontrado',
    'Se ha encontrado un objeto perdido en ' || v_property_name,
    jsonb_build_object('lost_item_report_id', NEW.id, 'cleaning_id', NEW.cleaning_id)
  FROM profiles WHERE role = 'admin';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lost_item_report_created
  AFTER INSERT ON lost_item_reports
  FOR EACH ROW EXECUTE FUNCTION notify_lost_item_report();

-- =====================================================
-- VIEWS
-- =====================================================

-- Vista para limpiezas con información completa
CREATE OR REPLACE VIEW cleanings_with_details AS
SELECT 
  c.*,
  p.name as property_name,
  p.address as property_address,
  p.gps_lat,
  p.gps_lng,
  p.access_instructions,
  p.property_manager_id,
  ct.name as cleaning_type_name,
  ct.estimated_duration_minutes,
  prof.full_name as cleaner_name,
  prof.phone as cleaner_phone,
  pm.full_name as property_manager_name,
  pm.email as property_manager_email
FROM cleanings c
JOIN properties p ON c.property_id = p.id
LEFT JOIN cleaning_types ct ON c.cleaning_type_id = ct.id
LEFT JOIN profiles prof ON c.cleaner_id = prof.id
LEFT JOIN profiles pm ON p.property_manager_id = pm.id;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Crear usuario admin por defecto (opcional, comentado por seguridad)
-- Descomenta y modifica si quieres crear un admin inicial
/*
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
VALUES (
  uuid_generate_v4(),
  'admin@myelitecleaning.com',
  crypt('CHANGE_THIS_PASSWORD', gen_salt('bf')),
  NOW(),
  '{"role": "admin", "full_name": "Administrador"}'::jsonb
);
*/

-- =====================================================
-- COMPLETED
-- =====================================================

-- Verificar instalación
DO $$
BEGIN
  RAISE NOTICE 'Elite Cleaning database schema installed successfully!';
  RAISE NOTICE 'Tables created: %', (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public');
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Configure Google OAuth in Supabase Dashboard';
  RAISE NOTICE '2. Create .env.local file with your Supabase credentials';
  RAISE NOTICE '3. Start developing!';
END $$;
