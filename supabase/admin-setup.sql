-- Admin User Setup for Kamkunji Ndogo
-- Run this in your Supabase SQL Editor after running the main schema.sql

-- First, let's add the missing columns to the users table if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Update the role constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));

-- Create the admin user with the specific credentials
-- Using the simple hash function from the adminAuth service
-- Password: $Moses321 -> hash: $Moses321kamkunji-salt -> base64 encoded
INSERT INTO users (email, full_name, password_hash, role) 
VALUES (
  'kamkunjin@gmail.com',
  'Admin User',
  'JE1vc2VzMzIxa2Fta3Vuamktc2FsdA==', -- This is the hash for '$Moses321' using the simple hash function
  'admin'
)
ON CONFLICT (email) 
DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;

-- Verify the admin user was created
SELECT id, email, full_name, role, created_at FROM users WHERE role = 'admin';
