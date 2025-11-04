-- Migration: Add double_click_action setting
-- Description: Adds support for configurable double-click behavior in quilt list
-- Date: 2025-01-04

-- Add double_click_action to system_settings if it doesn't exist
-- Using the key-value pattern that system_settings table uses
INSERT INTO system_settings (id, key, value, description, created_at, updated_at)
VALUES (
  uuid_generate_v4(),
  'double_click_action',
  'status',
  'Double click behavior in quilt list (none/status/edit)',
  NOW(),
  NOW()
)
ON CONFLICT (key) DO NOTHING;

-- Note: The system_settings table uses a key-value pattern, so we don't need to add a column.
-- The double_click_action is stored as a setting with key='double_click_action'
-- Valid values: 'none', 'status', 'edit'
-- Default value: 'status'
