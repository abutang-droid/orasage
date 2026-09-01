const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://cms.orasage.com/cms';

export type CmsMediaRef = {
  url?: string | null;
  alt?: string | null;
};

export function resolveCmsMediaUrl(media: CmsMediaRef | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const url = media.url;
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const u = new URL(url);
      if (u.pathname.includes('/cms/api/media/')) {
        const base = new URL(CMS_PUBLIC_URL);
        return `${base.origin}${u.pathname}${u.search}`;
      }
    } catch {
      /* keep original */
    }
    return url;
  }
  if (url.startsWith('/cms/')) {
    const base = CMS_PUBLIC_URL.replace(/\/cms\/?$/, '');
    return `${base}${url}`;
  }
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
