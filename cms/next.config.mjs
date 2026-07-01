import { withPayload } from '@payloadcms/next/withPayload';

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
};

export default withPayload(nextConfig);
