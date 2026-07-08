import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens'],
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'admin.orasage.com', pathname: '/cms/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3120', pathname: '/cms/**' },
      { protocol: 'http', hostname: 'localhost', port: '3120', pathname: '/cms/**' },
    ],
  },
};

export default nextConfig;
