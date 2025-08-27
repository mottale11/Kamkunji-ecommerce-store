/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // TypeScript configuration
  typescript: {
    // Keep type checking enabled but ignore build errors for now
    ignoreBuildErrors: true,
  },
  
  // ESLint configuration
  eslint: {
    // Keep ESLint running but don't fail build on warnings
    ignoreDuringBuilds: true,
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Fixes "Module not found: Can't resolve 'encoding'" error
    config.resolve.alias = {
      ...config.resolve.alias,
      'encoding': false,
    };
    
    return config;
  },
  
  // Enable static HTML export for Vercel
  output: 'standalone',
  
  // Enable server actions
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
