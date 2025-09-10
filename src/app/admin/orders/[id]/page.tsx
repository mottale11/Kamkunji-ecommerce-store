import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaTruck, FaTimes, FaPrint, FaEnvelope, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

// Reuse the Order and OrderItem interfaces from the orders page

interface OrderDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailsPage({ params }: OrderDetailsPageProps) {
  const { id } = await params;
  const supabase = createServerComponentClient({ cookies });

  // Fetch order details
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, product:products(*)),
      user:profiles(*)
    `)
    .eq('id', id)
    .single();

  if (error || !order) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Order not found</h2>
        <p className="mt-2 text-gray-600">The requested order could not be found.</p>
        <Link 
          href="/admin/orders" 
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          <FaArrowLeft className="mr-2" /> Back to Orders
        </Link>
      </div>
    );
  }

  const updateOrderStatus = async (formData: FormData) => {
    'use server';
    const status = formData.get('status') as string;
    const notes = formData.get('notes') as string;
    
    const supabase = createServerComponentClient({ cookies });
    
    // Update order status
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString(),
        admin_notes: notes
      })
      .eq('id', id);

    if (!error) {
      // Send email notification
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: order.user.email,
          subject: `Order #${order.id.substring(0, 8)} Status Update`,
          text: `Your order status has been updated to: ${status}\n\nOrder ID: ${order.id}\nStatus: ${status}\n\nThank you for shopping with us!`,
          html: `
            <h2>Order Status Updated</h2>
            <p>Your order <strong>#${order.id.substring(0, 8)}</strong> status has been updated to: <strong>${status}</strong></p>
            ${notes ? `<div style="margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 4px;">
              <p><strong>Admin Notes:</strong></p>
              <p>${notes.replace(/\n/g, '<br>')}</p>
            </div>` : ''}
            <p>Thank you for shopping with us!</p>
          `
        })
      });
    }

    redirect(`/admin/orders/${id}`);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing': return <FaCheck className="mr-1" />;
      case 'shipped': return <FaTruck className="mr-1" />;
      case 'delivered': return <FaCheck className="mr-1" />;
      case 'cancelled': return <FaTimes className="mr-1" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <div className="flex items-center">
              <Link 
                href="/admin/orders" 
                className="mr-4 text-gray-500 hover:text-gray-700"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.id.substring(0, 8)}
              </h1>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                {getStatusIcon(order.status)}
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Placed on {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaPrint className="mr-2 h-4 w-4" />
              Print
            </button>
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaEnvelope className="mr-2 h-4 w-4" />
              Resend Confirmation
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Order Items
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flow-root">
                  <ul className="divide-y divide-gray-200">
                    {order.order_items.map((item: any) => (
                      <li key={item.id} className="py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                className="h-full w-full object-cover object-center"
                              />
                            ) : (
                              <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                                <span>No image</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">
                                {item.product?.name || 'Product not found'}
                              </h4>
                              <p className="mt-1 text-sm text-gray-500">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>${order.total_amount.toFixed(2)}</p>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <p>Shipping</p>
                    <p>$0.00</p>
                  </div>
                  <div className="mt-2 flex justify-between text-lg font-medium text-gray-900 border-t border-gray-200 pt-4">
                    <p>Total</p>
                    <p>${order.total_amount.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Shipping Information
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Shipping Address</h4>
                    <address className="mt-1 not-italic text-sm text-gray-900">
                      {order.shipping_address.full_name}<br />
                      {order.shipping_address.address_line1}<br />
                      {order.shipping_address.address_line2 && (
                        <>{order.shipping_address.address_line2}<br /></>
                      )}
                      {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}<br />
                      {order.shipping_address.country}
                    </address>
                    <p className="mt-2 text-sm text-gray-500">
                      <span className="font-medium">Phone:</span> {order.shipping_address.phone}
                    </p>
                    {order.shipping_address.email && (
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Email:</span> {order.shipping_address.email}
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Shipping Method</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      Standard Shipping
                    </p>
                    <h4 className="mt-4 text-sm font-medium text-gray-500">Payment Method</h4>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.payment_method || 'Credit Card'}
                    </p>
                    <p className="mt-1 text-sm text-gray-900">
                      Status: <span className="capitalize">{order.payment_status}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Status Update */}
          <div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Update Status
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form action={updateOrderStatus}>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      defaultValue={order.status}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="mt-4">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                      Notes (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="notes"
                        name="notes"
                        rows={4}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                        placeholder="Add any notes about this order status update..."
                        defaultValue={order.admin_notes || ''}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      These notes will be included in the customer's email notification.
                    </p>
                  </div>
                  <div className="mt-6">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FaEdit className="mr-2 h-4 w-4" />
                      Update Status
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Customer Information */}
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Customer
                </h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-lg">
                      {order.user?.full_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-medium text-gray-900">
                      {order.user?.full_name || 'Guest User'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {order.user?.email || 'No email provided'}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-500">Customer Since</h4>
                  <p className="text-sm text-gray-900">
                    {order.user?.created_at 
                      ? new Date(order.user.created_at).toLocaleDateString() 
                      : 'N/A'}
                  </p>
                </div>
                {order.user?.phone && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-sm text-gray-900">{order.user.phone}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
