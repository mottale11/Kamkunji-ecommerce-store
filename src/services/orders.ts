import { supabase } from '../utils/supabase';
import { Database } from '../types/database.types';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderWithItems = Order & { items: (OrderItem & { product: { name: string } })[] };

export async function getOrders({
  user_id,
  status,
  limit = 10,
  offset = 0,
}: {
  user_id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'cancelled' | 'all';
  limit?: number;
  offset?: number;
} = {}) {
  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    .range(offset, offset + limit - 1);

  if (user_id) {
    query = query.eq('user_id', user_id);
  }

  if (status && status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }

  return data as Order[];
}

export async function getOrderById(id: string) {
  // Get the order
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching order:', error);
    throw error;
  }

  // Get the order items with product details
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select('*, product:products(name)')
    .eq('order_id', id);

  if (itemsError) {
    console.error('Error fetching order items:', itemsError);
    throw itemsError;
  }

  return {
    ...order,
    items: items || [],
  } as OrderWithItems;
}

export async function createOrder(
  orderData: Database['public']['Tables']['orders']['Insert'],
  orderItems: { product_id: string; quantity: number; price: number }[]
) {
  // Start a transaction
  const { data: order, error } = await supabase
    .from('orders')
    .insert(orderData)
    .select()
    .single();

  if (error) {
    console.error('Error creating order:', error);
    throw error;
  }

  // Insert order items
  const itemsToInsert = orderItems.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemsToInsert);

  if (itemsError) {
    console.error('Error adding order items:', itemsError);
    throw itemsError;
  }

  return order as Order;
}

export async function updateOrderStatus(
  id: string,
  status: 'pending' | 'processing' | 'completed' | 'cancelled',
  payment_status?: 'pending' | 'paid' | 'failed'
) {
  const updates: { status: string; payment_status?: string; updated_at: string } = {
    status,
    updated_at: new Date().toISOString(),
  };

  if (payment_status) {
    updates.payment_status = payment_status;
  }

  const { data, error } = await supabase
    .from('orders')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status:', error);
    throw error;
  }

  return data as Order;
}

export async function getOrderStats() {
  // Get count of orders by status
  const { data: statusCounts, error: statusError } = await supabase
    .from('orders')
    .select('status, count')
    .group('status');

  if (statusError) {
    console.error('Error fetching order status counts:', statusError);
    throw statusError;
  }

  // Get count of orders by payment status
  const { data: paymentCounts, error: paymentError } = await supabase
    .from('orders')
    .select('payment_status, count')
    .group('payment_status');

  if (paymentError) {
    console.error('Error fetching payment status counts:', paymentError);
    throw paymentError;
  }

  // Get total revenue
  const { data: revenue, error: revenueError } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('payment_status', 'paid');

  if (revenueError) {
    console.error('Error fetching revenue:', revenueError);
    throw revenueError;
  }

  const totalRevenue = revenue.reduce((sum, order) => sum + Number(order.total_amount), 0);

  return {
    statusCounts: statusCounts || [],
    paymentCounts: paymentCounts || [],
    totalRevenue,
  };
}