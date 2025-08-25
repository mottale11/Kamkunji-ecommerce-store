import { supabase } from '../utils/supabase';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: string;
  shippingAddress?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export class EmailService {
  // Send payment confirmation email
  static async sendPaymentConfirmation(orderData: OrderEmailData): Promise<boolean> {
    try {
      const subject = `Payment Confirmed - Order #${orderData.orderId}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Confirmed</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .total { font-weight: bold; font-size: 18px; padding: 15px 0; border-top: 2px solid #e5e7eb; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Payment Confirmed!</h1>
              <p>Thank you for your order</p>
            </div>
            
            <div class="content">
              <h2>Hello ${orderData.customerName},</h2>
              <p>Great news! We've received your payment and your order has been confirmed.</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${orderData.orderId}</p>
                <p><strong>Status:</strong> <span style="color: #10b981; font-weight: bold;">Paid</span></p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h4>Items Ordered:</h4>
                ${orderData.orderItems.map(item => `
                  <div class="item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>KSh ${item.price.toLocaleString()}</span>
                  </div>
                `).join('')}
                
                <div class="total">
                  <span>Total Amount:</span>
                  <span>KSh ${orderData.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              
              <p>We're now processing your order and will ship it as soon as possible. You'll receive another email with tracking information once your order ships.</p>
              
              <p>If you have any questions, please don't hesitate to contact us.</p>
              
              <p>Best regards,<br>The Kamkunji Ndogo Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${orderData.customerEmail}</p>
              <p>© ${new Date().getFullYear()} Kamkunji Ndogo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Payment Confirmed - Order #${orderData.orderId}

Hello ${orderData.customerName},

Great news! We've received your payment and your order has been confirmed.

Order Details:
- Order ID: #${orderData.orderId}
- Status: Paid
- Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderData.orderItems.map(item => `- ${item.quantity}x ${item.name}: KSh ${item.price.toLocaleString()}`).join('\n')}

Total Amount: KSh ${orderData.totalAmount.toLocaleString()}

We're now processing your order and will ship it as soon as possible. You'll receive another email with tracking information once your order ships.

If you have any questions, please don't hesitate to contact us.

Best regards,
The Kamkunji Ndogo Team
      `;

      return await this.sendEmail({
        to: orderData.customerEmail,
        subject,
        html,
        text
      });
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return false;
    }
  }

  // Send order status update email
  static async sendStatusUpdateNotification(orderData: OrderEmailData): Promise<boolean> {
    try {
      const statusMessages = {
        'processing': 'Your order is now being processed and prepared for shipping.',
        'shipped': 'Your order has been shipped and is on its way to you!',
        'delivered': 'Your order has been delivered successfully.',
        'cancelled': 'Your order has been cancelled as requested.'
      };

      const statusMessage = statusMessages[orderData.status] || 'Your order status has been updated.';
      
      const subject = `Order Status Update - Order #${orderData.orderId}`;
      
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Status Update</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
            .status-badge { 
              display: inline-block; 
              padding: 8px 16px; 
              background: #10b981; 
              color: white; 
              border-radius: 20px; 
              font-weight: bold; 
              text-transform: capitalize;
            }
            .order-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
            .shipping-info { background: #eff6ff; padding: 15px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 Order Status Update</h1>
              <p>Your order is on the move</p>
            </div>
            
            <div class="content">
              <h2>Hello ${orderData.customerName},</h2>
              <p>${statusMessage}</p>
              
              <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> #${orderData.orderId}</p>
                <p><strong>New Status:</strong> <span class="status-badge">${orderData.status}</span></p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                
                <h4>Items Ordered:</h4>
                ${orderData.orderItems.map(item => `
                  <div class="item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>KSh ${item.price.toLocaleString()}</span>
                  </div>
                `).join('')}
                
                <p><strong>Total Amount:</strong> KSh ${orderData.totalAmount.toLocaleString()}</p>
              </div>
              
              ${orderData.status === 'shipped' && orderData.trackingNumber ? `
                <div class="shipping-info">
                  <h4>🚚 Shipping Information</h4>
                  <p><strong>Tracking Number:</strong> ${orderData.trackingNumber}</p>
                  ${orderData.estimatedDelivery ? `<p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>` : ''}
                  <p>You can track your package using the tracking number above.</p>
                </div>
              ` : ''}
              
              ${orderData.status === 'delivered' ? `
                <p>🎉 Your order has been delivered! We hope you love your purchase.</p>
                <p>If you have any issues or questions about your order, please contact us immediately.</p>
              ` : ''}
              
              <p>Thank you for choosing Kamkunji Ndogo!</p>
              
              <p>Best regards,<br>The Kamkunji Ndogo Team</p>
            </div>
            
            <div class="footer">
              <p>This email was sent to ${orderData.customerEmail}</p>
              <p>© ${new Date().getFullYear()} Kamkunji Ndogo. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      const text = `
Order Status Update - Order #${orderData.orderId}

Hello ${orderData.customerName},

${statusMessage}

Order Details:
- Order ID: #${orderData.orderId}
- New Status: ${orderData.status}
- Date: ${new Date().toLocaleDateString()}

Items Ordered:
${orderData.orderItems.map(item => `- ${item.quantity}x ${item.name}: KSh ${item.price.toLocaleString()}`).join('\n')}

Total Amount: KSh ${orderData.totalAmount.toLocaleString()}

${orderData.status === 'shipped' && orderData.trackingNumber ? `
Shipping Information:
- Tracking Number: ${orderData.trackingNumber}
${orderData.estimatedDelivery ? `- Estimated Delivery: ${orderData.estimatedDelivery}` : ''}

You can track your package using the tracking number above.
` : ''}

${orderData.status === 'delivered' ? `
🎉 Your order has been delivered! We hope you love your purchase.

If you have any issues or questions about your order, please contact us immediately.
` : ''}

Thank you for choosing Kamkunji Ndogo!

Best regards,
The Kamkunji Ndogo Team
      `;

      return await this.sendEmail({
        to: orderData.customerEmail,
        subject,
        html,
        text
      });
    } catch (error) {
      console.error('Error sending status update email:', error);
      return false;
    }
  }

  // Main email sending function
  private static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // For now, we'll use a simple approach that logs the email
      // In production, you would integrate with a service like SendGrid, AWS SES, or similar
      
      console.log('📧 Email would be sent:', {
        to: emailData.to,
        subject: emailData.subject,
        timestamp: new Date().toISOString()
      });

      // TODO: Integrate with your preferred email service
      // Example with SendGrid:
      /*
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      
      const msg = {
        to: emailData.to,
        from: process.env.FROM_EMAIL || 'noreply@kamkunji-ndogo.com',
        subject: emailData.subject,
        text: emailData.text,
        html: emailData.html,
      };
      
      await sgMail.send(msg);
      */

      // For now, return true to simulate successful email sending
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }
}
