/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Fix workspace root warning
  outputFileTracingRoot: process.cwd(),
  
  // Disable static generation
  trailingSlash: true,
  
  // Force dynamic rendering
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  
  // Disable static optimization
  generateBuildId: async () => {
    return 'build-' + Date.now();
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
  
  // Output configuration
  output: 'standalone',
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Server external packages
  serverExternalPackages: ['@supabase/supabase-js']
};

module.exports = nextConfig;
