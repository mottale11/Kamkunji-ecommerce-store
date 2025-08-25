-- Supabase Storage Setup for Product Images
-- Run this in your Supabase SQL Editor

-- 1. Create the storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Create storage policies for the bucket

-- Policy for public read access to product images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- Policy for inserting images (only authenticated users can upload to their own folder)
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for updating images (only authenticated users can update their own files)
CREATE POLICY "Users can update own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy for deleting images (only authenticated users can delete their own files)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Enable Row Level Security on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Create a function to get public URLs for images
CREATE OR REPLACE FUNCTION public.get_image_url(bucket text, path text)
RETURNS text AS $$
  SELECT concat(
    (SELECT storage_url FROM storage.buckets WHERE id = bucket),
    '/',
    path
  );
$$ LANGUAGE sql STABLE;

-- 5. Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO public;
GRANT SELECT ON storage.objects TO public;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- Create a function to check if a user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
