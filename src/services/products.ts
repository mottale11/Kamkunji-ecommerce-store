// Products service for Kamkunji Ndogo
// This service works with the SupabaseProvider context

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  stock_quantity: number;
  is_featured: boolean;
  condition: string;
  location: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ProductWithImages = Product & { images: { url: string }[] };

export async function getProducts(supabase: any, {
  featured = false,
  category_id,
  status = 'approved',
  limit = 10,
  offset = 0,
}: {
  featured?: boolean;
  category_id?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  limit?: number;
  offset?: number;
}) {
  try {
    if (!supabase) {
      console.error('Supabase client is undefined');
      return [];
    }

    let query = supabase
      .from('products')
      .select('*, product_images(url)')
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);

    if (featured) {
      query = query.eq('featured', true);
    }

    if (category_id) {
      query = query.eq('category_id', category_id);
    }

    if (status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform the data to match the ProductWithImages type
    return data.map((product: any) => ({
      ...product,
      images: product.product_images || [],
    })) as ProductWithImages[];
  } catch (error) {
    console.error('Error in getProducts:', error);
    return [];
  }
}

export async function getProductById(supabase: any, id: string) {
  try {
    if (!supabase) {
      console.error('Supabase client is undefined');
      return null;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*, product_images(url)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    // Transform the data to match the ProductWithImages type
    return {
      ...data,
      images: data.product_images || [],
    } as ProductWithImages;
  } catch (error) {
    console.error('Error in getProductById:', error);
    return null;
  }
}

export async function createProduct(supabase: any, product: Omit<Product, 'id' | 'created_at' | 'updated_at'>, imageUrls: string[]) {
  try {
    if (!supabase) {
      throw new Error('Supabase client is undefined');
    }

    // Start a transaction
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      throw error;
    }

    // Insert images if there are any
    if (imageUrls.length > 0) {
      const imageInserts = imageUrls.map(url => ({
        product_id: data.id,
        url,
      }));

      const { error: imageError } = await supabase
        .from('product_images')
        .insert(imageInserts);

      if (imageError) {
        console.error('Error adding product images:', imageError);
        throw imageError;
      }
    }

    return data;
  } catch (error) {
    console.error('Error in createProduct:', error);
    throw error;
  }
}
