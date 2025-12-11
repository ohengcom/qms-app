-- Migration: Add constraint for single active usage record per quilt
-- Requirements: 13.2 - Single active usage record
--
-- This migration adds a partial unique index to ensure that each quilt
-- can have at most one active usage record (where end_date IS NULL).
--
-- The partial unique index only applies to rows where end_date IS NULL,
-- allowing multiple completed usage records (with end_date set) for the same quilt.

-- Create partial unique index to enforce single active usage record per quilt
-- This index only includes rows where end_date IS NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_usage_records_single_active_per_quilt
ON usage_records (quilt_id)
WHERE end_date IS NULL;

-- Add a comment to document the constraint
COMMENT ON INDEX idx_usage_records_single_active_per_quilt IS 
'Ensures each quilt can have at most one active usage record (end_date IS NULL). Requirements: 13.2';
