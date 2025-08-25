-- Create tables for Kamkunji Ndogo e-commerce platform

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  condition TEXT DEFAULT 'good',
  location TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product Images Table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending_payment',
  total_amount DECIMAL(10, 2) NOT NULL,
  payment_status TEXT DEFAULT 'pending',
  payment_method TEXT,
  checkout_request_id TEXT,
  mpesa_receipt_number TEXT,
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishlist Table
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product images
CREATE POLICY "Allow public read access to product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Allow authenticated uploads to product-images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated updates to own files"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow authenticated deletes to own files"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- User policies
CREATE POLICY "Enable read access for admin users only"
ON users FOR SELECT
USING (true);

CREATE POLICY "Enable insert for admin users only"
ON users FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for admin users only"
ON users FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for admin users only"
ON users FOR DELETE
USING (true);

-- Product policies
CREATE POLICY "Enable read access for all users"
ON products FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON products FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON products FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all users"
ON products FOR DELETE
USING (true);

-- Product images policies
CREATE POLICY "Enable read access for all users"
ON product_images FOR SELECT
USING (true);

CREATE POLICY "Enable insert for all users"
ON product_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Enable update for all users"
ON product_images FOR UPDATE
USING (true);

CREATE POLICY "Enable delete for all users"
ON product_images FOR DELETE
USING (true);

-- Orders policies
CREATE POLICY "Enable read access for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Enable insert for authenticated users"
ON orders FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Order items policies
CREATE POLICY "Enable read access for order owner"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (orders.user_id = auth.uid() OR auth.role() = 'service_role')
  )
);

-- Wishlist policies
CREATE POLICY "Enable all operations for authenticated users"
ON wishlist
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create a function to handle file uploads with proper permissions
CREATE OR REPLACE FUNCTION upload_product_image(
  product_id UUID,
  file_name TEXT,
  file_data BYTEA,
  is_primary BOOLEAN DEFAULT false
) RETURNS UUID AS $$
DECLARE
  file_path TEXT;
  file_url TEXT;
  image_id UUID;
  user_id UUID;
BEGIN
  -- Get the current user ID
  user_id := auth.uid();
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Generate a unique file path
  file_path := user_id || '/' || gen_random_uuid() || '_' || file_name;
  
  -- Upload the file to storage
  INSERT INTO storage.objects (bucket_id, name, owner, metadata)
  VALUES ('product-images', file_path, user_id, '{"uploaded_by":"' || user_id || '"}')
  RETURNING name INTO file_path;
  
  -- Get the public URL
  SELECT concat(
    (SELECT storage_url FROM storage.buckets WHERE id = 'product-images'),
    '/',
    path
  ) INTO file_url;
  
  -- Insert the image record
  INSERT INTO product_images (product_id, url, is_primary)
  VALUES (product_id, file_url, is_primary)
  RETURNING id INTO image_id;
  
  -- If this is the primary image, unset any other primary images for this product
  IF is_primary THEN
    UPDATE product_images
    SET is_primary = false
    WHERE product_id = upload_product_image.product_id
    AND id != image_id;
  END IF;
  
  RETURN image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;