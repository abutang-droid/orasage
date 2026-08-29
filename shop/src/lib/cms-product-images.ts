import { readFile } from 'node:fs/promises';
import path from 'node:path';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

type CmsMedia = {
  url?: string | null;
  filename?: string | null;
  alt?: string | null;
};

type CmsProductImageRow = {
  sku: string;
  image?: CmsMedia | number | null;
};

/** 物理落盘：shop/public/cms-media/<filename> → 同源 /cms-media/<filename>（不经 CMS HTTP 反代） */
export function localCmsMediaPath(filename: string | null | undefined): string | null {
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

function resolveMediaUrl(media: CmsMedia | number | null | undefined): string | null {
  if (!media || typeof media === 'number') return null;
  const fromName = localCmsMediaPath(media.filename ?? null);
  if (fromName) return fromName;
  const url = media.url;
  if (!url) return null;
  const fromUrl = localCmsMediaPath(filenameFromMediaUrl(url));
  if (fromUrl) return fromUrl;
  return null;
}

let cachedMap: Map<string, string> | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 15_000;

async function loadPhysicalSkuMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  try {
    const raw = await readFile(path.join(process.cwd(), 'public/cms-media/sku-map.json'), 'utf8');
    const obj = JSON.parse(raw) as Record<string, string>;
    for (const [sku, filename] of Object.entries(obj)) {
      const local = localCmsMediaPath(filename);
      if (sku && local) map.set(sku, local);
    }
  } catch {
    /* no physical map yet */
  }
  return map;
}

/**
 * SKU → 主图 URL。
 * 优先读 public/cms-media/sku-map.json（物理复制的文件）；否则再问本机 CMS API，但仍解析成 /cms-media/ 同源路径。
 */
export async function fetchProductImageMap(): Promise<Map<string, string>> {
  if (cachedMap && Date.now() < cacheExpiry) {
    return cachedMap;
  }

  const physical = await loadPhysicalSkuMap();
  if (physical.size > 0) {
    cachedMap = physical;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
    return physical;
  }

  const map = new Map<string, string>();
  try {
    const res = await fetch(
      `${CMS_INTERNAL_URL}/api/shop-product-images?limit=200&depth=1`,
      { next: { revalidate: 15 } } as RequestInit,
    );
    if (!res.ok) return map;
    const data = (await res.json()) as { docs?: CmsProductImageRow[] };
    for (const row of data.docs ?? []) {
      const url = resolveMediaUrl(row.image);
      if (row.sku && url) {
        map.set(row.sku, url);
        if (!row.sku.endsWith('-gift')) {
          map.set(`${row.sku}-gift`, url);
        }
      }
    }
    cachedMap = map;
    cacheExpiry = Date.now() + CACHE_TTL_MS;
  } catch {
    // CMS 不可用时返回空映射，前台使用分类占位图
  }
  return map;
}

export async function getProductImageUrl(sku: string): Promise<string | null> {
  const map = await fetchProductImageMap();
  if (map.has(sku)) return map.get(sku) ?? null;
  if (sku.endsWith('-gift')) {
    return map.get(sku.slice(0, -'-gift'.length)) ?? null;
  }
  return null;
}

const CRYSTAL_ELEMENT_PLACEHOLDERS = new Set([
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
]);

/** 分类占位图（无 CMS 主图时）；五行水晶有专属能量占位图 */
export function fallbackProductImageUrl(sku: string, category?: string): string {
  const baseSku = sku.endsWith('-gift') ? sku.slice(0, -'-gift'.length) : sku;
  if (CRYSTAL_ELEMENT_PLACEHOLDERS.has(baseSku)) {
    return `/product-placeholders/${baseSku}.svg`;
  }
  const cat = category ?? (sku.startsWith('crystal') ? 'crystal' : sku.startsWith('report') ? 'report' : 'service');
  return `/product-placeholders/${cat}.svg`;
}
