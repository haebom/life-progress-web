/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  images: {
    domains: ['lh3.googleusercontent.com'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  output: 'standalone',
  trailingSlash: false,
  async redirects() {
    return [
      {
        source: '/dashboard',
        missing: [
          {
            type: 'header',
            key: 'x-user-auth',
          },
        ],
        permanent: false,
        destination: '/login',
      },
    ];
  },
};

module.exports = withPWA(nextConfig); 