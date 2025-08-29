'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PaymentService } from '@/services/payments';
import { CartService, CartItem } from '@/services/cart';
import { formatKSH } from '@/utils/currency';
import { useSupabase } from '@/components/SupabaseProvider';

// Prevent this page from being pre-rendered during build
export const dynamic = 'force-dynamic';

// Cart items will be loaded dynamically from CartService

interface ShippingInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  city: string;
  additionalInfo: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  data?: {
    reference: string;
    CheckoutRequestID: string;
  };
}

export default function CheckoutPage() {
  return <CheckoutPageContent />;
}

function CheckoutPageContent() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    additionalInfo: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  // Load cart items on component mount
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        setIsLoading(true);
        const items = await CartService.getCartItemsWithDetails(supabase);
        setCartItems(items);
      } catch (error) {
        console.error('Error loading cart items:', error);
        setPaymentError('Failed to load cart items');
      } finally {
        setIsLoading(false);
      }
    };

    loadCartItems();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear payment error when user starts typing
    if (paymentError) {
      setPaymentError('');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const calculateTotal = () => {
    // In a real app, this would include shipping, taxes, etc.
    return calculateSubtotal();
  };

  const validateForm = (): boolean => {
    if (!shippingInfo.fullName.trim()) {
      setPaymentError('Full name is required');
      return false;
    }
    
    if (!shippingInfo.phoneNumber.trim()) {
      setPaymentError('Phone number is required');
      return false;
    }
    
    if (!PaymentService.validatePhoneNumber(shippingInfo.phoneNumber)) {
      setPaymentError('Please enter a valid phone number in format: 07XXXXXXXX');
      return false;
    }
    
    if (!shippingInfo.email.trim()) {
      setPaymentError('Email is required');
      return false;
    }
    
    if (!shippingInfo.address.trim()) {
      setPaymentError('Address is required');
      return false;
    }
    
    if (!shippingInfo.city.trim()) {
      setPaymentError('City is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Check if fetch is available
    if (typeof fetch === 'undefined') {
      setPaymentError('Fetch API not available. Please use a modern browser.');
      return;
    }
    
    setIsSubmitting(true);
    setPaymentStatus('processing');
    setPaymentError('');
    
    try {
      console.log('🚀 Starting payment process...');
      console.log('📱 Phone:', shippingInfo.phoneNumber);
      console.log('💰 Amount:', calculateTotal());
      
      // Call our API endpoint to initiate payment
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: shippingInfo.phoneNumber,
          amount: calculateTotal(),
        }),
      });

      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', Object.fromEntries(response.headers.entries()));

      const result: PaymentResult = await response.json();
      console.log('📡 API Response Data:', result);

      if (!response.ok) {
        console.error('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data: result
        });
        throw new Error(result.message || `Payment request failed with status ${response.status}`);
      }

      if (result.success) {
        console.log('✅ Payment initiated successfully:', result);
        setPaymentResult(result);
      setPaymentStatus('success');
      
        // Show success message and redirect after delay
      setTimeout(() => {
        router.push('/');
        }, 5000);
      } else {
        console.error('❌ Payment failed:', result);
        throw new Error(result.message || 'Payment failed');
      }
      
    } catch (error) {
      console.error('💥 Payment Error Details:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      let errorMessage = 'An unexpected error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Unable to connect to payment server. Please try again later.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setPaymentStatus('error');
      setPaymentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    return PaymentService.formatPhoneNumber(phone);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading cart items...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {paymentStatus === 'success' && paymentResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">🎉 Payment Successful!</p>
          <p className="mb-2">Your order has been placed and payment confirmed.</p>
          <div className="text-sm bg-green-200 p-3 rounded">
            <p><strong>Reference:</strong> {paymentResult.data?.reference}</p>
            <p><strong>Checkout ID:</strong> {paymentResult.data?.CheckoutRequestID}</p>
          </div>
          <p className="mt-2 text-sm">Redirecting to homepage in 5 seconds...</p>
        </div>
      )}
      
      {paymentStatus === 'error' && paymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-semibold">❌ Payment Failed</p>
          <p>{paymentError}</p>
          <p className="text-sm mt-2">Please check your details and try again.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>
                
                {/* Phone Number (for M-PESA) */}
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (for M-PESA)
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={shippingInfo.phoneNumber}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., 07XX XXX XXX"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                  {shippingInfo.phoneNumber && (
                    <p className="text-xs text-gray-500 mt-1">
                      Formatted: {formatPhoneNumber(shippingInfo.phoneNumber)}
                    </p>
                  )}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>
                
                {/* City */}
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>
                
                {/* Address */}
                <div className="col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>
                
                {/* Additional Information */}
                <div className="col-span-2">
                  <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">Additional Information (Optional)</label>
                  <textarea
                    id="additionalInfo"
                    name="additionalInfo"
                    value={shippingInfo.additionalInfo}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={paymentStatus === 'processing'}
                  />
                </div>
              </div>
              
              <div className="mt-8">
                <button
                  type="submit"
                  disabled={paymentStatus === 'processing' || paymentStatus === 'success'}
                  className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
                    paymentStatus === 'processing' || paymentStatus === 'success'
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {paymentStatus === 'processing' 
                    ? '🔄 Initiating M-PESA Payment...' 
                    : paymentStatus === 'success'
                    ? '✅ Payment Successful!'
                    : '💳 Place Order & Pay with M-PESA'
                  }
                </button>
                
                {paymentStatus === 'processing' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-blue-800">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <p className="text-sm font-medium">Processing Payment...</p>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                    Please check your phone for the M-PESA payment prompt.
                      Enter your M-PESA PIN when prompted to complete the payment.
                    </p>
                  </div>
                )}
                
                {paymentStatus === 'success' && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      🎉 Payment completed successfully! You will receive an SMS confirmation shortly.
                    </p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
        
        {/* Order Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            
            <ul className="divide-y divide-gray-200 mb-4">
              {cartItems.map(item => (
                <li key={item.id} className="py-3 flex justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                  </div>
                  <p className="text-gray-600">{formatKSH(item.price)}</p>
                </li>
              ))}
            </ul>
            
            <div className="border-t border-gray-200 pt-4 mb-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatKSH(calculateSubtotal())}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatKSH(calculateTotal())}</span>
              </div>
            </div>
            
            {/* M-PESA Payment Info */}
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 text-green-800 mb-2">
                <span className="text-lg">💚</span>
                <h3 className="font-medium">M-PESA Payment</h3>
              </div>
              <p className="text-sm text-green-700">
                You&apos;ll receive an M-PESA prompt on your phone. 
                Enter your PIN to complete the payment securely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}