import { NextRequest, NextResponse } from 'next/server';
import { PaymentService } from '@/services/payments';

export async function POST(request: NextRequest) {
  try {
    console.log('🌐 API Route: Payment request received');
    
    const body = await request.json();
    const { phone, amount } = body;
    
    console.log('🌐 API Route: Request body:', { phone, amount });

    // Validate required fields
    if (!phone || !amount) {
      console.log('🌐 API Route: Validation failed - missing fields');
      return NextResponse.json(
        { error: 'Phone number and amount are required' },
        { status: 400 }
      );
    }

    // Validate phone number format
    if (!PaymentService.validatePhoneNumber(phone)) {
      console.log('🌐 API Route: Validation failed - invalid phone format');
      return NextResponse.json(
        { error: 'Invalid phone number format. Please use format: 07XXXXXXXX' },
        { status: 400 }
      );
    }

    // Validate amount
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      console.log('🌐 API Route: Validation failed - invalid amount');
      return NextResponse.json(
        { error: 'Invalid amount. Amount must be a positive number' },
        { status: 400 }
      );
    }

    console.log('🌐 API Route: Validation passed, calling PaymentService...');
    console.log('🌐 API Route: Phone:', phone, 'Amount:', numericAmount);

    // Initiate payment with Lipia API
    const paymentResponse = await PaymentService.initiatePayment(phone, numericAmount);

    // Log successful payment initiation
    console.log('🌐 API Route: Payment initiated successfully:', {
      phone,
      amount: numericAmount,
      reference: paymentResponse.data.reference,
      checkoutRequestId: paymentResponse.data.CheckoutRequestID,
    });

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully',
      data: paymentResponse.data,
    });

  } catch (error) {
    console.error('🌐 API Route: Payment initiation error:', error);

    if (error instanceof Error) {
      // Handle specific payment errors
      if (error.message.includes('invalid phone number')) {
        return NextResponse.json(
          { error: 'Invalid phone number. Please check and try again.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('insufficient user balance')) {
        return NextResponse.json(
          { error: 'Insufficient M-Pesa balance. Please top up and try again.' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('user took too long to pay')) {
        return NextResponse.json(
          { error: 'Payment timeout. Please try again.' },
          { status: 408 }
        );
      }
      
      if (error.message.includes('Request cancelled by user')) {
        return NextResponse.json(
          { error: 'Payment was cancelled. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred during payment initiation' },
      { status: 500 }
    );
  }
}
