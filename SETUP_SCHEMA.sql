-- Real Estate Lots Navigator Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Zones Table
CREATE TABLE IF NOT EXISTS zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'sold', 'not_available')),
  svg_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocks Table
CREATE TABLE IF NOT EXISTS blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'sold', 'not_available')),
  svg_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lots Table
CREATE TABLE IF NOT EXISTS lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  block_id UUID NOT NULL REFERENCES blocks(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES zones(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  label TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('available', 'reserved', 'sold', 'not_available')),
  area NUMERIC NOT NULL,
  price NUMERIC,
  is_corner BOOLEAN DEFAULT false,
  -- Buyer information (optional)
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_notes TEXT,
  -- Timestamps
  reserved_at TIMESTAMPTZ,
  sold_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blocks_zone_id ON blocks(zone_id);
CREATE INDEX IF NOT EXISTS idx_lots_block_id ON lots(block_id);
CREATE INDEX IF NOT EXISTS idx_lots_zone_id ON lots(zone_id);
CREATE INDEX IF NOT EXISTS idx_lots_status ON lots(status);
CREATE INDEX IF NOT EXISTS idx_zones_slug ON zones(slug);
CREATE INDEX IF NOT EXISTS idx_blocks_slug ON blocks(slug);
CREATE INDEX IF NOT EXISTS idx_lots_slug ON lots(slug);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_zones_updated_at
  BEFORE UPDATE ON zones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blocks_updated_at
  BEFORE UPDATE ON blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at
  BEFORE UPDATE ON lots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;

-- Public read access to all tables
CREATE POLICY "Allow public read access to zones"
  ON zones FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to blocks"
  ON blocks FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to lots"
  ON lots FOR SELECT
  USING (true);

-- Note: For admin write access, you'll need to add policies based on auth
-- Example (commented out - requires auth setup):
-- CREATE POLICY "Allow authenticated users to update lots"
--   ON lots FOR UPDATE
--   USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE zones IS 'Real estate development zones (A, B, C)';
COMMENT ON TABLE blocks IS 'Blocks (manzanas) within each zone';
COMMENT ON TABLE lots IS 'Individual lots (lotes) within each block';
COMMENT ON COLUMN lots.status IS 'Lot status: available, reserved, sold, not_available';
COMMENT ON COLUMN lots.is_corner IS 'Whether the lot is a corner lot (esquina)';
