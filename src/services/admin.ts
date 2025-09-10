import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';
import { ProductWithImages } from './products';

export type AdminProductFilters = {
  status?: 'pending' | 'approved' | 'rejected' | 'reported';
  featured?: boolean;
  category_id?: string;
  search?: string;
  limit?: number;
  offset?: number;
};

export async function getAdminProducts(filters: AdminProductFilters = {}): Promise<ProductWithImages[]> {
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (*),
        categories:category_id (id, name)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.featured !== undefined) {
      query = query.eq('featured', filters.featured);
    }

    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id);
    }

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`);
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    // Transform the data to match the ProductWithImages type
    return data.map((product: any) => ({
      ...product,
      images: product.product_images,
      category: product.categories,
    }));
  } catch (error) {
    console.error('Error fetching admin products:', error);
    throw error;
  }
}

export async function updateProductStatus(
  productId: string,
  status: 'pending' | 'approved' | 'rejected' | 'reported'
): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ status })
      .eq('id', productId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
}

export async function updateProductFeatured(productId: string, featured: boolean): Promise<void> {
  try {
    const { error } = await supabase
      .from('products')
      .update({ featured })
      .eq('id', productId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error updating product featured status:', error);
    throw error;
  }
}

export async function deleteProduct(productId: string): Promise<void> {
  try {
    // First delete related images
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', productId);

    if (imagesError) {
      throw imagesError;
    }

    // Then delete the product
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

type Item = Database['public']['Tables']['items']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export async function getItems(): Promise<Item[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      status: item.status || 'pending',
      created_at: item.created_at,
      image_url: item.image_url || ''
    })) || [];
  } catch (error) {
    console.error('Error fetching items:', error);
    throw new Error('Failed to fetch items');
  }
}

export const getItemById = async (id: string): Promise<Item | null> => {
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching item:', error);
    return null;
  }

  return data;
};

export const createItem = async (itemData: Omit<Item, 'id' | 'created_at'>): Promise<Item> => {
  const { data, error } = await supabase
    .from('items')
    .insert([itemData])
    .select()
    .single();

  if (error) {
    console.error('Error creating item:', error);
    throw error;
  }

  return data;
};

export const updateItem = async (id: string, itemData: Partial<Item>): Promise<Item> => {
  const { data, error } = await supabase
    .from('items')
    .update(itemData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating item:', error);
    throw error;
  }

  return data;
};

export const deleteItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        item:items(*)
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data || [];
};

export const updateOrderStatus = async (id: string, status: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data;
};

export const getDashboardStats = async () => {
  // Get total items count
  const { count: totalItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true });

  // Get pending items count
  const { count: pendingItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // Get active items count
  const { count: activeItems } = await supabase
    .from('items')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get total orders count
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Get recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  return {
    totalItems: totalItems || 0,
    pendingItems: pendingItems || 0,
    activeItems: activeItems || 0,
    totalOrders: totalOrders || 0,
    recentOrders: recentOrders || [],
  };
};

type User = Database['public']['Tables']['profiles']['Row'];
type Product = Database['public']['Tables']['products']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

export const getAdminStats = async () => {
  try {
    // Get counts for all important metrics
    const [
      { count: usersCount },
      { count: productsCount },
      { count: pendingProductsCount },
      { count: ordersCount },
      { count: pendingOrdersCount },
      { data: revenueData },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved'),
      
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),
      
      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      supabase
        .rpc('get_total_revenue')
        .single(),
    ]);

    return {
      usersCount: usersCount || 0,
      productsCount: productsCount || 0,
      pendingProductsCount: pendingProductsCount || 0,
      ordersCount: ordersCount || 0,
      pendingOrdersCount: pendingOrdersCount || 0,
      totalRevenue: revenueData?.total_revenue || 0,
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw error;
  }
};

export const getUsers = async (page = 1, limit = 10): Promise<{ data: User[]; count: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [{ data, count }, { count: total }] = await Promise.all([
      supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }),
    ]);

    return {
      data: data || [],
      count: total || 0,
    };
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const updateUserRole = async (userId: string, isAdmin: boolean): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating user role for ${userId}:`, error);
    throw error;
  }
};

export const getPendingProducts = async (page = 1, limit = 10): Promise<{ data: Product[]; count: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const [{ data, count }, { count: total }] = await Promise.all([
      supabase
        .from('products')
        .select('*, user:user_id(id, full_name), categories:category_id(name)', { count: 'exact' })
        .eq('status', 'pending')
        .range(from, to)
        .order('created_at', { ascending: false }),
      
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
    ]);

    return {
      data: data || [],
      count: total || 0,
    };
  } catch (error) {
    console.error('Error fetching pending products:', error);
    throw error;
  }
};

export const updateProductStatus = async (
  productId: string, 
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason?: string
): Promise<Product> => {
  try {
    const updates: any = { status };
    
    if (status === 'rejected' && rejectionReason) {
      updates.rejection_reason = rejectionReason;
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', productId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating product ${productId} status:`, error);
    throw error;
  }
};

export const getOrders = async (page = 1, limit = 10, status?: string): Promise<{ data: Order[]; count: number }> => {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('orders')
      .select('*, order_items(*, products:product_id(*)), user:user_id(id, full_name, email)', { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const [{ data, count }, { count: total }] = await Promise.all([
      query,
      status
        ? supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', status)
        : supabase
            .from('orders')
            .select('*', { count: 'exact', head: true }),
    ]);

    return {
      data: data || [],
      count: total || 0,
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string, 
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString() 
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating order ${orderId} status:`, error);
    throw error;
  }
};