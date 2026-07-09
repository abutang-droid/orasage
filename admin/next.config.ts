import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  async redirects() {
    return [
      { source: '/orders', destination: '/shop/orders', permanent: true },
      { source: '/beads', destination: '/shop/diy', permanent: true },
    ];
  },
};

export default nextConfig;
