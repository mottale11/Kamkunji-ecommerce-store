'use client';

import { useState } from 'react';
import { mpesaService } from '@/services/mpesa';
import { toast } from 'react-toastify';
import { useSupabase } from '@/components/SupabaseProvider';

interface PayWithMpesaButtonProps {
  orderId: string;
  amount: number;
  phoneNumber?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export default function PayWithMpesaButton({
  orderId,
  amount,
  phoneNumber: initialPhoneNumber,
  onSuccess,
  onError,
  className = '',
  children = 'Pay with M-Pesa',
}: PayWithMpesaButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { supabase } = useSupabase();

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // If no phone number provided, prompt user
      let phone = initialPhoneNumber;
      if (!phone) {
        phone = prompt('Enter your M-Pesa phone number (e.g., 2547XXXXXXXX)');
        if (!phone) {
          toast.info('Payment cancelled');
          return;
        }
      }

      // Format phone number (remove + and any non-digits, ensure starts with 254)
      const formattedPhone = phone.replace(/\D/g, '').replace(/^0/, '254');
      
      // Validate phone number
      if (!/^254[17]\d{8}$/.test(formattedPhone)) {
        throw new Error('Please enter a valid Kenyan phone number starting with 254');
      }

      // Initiate STK push
      const result = await mpesaService.initiateSTKPush(
        formattedPhone,
        amount,
        orderId
      );

      if (!result.success) {
        throw new Error(result.message || 'Failed to initiate payment');
      }

      // Update order with checkout request ID
      const { error } = await supabase
        .from('orders')
        .update({
          checkout_request_id: result.data.CheckoutRequestID,
          payment_method: 'mpesa',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      // Show success message
      toast.success('Payment request sent to your phone. Please check your M-Pesa to complete the payment.');
      
      // Start polling for payment status
      pollPaymentStatus(orderId, result.data.CheckoutRequestID);
      
      // Call success callback if provided
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to process payment');
      if (onError) onError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const pollPaymentStatus = async (orderId: string, checkoutRequestId: string, attempt = 1) => {
    if (attempt > 20) { // Max 20 attempts (about 1 minute with 3s delay)
      toast.warning('Payment verification taking longer than expected. We\'ll notify you once received.');
      return;
    }

    try {
      const result = await mpesaService.verifyPayment(checkoutRequestId);
      
      if (result.success) {
        // Payment successful
        await updateOrderStatus(orderId, 'paid');
        toast.success('Payment received! Thank you for your order.');
      } else if (attempt < 20) {
        // Payment not yet complete, poll again after delay
        setTimeout(() => pollPaymentStatus(orderId, checkoutRequestId, attempt + 1), 3000);
      } else {
        // Max attempts reached
        toast.warning('Payment verification timed out. Please check your M-Pesa and refresh the page.');
      }
    } catch (error) {
      console.error('Error polling payment status:', error);
      if (attempt < 20) {
        setTimeout(() => pollPaymentStatus(orderId, checkoutRequestId, attempt + 1), 3000);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: status,
          payment_status: status === 'paid' ? 'completed' : 'pending',
          updated_at: new Date().toISOString() 
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Refresh the page or update the UI as needed
      window.location.reload();
      
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
