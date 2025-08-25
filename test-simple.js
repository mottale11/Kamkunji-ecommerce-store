// Simple test to check if the payment API endpoint is accessible
// Run this with: node test-simple.js

const API_BASE_URL = 'http://localhost:3000';
const PAYMENT_ENDPOINT = `${API_BASE_URL}/api/payments`;

async function testSimple() {
  console.log('🧪 Simple API Test\n');
  console.log('Testing endpoint:', PAYMENT_ENDPOINT);
  
  try {
    // Test 1: Check if endpoint is accessible
    console.log('\n📋 Test 1: Endpoint Accessibility');
    const response = await fetch(PAYMENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '0768793923',
        amount: '100'
      }),
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Endpoint is accessible and working!');
    } else {
      console.log('❌ Endpoint returned error status');
    }
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Possible issues:');
      console.log('1. Development server not running (run: npm run dev)');
      console.log('2. Wrong port number');
      console.log('3. Network connectivity issues');
    }
  }
}

// Run test
testSimple().catch(console.error);
