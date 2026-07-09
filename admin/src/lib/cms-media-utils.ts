const CMS_PUBLIC_URL =
  process.env.CMS_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_CMS_URL ||
  'https://admin.orasage.com/cms';

export function resolveCmsMediaUrl(
  image: number | { id: number; url?: string | null } | null | undefined,
): string | null {
  if (!image || typeof image === 'number') return null;
  const url = image.url;
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${CMS_PUBLIC_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}
