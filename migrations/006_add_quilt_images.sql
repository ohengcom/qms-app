-- Migration: Add image fields to quilts table
-- Description: Adds support for main image and multiple attachment images stored as Base64
-- Date: 2025-01-06

-- Add main_image field (Base64 encoded string)
ALTER TABLE quilts
  ADD COLUMN IF NOT EXISTS main_image TEXT;

-- Add attachment_images field (array of Base64 encoded strings)
ALTER TABLE quilts
  ADD COLUMN IF NOT EXISTS attachment_images TEXT[] DEFAULT '{}';

-- Add comments for documentation
COMMENT ON COLUMN quilts.main_image IS 'Main image of the quilt stored as Base64 encoded string';
COMMENT ON COLUMN quilts.attachment_images IS 'Array of additional images stored as Base64 encoded strings';

-- Note: Base64 images are compressed to ~100-200KB each before storage
-- PostgreSQL TEXT type can store up to 1GB, which is sufficient for our use case
