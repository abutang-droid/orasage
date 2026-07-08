import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  webpack(config) {
    config.resolve.symlinks = false;
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
