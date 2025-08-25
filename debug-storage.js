// Debug script to diagnose Supabase Storage issues
// Run this with: node debug-storage.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Storage...\n');
console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey ? supabaseKey.length : 'Missing');
console.log('Key starts with:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'N/A');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStorage() {
  try {
    // Test 1: Basic connection
    console.log('1. Testing basic connection...');
    const { data: profile, error: profileError } = await supabase.auth.getUser();
    console.log('   Auth status:', profileError ? 'Error' : 'Connected');
    if (profileError) console.log('   Auth error:', profileError.message);
    
    // Test 2: List buckets with detailed error info
    console.log('\n2. Testing bucket listing...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('   ❌ Bucket listing error:', bucketError.message);
      console.error('   Error code:', bucketError.code);
      console.error('   Error details:', bucketError.details);
      console.error('   Error hint:', bucketError.hint);
      
      // Check if it's a permission issue
      if (bucketError.message.includes('permission') || bucketError.message.includes('access')) {
        console.log('\n   🔧 This looks like a permission issue.');
        console.log('   Try checking your Supabase project settings and RLS policies.');
      }
    } else {
      console.log('   ✅ Bucket listing successful');
      console.log('   Available buckets:', buckets?.map(b => b.id).join(', ') || 'None');
      
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`   - ${bucket.id}: public=${bucket.public}, size_limit=${bucket.file_size_limit}`);
        });
      }
    }
    
    // Test 3: Try to access the specific bucket directly
    console.log('\n3. Testing direct bucket access...');
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('product-images')
        .list('', { limit: 1 });
      
      if (listError) {
        console.error('   ❌ Direct bucket access error:', listError.message);
        console.error('   Error code:', listError.code);
      } else {
        console.log('   ✅ Direct bucket access successful');
        console.log('   Files in bucket:', files?.length || 0);
      }
    } catch (directError) {
      console.error('   ❌ Direct bucket access exception:', directError.message);
    }
    
    // Test 4: Check if bucket exists by trying to create it (will fail if exists)
    console.log('\n4. Testing bucket existence...');
    try {
      const { error: createError } = await supabase.storage.createBucket('test-bucket-exists', {
        public: false
      });
      
      if (createError && createError.message.includes('already exists')) {
        console.log('   ✅ Bucket creation test shows storage is working');
      } else if (createError) {
        console.log('   ⚠️  Storage error (might be permission issue):', createError.message);
      } else {
        console.log('   ✅ Test bucket created successfully');
        // Clean up test bucket
        await supabase.storage.deleteBucket('test-bucket-exists');
        console.log('   ✅ Test bucket cleaned up');
      }
    } catch (createException) {
      console.error('   ❌ Bucket creation exception:', createException.message);
    }
    
    // Test 5: Check project settings
    console.log('\n5. Checking project configuration...');
    console.log('   Project URL:', supabaseUrl);
    console.log('   Using anon key (public access)');
    console.log('   Note: Anon keys have limited permissions by default');
    
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('   1. Check if your Supabase project is active and not paused');
    console.log('   2. Verify the bucket name is exactly "product-images" (case sensitive)');
    console.log('   3. Check if Row Level Security (RLS) is enabled on storage.objects');
    console.log('   4. Verify storage policies are set correctly');
    console.log('   5. Try using the service_role key instead of anon key for admin operations');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the debug
debugStorage();
