// Test script for M-Pesa payment integration
// Run this with: node test-payment.js

const API_BASE_URL = 'http://localhost:3000';
const PAYMENT_ENDPOINT = `${API_BASE_URL}/api/payments`;

// Test data
const testCases = [
  {
    name: 'Valid Payment Request',
    data: {
      phone: '0768793923',
      amount: '1000'
    },
    expectedStatus: 200
  },
  {
    name: 'Invalid Phone Number',
    data: {
      phone: '1234567890',
      amount: '1000'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing Phone Number',
    data: {
      amount: '1000'
    },
    expectedStatus: 400
  },
  {
    name: 'Missing Amount',
    data: {
      phone: '0768793923'
    },
    expectedStatus: 400
  },
  {
    name: 'Invalid Amount',
    data: {
      phone: '0768793923',
      amount: '-100'
    },
    expectedStatus: 400
  }
];

async function testPaymentEndpoint() {
  console.log('🧪 Testing M-Pesa Payment Integration\n');
  console.log('Make sure your development server is running on http://localhost:3000\n');

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`📤 Request: ${JSON.stringify(testCase.data, null, 2)}`);
    
    try {
      const response = await fetch(PAYMENT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data),
      });

      const responseData = await response.json();
      
      console.log(`📥 Status: ${response.status}`);
      console.log(`📥 Response: ${JSON.stringify(responseData, null, 2)}`);
      
      if (response.status === testCase.expectedStatus) {
        console.log('✅ PASS - Status matches expected\n');
      } else {
        console.log(`❌ FAIL - Expected status ${testCase.expectedStatus}, got ${response.status}\n`);
      }
      
    } catch (error) {
      console.log(`❌ ERROR: ${error.message}\n`);
    }
    
    // Add delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('🎯 Test Summary:');
  console.log('- Check the responses above to verify error handling');
  console.log('- For successful payments, check your phone for M-Pesa prompt');
  console.log('- Verify the payment reference and checkout ID are returned');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testPaymentEndpoint().catch(console.error);
}

module.exports = { testPaymentEndpoint };
