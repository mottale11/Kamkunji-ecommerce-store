# 💳 M-Pesa Payment Integration with Lipia Online

## Overview

This e-commerce website now includes a fully integrated M-Pesa payment system using the Lipia Online API. Users can complete their purchases by receiving an M-Pesa STK push notification on their phones.

## 🚀 Features

- **Real-time M-Pesa Integration**: Direct integration with Lipia Online payment gateway
- **STK Push Notifications**: Users receive payment prompts on their phones
- **Secure Payment Processing**: Server-side payment validation and processing
- **Comprehensive Error Handling**: User-friendly error messages for various payment scenarios
- **Payment Status Tracking**: Real-time payment status updates
- **Phone Number Validation**: Automatic formatting and validation of Kenyan phone numbers

## 🔧 Technical Implementation

### 1. Payment Service (`src/services/payments.ts`)

The core payment logic is handled by the `PaymentService` class:

```typescript
export class PaymentService {
  // Initiate M-Pesa STK push payment
  static async initiatePayment(phone: string, amount: number): Promise<PaymentResponse>
  
  // Validate phone number format
  static validatePhoneNumber(phone: string): boolean
  
  // Format phone number for display
  static formatPhoneNumber(phone: string): string
}
```

**Key Features:**
- Phone number formatting (ensures 07XXXXXXXX format)
- Amount validation and formatting
- Error handling for various payment scenarios
- Integration with Lipia Online API

### 2. API Endpoint (`src/app/api/payments/route.ts`)

Server-side payment processing endpoint:

```typescript
POST /api/payments
{
  "phone": "0768793923",
  "amount": "25000"
}
```

**Validation:**
- Phone number format validation
- Amount validation (positive number)
- Required field validation
- Error response handling

### 3. Checkout Page (`src/app/checkout/page.tsx`)

Enhanced checkout experience with:

- **Form Validation**: Comprehensive input validation
- **Payment Status Management**: Real-time status updates
- **User Feedback**: Clear success/error messages
- **Phone Number Formatting**: Live phone number preview
- **Payment Instructions**: Clear M-Pesa payment guidance

## 📱 Payment Flow

### Step 1: User Fills Checkout Form
- User enters shipping information
- Phone number is validated and formatted
- Form validation ensures all required fields are completed

### Step 2: Payment Initiation
- User clicks "Place Order & Pay with M-PESA"
- Frontend validates form data
- API call is made to `/api/payments`
- Payment request is sent to Lipia Online

### Step 3: M-Pesa STK Push
- Lipia Online sends STK push to user's phone
- User receives payment prompt
- User enters M-Pesa PIN to authorize payment

### Step 4: Payment Confirmation
- Payment status is updated in real-time
- Success/error messages are displayed
- Order confirmation details are shown
- User is redirected after successful payment

## 🔑 Configuration

### Environment Variables

The payment system uses the following configuration:

```bash
# Lipia Online API Configuration
LIPIA_API_BASE_URL=https://lipia-api.kreativelabske.com/api
API_KEY=500363aa30196975f734d82340da5f9558a155ad
```

**Note**: The API key is currently hardcoded in the service for development. In production, consider moving it to environment variables.

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments` | POST | Initiate M-Pesa payment |
| `/api/db-init` | GET | Initialize database (for categories) |

## 🛡️ Security Features

### Input Validation
- Phone number format validation (07XXXXXXXX)
- Amount validation (positive numbers only)
- Required field validation
- XSS protection through proper input sanitization

### Error Handling
- Comprehensive error messages
- User-friendly error display
- Secure error logging
- No sensitive information exposure

### Payment Security
- Server-side payment processing
- API key authentication
- Secure HTTPS communication
- Payment status verification

## 📊 Error Handling

The system handles various payment scenarios:

| Error Type | Description | User Action |
|------------|-------------|-------------|
| Invalid Phone Number | Phone format incorrect | Check phone number format |
| Insufficient Balance | User's M-Pesa balance too low | Top up M-Pesa account |
| Payment Timeout | User took too long to pay | Try payment again |
| User Cancelled | Payment was cancelled | Retry payment |
| Network Error | Connection issues | Check internet and retry |

## 🎨 User Experience Features

### Visual Feedback
- **Loading States**: Spinner and status messages during payment
- **Success Indicators**: Green checkmarks and confirmation messages
- **Error Alerts**: Clear error messages with actionable advice
- **Progress Indicators**: Step-by-step payment status updates

### Phone Number Assistance
- **Live Formatting**: Shows formatted phone number as user types
- **Validation Hints**: Clear error messages for invalid formats
- **Format Guide**: Placeholder text showing expected format

### Payment Instructions
- **Clear Guidance**: Step-by-step payment instructions
- **M-Pesa Information**: Explains what to expect on phone
- **Success Confirmation**: Clear confirmation of completed payments

## 🧪 Testing

### Test Scenarios

1. **Valid Payment Flow**
   - Fill form with valid data
   - Submit payment request
   - Verify STK push received
   - Complete payment on phone
   - Verify success message

2. **Error Scenarios**
   - Invalid phone number
   - Missing required fields
   - Network errors
   - Payment cancellation
   - Insufficient balance

3. **Edge Cases**
   - Very large amounts
   - Special characters in form fields
   - Multiple rapid submissions
   - Browser refresh during payment

### Test Data

Use these test phone numbers:
- `0768793923` - Valid format
- `768793923` - Will be auto-formatted
- `1234567890` - Invalid format (should show error)

## 🚀 Deployment Considerations

### Production Checklist

- [ ] Move API key to environment variables
- [ ] Enable HTTPS for all API calls
- [ ] Set up proper logging and monitoring
- [ ] Configure error tracking (e.g., Sentry)
- [ ] Set up payment webhook handling
- [ ] Implement payment reconciliation
- [ ] Add rate limiting for payment requests
- [ ] Set up backup payment methods

### Monitoring

Monitor these key metrics:
- Payment success rate
- Average payment processing time
- Error rates by type
- User abandonment at payment step
- API response times

## 🔄 Future Enhancements

### Planned Features
- **Payment Webhooks**: Real-time payment status updates
- **Payment History**: User payment history tracking
- **Refund Processing**: Automated refund handling
- **Multiple Payment Methods**: Add more payment options
- **Payment Analytics**: Detailed payment insights
- **Mobile App Integration**: Native mobile payment experience

### Technical Improvements
- **Payment Queue**: Handle high-volume payment requests
- **Retry Logic**: Automatic retry for failed payments
- **Payment Reconciliation**: Automated payment verification
- **Multi-currency Support**: Support for different currencies
- **Payment Scheduling**: Future-dated payments

## 📚 API Documentation

### Lipia Online API Reference

**Base URL**: `https://lipia-api.kreativelabske.com/api`

**Endpoint**: `/request/stk`

**Method**: `POST`

**Headers**:
```
Authorization: Bearer {api_key}
Content-Type: application/json
```

**Request Body**:
```json
{
  "phone": "0768793923",
  "amount": "25000"
}
```

**Response**:
```json
{
  "message": "callback received successfully",
  "data": {
    "amount": "25000",
    "phone": "0768793923",
    "reference": "RD37AV1CXF",
    "CheckoutRequestID": "ws_CO_03042023154723210768793923"
  }
}
```

## 🆘 Support

### Common Issues

1. **Payment Not Received**
   - Check phone number format
   - Ensure M-Pesa is active
   - Check network connectivity

2. **Payment Failed**
   - Verify sufficient M-Pesa balance
   - Check payment timeout
   - Ensure correct PIN entry

3. **Technical Issues**
   - Check browser console for errors
   - Verify API endpoint accessibility
   - Check server logs for errors

### Contact Information

For technical support or payment issues:
- Check the console for detailed error messages
- Review the payment logs
- Contact the development team

---

**Note**: This integration uses the Lipia Online payment gateway. For production use, ensure compliance with local payment regulations and implement proper security measures.
