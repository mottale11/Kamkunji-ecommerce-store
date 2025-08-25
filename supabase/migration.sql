-- Migration to add missing fields to products table
-- Run this in your Supabase SQL Editor

-- Add missing fields to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'good',
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Update existing products to have default values
UPDATE products 
SET 
  condition = COALESCE(condition, 'good'),
  status = COALESCE(status, 'pending')
WHERE condition IS NULL OR status IS NULL;

-- Add constraints
ALTER TABLE products 
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN condition SET DEFAULT 'good';

-- Add check constraints for valid values
ALTER TABLE products 
ADD CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected')),
ADD CONSTRAINT valid_condition CHECK (condition IN ('new', 'like_new', 'good', 'fair', 'poor'));
