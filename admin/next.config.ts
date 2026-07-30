import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  // Legacy form uploads (and any remaining media-in-action paths) exceed the 1MB default.
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  async redirects() {
    return [
      { source: '/orders', destination: '/shop/orders', permanent: true },
      { source: '/beads', destination: '/shop/diy', permanent: true },
    ];
  },
};

export default nextConfig;
