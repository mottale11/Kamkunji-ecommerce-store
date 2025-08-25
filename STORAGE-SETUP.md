# Supabase Storage Setup Guide

## Problem
The error "StorageApiError: Bucket not found" occurs because the Supabase Storage bucket for product images hasn't been created yet.

## Solution

### Option 1: Use Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project

2. **Create Storage Bucket**
   - Go to **Storage** in the left sidebar
   - Click **Create a new bucket**
   - Set **Bucket name**: `product-images`
   - Check **Public bucket** (so images can be viewed without authentication)
   - Click **Create bucket**

3. **Set Storage Policies**
   - Click on the `product-images` bucket
   - Go to **Policies** tab
   - Click **New Policy**
   - Choose **Create a policy from scratch**
   - Set the following policies:

#### Policy 1: Allow public read access
- **Policy name**: `Allow public to view product images`
- **Target roles**: `public`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```

#### Policy 2: Allow authenticated users to upload
- **Policy name**: `Allow authenticated users to upload product images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```

#### Policy 3: Allow authenticated users to update
- **Policy name**: `Allow authenticated users to update product images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```

#### Policy 4: Allow authenticated users to delete
- **Policy name**: `Allow authenticated users to delete product images`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'product-images')
```

### Option 2: Use SQL Editor

1. Go to **SQL Editor** in your Supabase dashboard
2. Run this SQL command:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies (run each separately)
CREATE POLICY "Allow public to view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images')
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated users to delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images');
```

## Verification

After setting up the bucket:

1. Go to **Storage** → **product-images** bucket
2. You should see the bucket is created and public
3. Try adding a product with an image in the admin panel
4. The image should upload successfully

## Troubleshooting

- **Bucket already exists**: If you get an error about the bucket already existing, you can skip the bucket creation step
- **Permission denied**: Make sure you're logged in as a project owner or have admin privileges
- **Policy errors**: Run the policies one by one to identify which one fails

## File Size Limits

The bucket is configured with a 5MB file size limit per image. You can adjust this in the bucket settings if needed.
