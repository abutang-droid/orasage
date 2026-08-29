/** 物理落盘媒体：优先同源 /cms-media/<filename>，不经 CMS HTTP 反代 */

export type CmsMediaRef = {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
};

function localCmsMediaPath(filename: string | null | undefined): string | null {
  if (!filename?.trim()) return null;
  const name = filename.trim().replace(/^.*[/\\]/, '');
  if (!name || name.includes('..')) return null;
  return `/cms-media/${encodeURI(name)}`;
}

function filenameFromMediaUrl(url: string): string | null {
  try {
    const u = url.startsWith('http') ? new URL(url) : null;
    const pathname = u?.pathname ?? url;
    const marker = '/cms/api/media/file/';
    const idx = pathname.indexOf(marker);
    if (idx >= 0) return decodeURIComponent(pathname.slice(idx + marker.length));
    if (pathname.startsWith('/cms-media/')) return decodeURIComponent(pathname.slice('/cms-media/'.length));
  } catch {
    /* ignore */
  }
  return null;
}

export function resolveCmsMediaUrl(media: CmsMediaRef | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const fromName = localCmsMediaPath(media.filename ?? null);
  if (fromName) return fromName;
  const url = media.url;
  if (!url) return null;
  const fromUrl = localCmsMediaPath(filenameFromMediaUrl(url));
  if (fromUrl) return fromUrl;
  // 无物理文件名时保留绝对 URL（兼容未同步环境）
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return null;
}
