/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  compiler: {
    styledComponents: true,
  },
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