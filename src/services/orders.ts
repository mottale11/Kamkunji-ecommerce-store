import { supabase } from '@/utils/supabase';
import { Database } from '@/types/database.types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  order_items: Array<{
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    products: Database['public']['Tables']['products']['Row'] & {
      product_images?: Array<{ url: string }>;
    };
  }>;
  user?: {
    id: string;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  };
};

type CreateOrderData = {
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    fullName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const { data, error } = await supabase.rpc('create_order_with_items', {
      p_user_id: orderData.userId,
      p_items: orderData.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      p_shipping_address: orderData.shippingAddress,
      p_payment_method: orderData.paymentMethod,
      p_items_price: orderData.itemsPrice,
      p_shipping_price: orderData.shippingPrice,
      p_tax_price: orderData.taxPrice,
      p_total_price: orderData.totalPrice
    });

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          products:product_id(*, product_images:product_images(*)) 
        ),
        user:user_id(id, full_name, email, phone)
      `)
      .eq('id', orderId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // No rows returned
        return null;
      }
      throw error;
    }

    return data as Order;
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(
          *,
          products:product_id(*, product_images:product_images(*)) 
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error(`Error fetching orders for user ${userId}:`, error);
    throw error;
  }
};

export const updateOrderToPaid = async (orderId: string, paymentResult: any): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        is_paid: true,
        paid_at: new Date().toISOString(),
        payment_result: paymentResult
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`Error updating order ${orderId} to paid:`, error);
    throw error;
  }
};

export const updateOrderToDelivered = async (orderId: string): Promise<Order> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .update({
        is_delivered: true,
        delivered_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data as Order;
  } catch (error) {
    console.error(`Error updating order ${orderId} to delivered:`, error);
    throw error;
  }
};

export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items:order_items(*, products:product_id(*)),
        user:user_id(id, full_name, email)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};