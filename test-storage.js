// Test script to verify Supabase Storage bucket setup
// Run this with: node test-storage.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('🔍 Testing Supabase Storage setup...\n');

  try {
    // 1. Test bucket listing
    console.log('1. Checking available storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError.message);
      return;
    }

    console.log('✅ Available buckets:', buckets.map(b => b.id).join(', ') || 'None');
    
    // 2. Check if product-images bucket exists
    const productImagesBucket = buckets.find(b => b.id === 'product-images');
    
    if (!productImagesBucket) {
      console.log('\n❌ Storage bucket "product-images" not found!');
      console.log('📋 Please follow the instructions in STORAGE-SETUP.md to create the bucket.');
      console.log('   Or run the SQL commands in your Supabase SQL Editor.');
      return;
    }

    console.log('✅ Storage bucket "product-images" found');
    console.log('   - Public:', productImagesBucket.public);
    console.log('   - File size limit:', productImagesBucket.file_size_limit, 'bytes');
    console.log('   - Allowed MIME types:', productImagesBucket.allowed_mime_types?.join(', ') || 'Any');

    // 3. Test bucket access
    console.log('\n2. Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });

    if (listError) {
      console.error('❌ Error accessing bucket:', listError.message);
      console.log('   This might indicate a policy issue. Check your storage policies.');
      return;
    }

    console.log('✅ Bucket access successful');
    console.log('   - Files in bucket:', files?.length || 0);

    // 4. Test policy access
    console.log('\n3. Testing storage policies...');
    
    // Test public read access
    const { data: publicAccess, error: publicError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });

    if (publicError) {
      console.log('⚠️  Public read access might be restricted:', publicError.message);
    } else {
      console.log('✅ Public read access working');
    }

    console.log('\n🎉 Storage setup appears to be working correctly!');
    console.log('   You can now upload product images from the admin panel.');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   1. Check your .env.local file has correct Supabase credentials');
    console.log('   2. Verify your Supabase project is active');
    console.log('   3. Check the STORAGE-SETUP.md file for setup instructions');
  }
}

// Run the test
testStorage();
