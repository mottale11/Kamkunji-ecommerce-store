export interface PaymentRequest {
  phone: string;
  amount: string;
}

export interface PaymentResponse {
  message: string;
  data: {
    amount: string;
    phone: string;
    reference: string;
    CheckoutRequestID: string;
  };
}

export interface PaymentError {
  message: string;
}

const LIPIA_API_BASE_URL = 'https://lipia-api.kreativelabske.com/api';
const API_KEY = '30e8daddccc82cef5bf2d8bc9692a6dedc38344a';
const APP_ID = '6898ed91e1ab624540296395';

export class PaymentService {
  /**
   * Initiate M-Pesa STK push payment
   */
  static async initiatePayment(phone: string, amount: number): Promise<PaymentResponse> {
    try {
      console.log('🔧 PaymentService: Starting payment initiation...');
      console.log('🔧 PaymentService: Input phone:', phone);
      console.log('🔧 PaymentService: Input amount:', amount);
      
      // Format phone number to ensure it starts with 07
      const formattedPhone = phone.startsWith('07') ? phone : `07${phone.replace(/^0/, '')}`;
      console.log('🔧 PaymentService: Formatted phone:', formattedPhone);
      
      // Format amount to string as required by the API
      const formattedAmount = amount.toString();
      console.log('🔧 PaymentService: Formatted amount:', formattedAmount);
      
      const requestBody = {
        phone: formattedPhone,
        amount: formattedAmount,
      };
      console.log('🔧 PaymentService: Request body:', requestBody);
      console.log('🔧 PaymentService: API URL:', `${LIPIA_API_BASE_URL}/request/stk`);
      console.log('🔧 PaymentService: API Key:', API_KEY.substring(0, 10) + '...');
      console.log('🔧 PaymentService: App ID:', APP_ID);
      
      const response = await fetch(`${LIPIA_API_BASE_URL}/request/stk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
          'X-App-ID': APP_ID, // Add App ID header if required
        },
        body: JSON.stringify(requestBody),
      });

      console.log('🔧 PaymentService: Lipia API Response Status:', response.status);
      console.log('🔧 PaymentService: Lipia API Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('🔧 PaymentService: Lipia API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          url: response.url
        });
        
        const errorData: PaymentError = await response.json();
        console.error('🔧 PaymentService: Lipia API Error Data:', errorData);
        throw new Error(errorData.message || `Lipia API request failed with status ${response.status}`);
      }

      const paymentData: PaymentResponse = await response.json();
      console.log('🔧 PaymentService: Lipia API Success Response:', paymentData);
      return paymentData;
      
    } catch (error) {
      console.error('🔧 PaymentService: Error during payment initiation:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred during payment');
    }
  }

  /**
   * Validate phone number format
   */
  static validatePhoneNumber(phone: string): boolean {
    // Kenyan phone number format: 07XXXXXXXX
    const phoneRegex = /^07\d{8}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneNumber(phone: string): string {
    if (phone.startsWith('07') && phone.length === 10) {
      return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
    }
    return phone;
  }

  /**
   * Get payment status message
   */
  static getPaymentStatusMessage(status: string): string {
    switch (status) {
      case 'processing':
        return 'Payment is being processed. Please check your phone for the M-Pesa prompt.';
      case 'success':
        return 'Payment successful! Your order has been confirmed.';
      case 'error':
        return 'Payment failed. Please try again or contact support.';
      case 'cancelled':
        return 'Payment was cancelled. Please try again.';
      default:
        return 'Payment status unknown.';
    }
  }
}
