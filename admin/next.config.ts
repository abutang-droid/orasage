import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens'],
};

export default nextConfig;
