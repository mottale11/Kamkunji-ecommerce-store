/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  
  // Fix path resolution
  outputFileTracingRoot: path.join(__dirname, '../../'),
  
  // Disable static generation
  trailingSlash: true,
  
  // Force dynamic rendering
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    },
  },
  
  // Server external packages
  serverExternalPackages: ['@supabase/supabase-js'],
  
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
    // Add path resolution for Windows
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        '@': path.resolve(__dirname, 'src'),
      },
    };

    // Important: return the modified config
    return config;
  },
  
  // Output configuration
  output: 'standalone',
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Enable CORS for development
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
