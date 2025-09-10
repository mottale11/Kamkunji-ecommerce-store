import supabase from '@/utils/supabase';
import { Database } from '@/types/database.types';

export type Product = Database['public']['Tables']['products']['Row'] & {
  product_images?: Array<{ url: string }>;
  categories?: { name: string };
  user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
};

export type ProductFilters = {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  location?: string;
  search?: string;
  status?: string;
};

export const getProducts = async (filters: ProductFilters = {}): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images:product_images(*),
        categories:category_id(*),
        user:user_id(id, full_name, avatar_url)
      `);

    // Apply filters
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters.condition) {
      query = query.eq('condition', filters.condition);
    }
    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    } else {
      // Default to only showing approved products if no status filter is provided
      query = query.eq('status', 'approved');
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images:product_images(*),
        categories:category_id(*),
        user:user_id(id, full_name, avatar_url)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }

    return data as Product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
};

export const createProduct = async (productData: Omit<Database['public']['Tables']['products']['Insert'], 'id' | 'status' | 'created_at' | 'user_id'>, userId: string, images: File[]) => {
  try {
    // First, create the product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert([
        {
          ...productData,
          user_id: userId,
          status: 'pending', // Default status for new products
        }
      ])
      .select()
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Failed to create product');

    // Upload images if any
    if (images && images.length > 0) {
      const uploadPromises = images.map(async (file) => {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        // Save image URL to product_images table
        return supabase
          .from('product_images')
          .insert([
            { 
              product_id: product.id, 
              url: publicUrl 
            }
          ]);
      });

      await Promise.all(uploadPromises);
    }

    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id: string, productData: Partial<Database['public']['Tables']['products']['Update']>) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    // First, delete associated images
    const { data: images, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', id);

    if (imagesError) throw imagesError;

    // Delete images from storage
    const deletePromises = images.map(async (image) => {
      const fileName = image.url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('product-images')
          .remove([fileName]);
      }
    });

    await Promise.all(deletePromises);

    // Delete from product_images table
    await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);

    // Delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

export const getFeaturedProducts = async (limit: number = 8): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images:product_images(*),
        categories:category_id(*)
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    throw error;
  }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images:product_images(*),
        categories:category_id(*)
      `)
      .eq('category_id', categoryId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Product[];
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    throw error;
  }
};
