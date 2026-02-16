-- Add detailed lot information fields
-- Run this in Supabase SQL Editor after the initial schema

-- Add new columns to lots table
ALTER TABLE lots ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS front_meters NUMERIC;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS depth_meters NUMERIC;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS orientation TEXT;
ALTER TABLE lots ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
ALTER TABLE lots ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN lots.description IS 'Detailed description of the lot';
COMMENT ON COLUMN lots.front_meters IS 'Front measurement in meters';
COMMENT ON COLUMN lots.depth_meters IS 'Depth measurement in meters';
COMMENT ON COLUMN lots.orientation IS 'Lot orientation (Norte, Sur, Este, Oeste, etc.)';
COMMENT ON COLUMN lots.features IS 'JSON array of features/amenities';
COMMENT ON COLUMN lots.image_url IS 'URL to lot image or photo';
