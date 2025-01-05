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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        'process/browser': require.resolve('process/browser'),
      };
    }

    // Firebase와 관련된 모듈 처리
    config.module.rules.push({
      test: /\.(mjs|js|jsx|ts|tsx)$/,
      exclude: /node_modules\/(?!(@firebase|firebase|undici)\/).*/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['next/babel'],
          plugins: [
            '@babel/plugin-transform-private-methods',
            '@babel/plugin-transform-class-properties',
            '@babel/plugin-transform-private-property-in-object'
          ],
        },
      },
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', '@firebase/auth', '@firebase/firestore'],
    optimizeCss: true,
    forceSwcTransforms: true,
  },
  output: 'standalone',
  trailingSlash: false,
  transpilePackages: ['next/font/google'],
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  swcLoader: {
    minify: true,
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: true,
        decorators: true,
        dynamicImport: true,
      },
      transform: {
        react: {
          runtime: 'automatic',
          pragma: 'React.createElement',
          pragmaFrag: 'React.Fragment',
          throwIfNamespace: true,
          development: process.env.NODE_ENV === 'development',
          useBuiltins: true,
        },
      },
    },
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