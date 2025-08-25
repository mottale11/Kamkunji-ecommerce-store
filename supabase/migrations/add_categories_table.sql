-- Create categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT categories_name_key UNIQUE (name)
);

-- Add some default categories if they don't exist
INSERT INTO categories (name, description) VALUES 
  ('Electronics', 'Electronic devices and accessories'),
  ('Clothing', 'Clothing and fashion items'),
  ('Home & Garden', 'Home and garden supplies'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear'),
  ('Books & Media', 'Books, movies, and music'),
  ('Toys & Games', 'Toys and games for all ages'),
  ('Health & Beauty', 'Health and beauty products'),
  ('Automotive', 'Automotive parts and accessories')
ON CONFLICT (name) DO NOTHING;

-- Add foreign key constraint to products table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE table_name = 'products' 
    AND constraint_name = 'products_category_id_fkey'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT products_category_id_fkey 
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
  END IF;
END $$;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to categories table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_trigger 
    WHERE tgname = 'update_categories_modtime'
  ) THEN
    CREATE TRIGGER update_categories_modtime
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;
