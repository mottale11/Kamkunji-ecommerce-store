'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSupabase } from '@/components/SupabaseProvider';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PayWithMpesaButton from '@/components/PayWithMpesaButton';
import Link from 'next/link';

type OrderStatus = 'pending_payment' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  image_url?: string;
}

interface Order {
  id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  shipping_address?: {
    phone: string;
    email: string;
    address: string;
  };
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { supabase } = useSupabase();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            order_items(*, products(name, image_url))
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setOrder({
          ...data,
          order_items: data.order_items.map((item: any) => ({
            ...item,
            product_name: item.products?.name || 'Product',
            image_url: item.products?.image_url
          }))
        });
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load order');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchOrder();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link 
            href="/orders"
            className="text-blue-600 hover:underline"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              order.status === 'pending_payment' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'paid' ? 'bg-blue-100 text-blue-800' :
              order.status === 'delivered' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {order.status.replace('_', ' ')}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-lg font-medium mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="font-medium">{item.product_name}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">KES {item.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium">Total Amount</h2>
              <p className="text-xl font-bold">KES {order.total_amount.toLocaleString()}</p>
            </div>

            {order.status === 'pending_payment' && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Complete Payment</h3>
                <PayWithMpesaButton
                  orderId={order.id}
                  amount={order.total_amount}
                  phoneNumber={order.shipping_address?.phone}
                  onSuccess={() => router.refresh()}
                  className="w-full justify-center py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Pay KES {order.total_amount.toLocaleString()} with M-Pesa
                </PayWithMpesaButton>
                <p className="text-sm text-gray-600 mt-2 text-center">
                  You'll receive an M-Pesa push notification
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
