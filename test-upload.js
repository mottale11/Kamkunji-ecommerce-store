// Simple test script to verify image upload functionality
// Run this with: node test-upload.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
  console.log('🔍 Testing image upload functionality...\n');
  
  try {
    // Test 1: Try to access the bucket directly
    console.log('1. Testing direct bucket access...');
    const { data: files, error: listError } = await supabase.storage
      .from('product-images')
      .list('', { limit: 1 });
    
    if (listError) {
      console.error('❌ Bucket access error:', listError.message);
      return;
    }
    
    console.log('✅ Bucket access successful');
    console.log('   Files in bucket:', files?.length || 0);
    
    // Test 2: Try to get bucket info (this should work even with RLS)
    console.log('\n2. Testing bucket info...');
    try {
      const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('product-images');
      
      if (bucketError) {
        console.error('❌ Bucket info error:', bucketError.message);
      } else {
        console.log('✅ Bucket info retrieved');
        console.log('   - Name:', bucketInfo.name);
        console.log('   - Public:', bucketInfo.public);
        console.log('   - File size limit:', bucketInfo.file_size_limit);
      }
    } catch (infoError) {
      console.log('⚠️  Bucket info not accessible (this is normal with RLS)');
    }
    
    // Test 3: Test upload permissions (without actually uploading)
    console.log('\n3. Testing upload permissions...');
    const testFileName = 'test-permissions.txt';
    
    // Create a small test file
    const testContent = 'This is a test file to check upload permissions';
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    
    try {
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(testFileName, testBlob);
      
      if (uploadError) {
        console.log('❌ Upload test failed:', uploadError.message);
        
        if (uploadError.message.includes('Bucket not found')) {
          console.log('   🔧 Issue: Bucket does not exist');
        } else if (uploadError.message.includes('permission') || uploadError.message.includes('access')) {
          console.log('   🔧 Issue: Permission denied - check storage policies');
        } else if (uploadError.message.includes('RLS') || uploadError.message.includes('policy')) {
          console.log('   🔧 Issue: Row Level Security policy blocking upload');
        }
      } else {
        console.log('✅ Upload test successful');
        
        // Clean up test file
        const { error: deleteError } = await supabase.storage
          .from('product-images')
          .remove([testFileName]);
        
        if (deleteError) {
          console.log('⚠️  Could not clean up test file:', deleteError.message);
        } else {
          console.log('✅ Test file cleaned up');
        }
      }
    } catch (uploadException) {
      console.error('❌ Upload exception:', uploadException.message);
    }
    
    console.log('\n🎯 Summary:');
    console.log('   - Bucket access: ✅ Working');
    console.log('   - Upload permissions: Check the results above');
    console.log('   - If upload failed, check your storage policies in Supabase dashboard');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testUpload();
