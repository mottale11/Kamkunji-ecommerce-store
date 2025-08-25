// Test Order Status Script
// Run this with: node test-order-status.js

const { createClient } = require('@supabase/supabase-js');

// Configuration - Load from environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check if environment variables are set
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_KEY ? '✅ Set' : '❌ Missing');
  console.error('\n💡 Make sure to:');
  console.error('   1. Create a .env.local file in your project root');
  console.error('   2. Add your Supabase credentials');
  console.error('   3. Run: npm run dev (to load environment variables)');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testOrderStatus() {
  console.log('🔍 Testing Order Status System...\n');

  try {
    // 1. Check if we can connect to Supabase
    console.log('1️⃣ Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('orders')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('❌ Supabase connection failed:', testError.message);
      return;
    }
    console.log('✅ Supabase connection successful\n');

    // 2. Get all orders to see current status
    console.log('2️⃣ Fetching all orders...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, status, payment_status, checkout_request_id, created_at, total_amount')
      .order('created_at', { ascending: false })
      .limit(10);

    if (ordersError) {
      console.error('❌ Error fetching orders:', ordersError.message);
      return;
    }

    console.log(`✅ Found ${orders.length} orders:`);
    orders.forEach((order, index) => {
      console.log(`   ${index + 1}. Order ${order.id}:`);
      console.log(`      Status: ${order.status || 'NULL'}`);
      console.log(`      Payment Status: ${order.payment_status || 'NULL'}`);
      console.log(`      Checkout Request ID: ${order.checkout_request_id || 'NULL'}`);
      console.log(`      Amount: ${order.total_amount || 'NULL'}`);
      console.log(`      Created: ${order.created_at || 'NULL'}`);
      console.log('');
    });

    // 3. Check table structure
    console.log('3️⃣ Checking table structure...');
    if (orders.length > 0) {
      const sampleOrder = orders[0];
      console.log('✅ Table columns found:');
      Object.keys(sampleOrder).forEach(key => {
        console.log(`   - ${key}: ${typeof sampleOrder[key]}`);
      });
    }
    console.log('');

    // 4. Test order update (if orders exist)
    if (orders.length > 0) {
      const testOrder = orders[0];
      console.log('4️⃣ Testing order update...');
      console.log(`   Testing with order: ${testOrder.id}`);
      
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'test_status',
          updated_at: new Date().toISOString()
        })
        .eq('id', testOrder.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Order update failed:', updateError.message);
      } else {
        console.log('✅ Order update successful');
        console.log(`   New status: ${updatedOrder.status}`);
        
        // Revert the test change
        await supabase
          .from('orders')
          .update({
            status: testOrder.status,
            updated_at: testOrder.updated_at || testOrder.created_at
          })
          .eq('id', testOrder.id);
        
        console.log('✅ Test status reverted');
      }
    }
    console.log('');

    // 5. Check for specific issues
    console.log('5️⃣ Checking for common issues...');
    
    const pendingOrders = orders.filter(o => o.status === 'pending_payment');
    const paidOrders = orders.filter(o => o.status === 'paid');
    const nullStatusOrders = orders.filter(o => !o.status);
    
    console.log(`   Orders with 'pending_payment' status: ${pendingOrders.length}`);
    console.log(`   Orders with 'paid' status: ${paidOrders.length}`);
    console.log(`   Orders with NULL status: ${nullStatusOrders.length}`);
    
    if (nullStatusOrders.length > 0) {
      console.log('   ⚠️  Found orders with NULL status - this might cause issues');
    }
    
    if (pendingOrders.length > 0 && paidOrders.length === 0) {
      console.log('   ⚠️  All orders are pending - M-Pesa callback might not be working');
    }

    console.log('\n🎯 Debug Summary:');
    console.log('   - Check the console logs above for any errors');
    console.log('   - Verify that orders have proper status values');
    console.log('   - Check if M-Pesa callback is being triggered');
    console.log('   - Use the debug endpoint: /api/debug/orders');
    console.log('   - Check Supabase logs for callback errors');

  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testOrderStatus().then(() => {
  console.log('\n🏁 Test completed');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Test crashed:', error);
  process.exit(1);
});
