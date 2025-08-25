// Test script to verify Lipia API key directly
// Run this with: node test-lipia-api.js

const LIPIA_API_BASE_URL = 'https://lipia-api.kreativelabske.com/api';
const API_KEY = '30e8daddccc82cef5bf2d8bc9692a6dedc38344a';
const APP_ID = '6898ed91e1ab624540296395';

async function testLipiaAPI() {
  console.log('🧪 Testing Lipia API Directly\n');
  console.log('API URL:', `${LIPIA_API_BASE_URL}/request/stk`);
  console.log('API Key:', API_KEY.substring(0, 10) + '...');
  console.log('App ID:', APP_ID);
  
  try {
    const response = await fetch(`${LIPIA_API_BASE_URL}/request/stk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'X-App-ID': APP_ID, // Add App ID header if required
      },
      body: JSON.stringify({
        phone: '0769694900',
        amount: '100'
      }),
    });

    console.log('\n📡 Response Status:', response.status);
    console.log('📡 Response Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Success! Response:', JSON.stringify(data, null, 2));
    } else {
      const errorData = await response.json();
      console.log('❌ Error Response:', JSON.stringify(errorData, null, 2));
      
      if (response.status === 403) {
        console.log('\n🔑 403 Forbidden - API Key Issues:');
        console.log('1. Check if API key is correct in dashboard');
        console.log('2. Verify API key is active and not expired');
        console.log('3. Ensure API key has permission for this endpoint');
        console.log('4. Check if API key format is correct');
      }
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error.message);
  }
}

// Run test
testLipiaAPI().catch(console.error);
