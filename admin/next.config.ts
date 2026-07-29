import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  /** 商品主图/场景视频经 Server Action 上传，需大于默认 1MB */
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb',
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
