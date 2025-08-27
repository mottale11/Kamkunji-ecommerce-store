/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable React 19
  experimental: {
    reactRoot: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
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
  serverActions: {
    bodySizeLimit: '2mb',
  },
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
