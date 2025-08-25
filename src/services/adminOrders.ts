import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';
import { Order, OrderItem, OrderWithItems } from './orders';

export type AdminOrderFilters = {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
  start_date?: string;
  end_date?: string;
};

export async function getAdminOrders(filters: AdminOrderFilters = {}): Promise<Order[]> {
  try {
    let query = supabase
      .from('orders')
      .select(`
        *,
        users:user_id (id, email, full_name, phone)
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }

    if (filters.search) {
      query = query.or(
        `id.ilike.%${filters.search}%,users.email.ilike.%${filters.search}%,users.full_name.ilike.%${filters.search}%,users.phone.ilike.%${filters.search}%`
      );
    }

    if (filters.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters.end_date) {
      query = query.lte('created_at', filters.end_date);
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
      console.error('Error fetching admin orders:', error);
      throw error;
    }

    return data as Order[];
  } catch (error) {
    console.error('Error in getAdminOrders:', error);
    throw error;
  }
}

export async function getAdminOrderWithItems(id: string): Promise<OrderWithItems> {
  try {
    // Get the order with user details
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        *,
        users:user_id (id, email, full_name, phone)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching admin order:', error);
      throw error;
    }

    // Get the order items with product details
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .select(`
        *,
        products:product_id (id, name, price)
      `)
      .eq('order_id', id);

    if (itemsError) {
      console.error('Error fetching order items:', itemsError);
      throw itemsError;
    }

    // Transform the items to match the expected format
    const transformedItems = items.map(item => ({
      ...item,
      product: {
        name: item.products.name,
        price: item.products.price
      }
    }));

    return {
      ...order,
      items: transformedItems
    } as OrderWithItems;
  } catch (error) {
    console.error('Error in getAdminOrderWithItems:', error);
    throw error;
  }
}

export async function updateAdminOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating order status:', error);
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error('Error in updateAdminOrderStatus:', error);
    throw error;
  }
}