-- =====================================================
-- iCal Sync System for Elite Cleaning
-- Version: 1.0
-- Date: 2026-01-16
-- 
-- This migration adds:
-- 1. ical_sync_configs table for granular sync control
-- 2. Updates to cleanings table for better iCal tracking
-- 3. RLS policies for PM access
-- =====================================================

-- =====================================================
-- TABLE: ical_sync_configs
-- Stores iCal calendar configurations per property
-- =====================================================
CREATE TABLE IF NOT EXISTS ical_sync_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    
    -- Calendar configuration
    platform TEXT NOT NULL CHECK (platform IN ('airbnb', 'booking', 'other')),
    ical_url TEXT NOT NULL,
    ical_name TEXT, -- Optional descriptive name (e.g., "Airbnb Piso Centro")
    
    -- Sync control
    sync_interval_minutes INTEGER DEFAULT 60,
    last_sync_at TIMESTAMPTZ,
    last_sync_status TEXT DEFAULT 'pending' CHECK (last_sync_status IN ('pending', 'syncing', 'success', 'error')),
    last_sync_error TEXT,
    last_sync_events_found INTEGER DEFAULT 0,
    last_sync_cleanings_created INTEGER DEFAULT 0,
    last_sync_cleanings_updated INTEGER DEFAULT 0,
    
    -- State
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate platform configs per property
    UNIQUE(property_id, platform)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ical_sync_configs_property ON ical_sync_configs(property_id);
CREATE INDEX IF NOT EXISTS idx_ical_sync_configs_active ON ical_sync_configs(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_ical_sync_configs_next_sync ON ical_sync_configs(last_sync_at, sync_interval_minutes) 
    WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_ical_sync_configs_updated_at
    BEFORE UPDATE ON ical_sync_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- UPDATE: cleanings table
-- Add columns for better iCal tracking
-- =====================================================

-- Add booking_uid_prefix for grouping fragmented events (Airbnb issue)
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_booking_uid_prefix TEXT;

-- Add reference to the sync config that created this cleaning
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_config_id UUID REFERENCES ical_sync_configs(id) ON DELETE SET NULL;

-- Add guest name extracted from iCal
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_guest_name TEXT;

-- Add check-in date (useful for context)
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_check_in_date DATE;

-- Add check-out date (this is scheduled_date, but explicit is clearer)
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_check_out_date DATE;

-- Add raw event data for debugging
ALTER TABLE cleanings 
ADD COLUMN IF NOT EXISTS ical_raw_event JSONB;

-- Index for finding cleanings by UID prefix (critical for merge logic)
CREATE INDEX IF NOT EXISTS idx_cleanings_ical_uid_prefix ON cleanings(ical_booking_uid_prefix) 
    WHERE ical_booking_uid_prefix IS NOT NULL;

-- Index for finding cleanings by config
CREATE INDEX IF NOT EXISTS idx_cleanings_ical_config ON cleanings(ical_config_id) 
    WHERE ical_config_id IS NOT NULL;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE ical_sync_configs ENABLE ROW LEVEL SECURITY;

-- PM can view configs for their own properties
CREATE POLICY "PM can view own property ical configs" ON ical_sync_configs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = ical_sync_configs.property_id 
            AND properties.property_manager_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- PM can insert configs for their own properties
CREATE POLICY "PM can create ical configs for own properties" ON ical_sync_configs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = ical_sync_configs.property_id 
            AND properties.property_manager_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- PM can update configs for their own properties
CREATE POLICY "PM can update own property ical configs" ON ical_sync_configs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = ical_sync_configs.property_id 
            AND properties.property_manager_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- PM can delete configs for their own properties
CREATE POLICY "PM can delete own property ical configs" ON ical_sync_configs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = ical_sync_configs.property_id 
            AND properties.property_manager_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- =====================================================
-- UPDATE CLEANINGS RLS
-- Allow PM to cancel iCal-generated cleanings
-- =====================================================

-- PM can update (cancel) cleanings for their properties
-- This is additive to existing policies
CREATE POLICY "PM can update cleanings for own properties" ON cleanings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = cleanings.property_id 
            AND properties.property_manager_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM properties 
            WHERE properties.id = cleanings.property_id 
            AND properties.property_manager_id = auth.uid()
        )
    );

-- =====================================================
-- FUNCTION: Check if sync is needed
-- Returns true if enough time has passed since last sync
-- =====================================================
CREATE OR REPLACE FUNCTION should_sync_ical_config(config_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_last_sync TIMESTAMPTZ;
    v_interval INTEGER;
    v_is_active BOOLEAN;
BEGIN
    SELECT last_sync_at, sync_interval_minutes, is_active
    INTO v_last_sync, v_interval, v_is_active
    FROM ical_sync_configs
    WHERE id = config_id;
    
    -- If not active, don't sync
    IF NOT v_is_active THEN
        RETURN FALSE;
    END IF;
    
    -- If never synced, sync now
    IF v_last_sync IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Check if enough time has passed
    RETURN (NOW() - v_last_sync) >= (v_interval || ' minutes')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Get configs that need syncing
-- Used by the cron job to find which calendars to sync
-- =====================================================
CREATE OR REPLACE FUNCTION get_ical_configs_to_sync()
RETURNS SETOF ical_sync_configs AS $$
BEGIN
    RETURN QUERY
    SELECT *
    FROM ical_sync_configs
    WHERE is_active = true
    AND (
        last_sync_at IS NULL
        OR (NOW() - last_sync_at) >= (sync_interval_minutes || ' minutes')::INTERVAL
    )
    ORDER BY last_sync_at NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VIEW: Properties with iCal status
-- Useful for PM dashboard
-- =====================================================
CREATE OR REPLACE VIEW properties_with_ical_status AS
SELECT 
    p.*,
    COALESCE(
        jsonb_agg(
            jsonb_build_object(
                'id', isc.id,
                'platform', isc.platform,
                'ical_name', isc.ical_name,
                'last_sync_at', isc.last_sync_at,
                'last_sync_status', isc.last_sync_status,
                'last_sync_error', isc.last_sync_error,
                'is_active', isc.is_active
            )
        ) FILTER (WHERE isc.id IS NOT NULL),
        '[]'::jsonb
    ) as ical_configs
FROM properties p
LEFT JOIN ical_sync_configs isc ON isc.property_id = p.id
GROUP BY p.id;

-- =====================================================
-- MIGRATION: Copy existing iCal URLs to new table
-- Preserves data from ical_airbnb, ical_booking, ical_other columns
-- =====================================================
DO $$
DECLARE
    prop RECORD;
BEGIN
    FOR prop IN SELECT id, ical_airbnb, ical_booking, ical_other FROM properties
    LOOP
        -- Migrate Airbnb URL if exists
        IF prop.ical_airbnb IS NOT NULL AND prop.ical_airbnb != '' THEN
            INSERT INTO ical_sync_configs (property_id, platform, ical_url, ical_name)
            VALUES (prop.id, 'airbnb', prop.ical_airbnb, 'Airbnb')
            ON CONFLICT (property_id, platform) DO NOTHING;
        END IF;
        
        -- Migrate Booking URL if exists
        IF prop.ical_booking IS NOT NULL AND prop.ical_booking != '' THEN
            INSERT INTO ical_sync_configs (property_id, platform, ical_url, ical_name)
            VALUES (prop.id, 'booking', prop.ical_booking, 'Booking.com')
            ON CONFLICT (property_id, platform) DO NOTHING;
        END IF;
        
        -- Migrate Other URL if exists
        IF prop.ical_other IS NOT NULL AND prop.ical_other != '' THEN
            INSERT INTO ical_sync_configs (property_id, platform, ical_url, ical_name)
            VALUES (prop.id, 'other', prop.ical_other, 'Otro')
            ON CONFLICT (property_id, platform) DO NOTHING;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migrated existing iCal URLs to ical_sync_configs table';
END $$;

-- =====================================================
-- COMPLETED
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ iCal Sync System migration completed successfully!';
    RAISE NOTICE 'New table: ical_sync_configs';
    RAISE NOTICE 'Updated table: cleanings (new iCal tracking columns)';
    RAISE NOTICE 'New view: properties_with_ical_status';
    RAISE NOTICE 'New functions: should_sync_ical_config, get_ical_configs_to_sync';
END $$;
