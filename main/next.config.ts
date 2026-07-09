import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n', '@orasage/analytics'],
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  },
};

export default withNextIntl(nextConfig);
