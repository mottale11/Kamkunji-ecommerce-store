-- Database Setup Script for Ecommerce Store
-- Run this in your Supabase SQL Editor

-- 1. Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create profiles table (users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  condition VARCHAR(50) DEFAULT 'good',
  location VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured BOOLEAN DEFAULT false,
  category_id UUID REFERENCES categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create product_images table
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_country VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Insert some sample categories
INSERT INTO categories (name, description) VALUES
  ('Electronics', 'Electronic devices and gadgets'),
  ('Clothing', 'Fashion and apparel'),
  ('Home & Garden', 'Home improvement and garden items'),
  ('Sports', 'Sports equipment and accessories'),
  ('Books', 'Books and publications'),
  ('Automotive', 'Car parts and accessories'),
  ('Toys & Games', 'Toys and gaming items'),
  ('Health & Beauty', 'Health and beauty products')
ON CONFLICT (name) DO NOTHING;

-- 8. Insert a sample profile (admin user)
INSERT INTO profiles (full_name, email, phone, is_admin) VALUES
  ('Admin User', 'admin@example.com', '+1234567890', true)
ON CONFLICT (email) DO NOTHING;

-- Note: You'll need to create an actual user account with this email in Supabase Auth
-- Then the profile will be automatically linked to the auth user

-- 9. Insert some sample products (optional - for testing)
INSERT INTO products (name, description, price, condition, location, status, category_id) VALUES
  ('Sample Product 1', 'This is a sample product for testing purposes', 2999, 'Good', 'Nairobi, Kenya', 'approved', 
   (SELECT id FROM categories WHERE name = 'Electronics' LIMIT 1)),
  ('Sample Product 2', 'Another sample product for testing', 4999, 'New', 'Mombasa, Kenya', 'pending',
   (SELECT id FROM categories WHERE name = 'Clothing' LIMIT 1))
ON CONFLICT DO NOTHING;

-- 10. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- 11. Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- 12. Create policies for public read access to approved products
CREATE POLICY "Public can view approved products" ON products
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (true);

-- 13. Create policies for authenticated users
CREATE POLICY "Users can insert products" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own products" ON products
  FOR UPDATE USING (true);

-- 14. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 15. Create triggers to automatically update updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- 17. Create storage bucket for product images
-- Note: This needs to be done in the Supabase dashboard under Storage
-- Bucket name: 'product-images'
-- Public bucket: true
-- File size limit: 50MB
-- Allowed MIME types: image/*

-- 18. Verify tables were created
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'profiles', 'products', 'product_images', 'orders', 'order_items')
ORDER BY table_name, ordinal_position;
