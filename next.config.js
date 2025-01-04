/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com']
  },
  optimizeFonts: true,
  swcMinify: true
}

module.exports = nextConfig 