/*
  # Fix License System Issues
  
  1. Database Schema Fixes
    - Fix foreign key relationship between licenses and users_profile
    - Make user_id optional in licenses table
    - Add proper indexes
    
  2. Updates
    - Allow licenses without users
    - Fix relationship issues
*/

-- First, drop the existing foreign key constraint if it exists
ALTER TABLE licenses DROP CONSTRAINT IF EXISTS licenses_user_id_fkey;

-- Make user_id nullable and remove the foreign key constraint to users_profile
ALTER TABLE licenses ALTER COLUMN user_id DROP NOT NULL;

-- Add a new foreign key constraint that references auth.users directly
-- This is more reliable than referencing users_profile
ALTER TABLE licenses 
ADD CONSTRAINT licenses_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_product_id ON licenses(product_id);
CREATE INDEX IF NOT EXISTS idx_licenses_user_id ON licenses(user_id);
CREATE INDEX IF NOT EXISTS idx_licenses_status ON licenses(status);

-- Update the licenses table to allow NULL user_id
-- This means licenses can exist without being assigned to a specific user
UPDATE licenses SET user_id = NULL WHERE user_id IS NOT NULL AND user_id NOT IN (
  SELECT id FROM auth.users
);

-- Create a view that joins licenses with user information when available
CREATE OR REPLACE VIEW licenses_with_users AS
SELECT 
  l.*,
  COALESCE(up.full_name, 'Unassigned') as user_full_name,
  up.company as user_company,
  up.phone as user_phone,
  up.role as user_role
FROM licenses l
LEFT JOIN users_profile up ON l.user_id = up.id;

-- Grant access to the view
GRANT SELECT ON licenses_with_users TO authenticated;
GRANT SELECT ON licenses_with_users TO anon;