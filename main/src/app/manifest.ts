import type { MetadataRoute } from 'next';

/** Installable Android / Chrome entry for the portal. Subdomains stay in the browser. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'OraSage — 命理与能量',
    short_name: 'OraSage',
    description: '八字、紫微、塔罗与能量器物。',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#FAFAF8',
    theme_color: '#FAFAF8',
    categories: ['lifestyle'],
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
