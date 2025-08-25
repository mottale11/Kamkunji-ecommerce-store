import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { Buffer } from 'buffer';

const CONSUMER_KEY = process.env.NEXT_PUBLIC_MPESA_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.NEXT_PUBLIC_MPESA_CONSUMER_SECRET || '';
const MPESA_PASSKEY = process.env.NEXT_PUBLIC_MPESA_PASSKEY || '';
const MPESA_SHORTCODE = process.env.NEXT_PUBLIC_MPESA_SHORTCODE || '';
const MPESA_CALLBACK_URL = process.env.NEXT_PUBLIC_MPESA_CALLBACK_URL || '';

interface StkPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  data?: any;
}

// Get M-Pesa access token
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
    
    const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error getting M-Pesa access token:', error);
    throw new Error('Failed to get M-Pesa access token');
  }
}

// Initiate STK push payment
async function initiateSTKPush(phone: string, amount: number, orderId: string): Promise<PaymentResult> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');
    const callbackUrl = `${MPESA_CALLBACK_URL}?orderId=${orderId}`;
    
    const response = await axios.post<StkPushResponse>(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phone,
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: callbackUrl,
        AccountReference: `Order-${orderId}`,
        TransactionDesc: `Payment for order ${orderId}`,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: response.data.ResponseCode === '0',
      message: response.data.CustomerMessage,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error initiating STK push:', error);
    return {
      success: false,
      message: error.response?.data?.errorMessage || 'Failed to initiate payment',
      data: error.response?.data,
    };
  }
}

// Verify payment status
async function verifyPayment(checkoutRequestId: string): Promise<PaymentResult> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query',
      {
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: response.data.ResultCode === '0',
      message: response.data.ResultDesc,
      data: response.data,
    };
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return {
      success: false,
      message: error.response?.data?.errorMessage || 'Failed to verify payment',
      data: error.response?.data,
    };
  }
}

export const mpesaService = {
  initiateSTKPush,
  verifyPayment,
};
