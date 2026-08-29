import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  },
  images: {
    remotePatterns: [
      // Tunnel 下 admin.orasage.com/cms 常直连 :3103 导致媒体 404；公网媒体走 cms 子域
      { protocol: 'https', hostname: 'cms.orasage.com', pathname: '/cms/**' },
      { protocol: 'https', hostname: 'admin.orasage.com', pathname: '/cms/**' },
      { protocol: 'https', hostname: 'cms.oricosmos.com', pathname: '/cms/**' },
      { protocol: 'https', hostname: 'admin.oricosmos.com', pathname: '/cms/**' },
      { protocol: 'http', hostname: '127.0.0.1', port: '3120', pathname: '/cms/**' },
      { protocol: 'http', hostname: 'localhost', port: '3120', pathname: '/cms/**' },
    ],
  },
};

export default withNextIntl(nextConfig);
