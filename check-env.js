// Check Environment Variables
// Run this to verify your .env.local file is working

console.log('🔍 Checking Environment Variables...\n');

// Check if .env.local is loaded
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local file found');
  
  // Read and display the file content (without sensitive values)
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('📋 Environment variables found:');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      if (key) {
        const value = process.env[key];
        if (value) {
          console.log(`   ${key}: ✅ Loaded (${value.substring(0, 10)}...)`);
        } else {
          console.log(`   ${key}: ❌ Not loaded`);
        }
      }
    }
  });
} else {
  console.log('❌ .env.local file not found');
  console.log('💡 Create a .env.local file in your project root with:');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
}

console.log('\n🔧 Current Environment Variables:');
console.log('   NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');

console.log('\n💡 To load environment variables:');
console.log('   1. Make sure .env.local exists');
console.log('   2. Restart your terminal/command prompt');
console.log('   3. Or run: npm run dev (in another terminal)');
console.log('   4. Then run: node check-env.js');
