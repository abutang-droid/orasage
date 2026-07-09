import { withPayload } from '@payloadcms/next/withPayload';

const cmsBasePath = process.env.CMS_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  transpilePackages: ['@orasage/ui', '@orasage/tokens', '@orasage/i18n'],
  ...(cmsBasePath ? { basePath: cmsBasePath } : {}),
};

export default withPayload(nextConfig);
