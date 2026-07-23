import { getSiteApex } from './orasage-app-shell/config';

const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  `https://admin.${getSiteApex()}/cms`;

export type CmsMediaRef = {
  url?: string | null;
  alt?: string | null;
};

/**
 * Join Payload media `url` with the public CMS origin.
 * Handles both `/api/media/file/...` and `/cms/api/media/file/...` relative paths
 * without producing `/cms/cms/...`.
 */
export function resolveCmsMediaUrl(media: CmsMediaRef | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const url = media.url?.trim();
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const base = CMS_PUBLIC_URL.replace(/\/$/, '');
  const origin = base.replace(/\/cms$/i, '');
  if (url.startsWith('/cms/')) return `${origin}${url}`;
  if (url.startsWith('/')) return `${base}${url}`;
  return `${base}/${url}`;
}

/** Remote CMS hosts that next/image may load (orasage + oricosmos). */
export function isCmsMediaUrl(src: string): boolean {
  try {
    const host = new URL(src).hostname;
    return host === 'admin.orasage.com' || host === 'admin.oricosmos.com';
  } catch {
    return false;
  }
}
