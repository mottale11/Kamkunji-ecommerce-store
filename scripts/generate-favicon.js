const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Ensure output directory exists
const publicDir = path.join(__dirname, '../public');
const faviconSizes = [16, 32, 48, 72, 96, 128, 144, 152, 192, 384, 512];
const appleSizes = [57, 60, 72, 76, 114, 120, 144, 152, 180];

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function generateFavicon() {
  try {
    // Check if sharp is installed
    try {
      require.resolve('sharp');
    } catch (e) {
      console.log('Installing sharp...');
      execSync('npm install sharp --save-dev', { stdio: 'inherit' });
    }

    const sourceLogo = path.join(__dirname, '../src/app/Logo.png');
    
    // Generate favicon.ico
    await sharp(sourceLogo)
      .resize(64, 64)
      .toFile(path.join(publicDir, 'favicon.ico'));
    
    // Generate favicon sizes
    for (const size of faviconSizes) {
      await sharp(sourceLogo)
        .resize(size, size)
        .toFile(path.join(publicDir, `favicon-${size}x${size}.png`));
    }
    
    // Generate apple touch icons
    for (const size of appleSizes) {
      await sharp(sourceLogo)
        .resize(size, size)
        .toFile(path.join(publicDir, `apple-touch-icon-${size}x${size}.png`));
    }
    
    // Generate apple-touch-icon.png (180x180)
    await sharp(sourceLogo)
      .resize(180, 180)
      .toFile(path.join(publicDir, 'apple-touch-icon.png'));
    
    // Generate site.webmanifest
    const manifest = {
      name: 'Kamkunji Ndogo',
      short_name: 'Kamkunji',
      description: 'Your trusted online marketplace for quality products',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#10B981',
      icons: [
        {
          src: '/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    };
    
    await fs.writeFile(
      path.join(publicDir, 'site.webmanifest'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log('✅ Favicon generation complete!');
  } catch (error) {
    console.error('Error generating favicon:', error);
    process.exit(1);
  }
}

generateFavicon();
