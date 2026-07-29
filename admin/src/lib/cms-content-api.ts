import { ENV } from './env';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

function authCookie(token: string) {
  return `${ENV.jwtCookieName}=${token}`;
}

async function cmsRequest(
  path: string,
  token: string,
  init?: RequestInit & { json?: unknown },
): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('Cookie', authCookie(token));
  let body = init?.body;
  if (init?.json !== undefined) {
    headers.set('Content-Type', 'application/json');
    body = JSON.stringify(init.json);
  }
  return fetch(`${CMS_INTERNAL_URL}${path}`, { ...init, headers, body, cache: 'no-store' });
}

/* ── 商品详情页文档 ─────────────────────────────────── */

export type CmsHeroImageRow = {
  id?: string;
  image: number | { id: number; url?: string | null };
  alt?: string | null;
  sort?: number | null;
};

export type CmsSectionRow = {
  id?: string;
  type: 'richText' | 'specList' | 'guide' | 'quote' | 'faq' | 'relatedSkus';
  title?: string | null;
  body?: string | null;
  quote?: string | null;
  attribution?: string | null;
  specItems?: Array<{ label: string; value: string }> | null;
  faqItems?: Array<{ question: string; answer: string }> | null;
  relatedSkus?: Array<{ sku: string }> | null;
};

export type CmsProductPageDoc = {
  id: number;
  sku: string;
  locale: string;
  status: 'draft' | 'published';
  subtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
  heroImages?: CmsHeroImageRow[] | null;
  sections?: CmsSectionRow[] | null;
};

/** 读取某 SKU + locale 的详情页文档（含草稿；depth=2 取图 URL） */
export async function getCmsProductPageDoc(
  sku: string,
  locale: string,
  token: string,
): Promise<CmsProductPageDoc | null> {
  const params = new URLSearchParams({
    'where[sku][equals]': sku,
    'where[locale][equals]': locale,
    limit: '1',
    depth: '2',
  });
  const res = await cmsRequest(`/api/shop-product-pages?${params}`, token);
  if (!res.ok) return null;
  const data = (await res.json()) as { docs?: CmsProductPageDoc[] };
  return data.docs?.[0] ?? null;
}

export type ProductPageInput = {
  status: 'draft' | 'published';
  subtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
  heroImages: Array<{ image: number; alt?: string | null; sort: number }>;
  sections: Array<Omit<CmsSectionRow, 'id'>>;
};

/** 创建或更新详情页文档 */
export async function upsertCmsProductPage(
  sku: string,
  locale: string,
  input: ProductPageInput,
  token: string,
): Promise<void> {
  const existing = await getCmsProductPageDoc(sku, locale, token);
  const payload = { sku, locale, ...input };
  const res = existing
    ? await cmsRequest(`/api/shop-product-pages/${existing.id}`, token, {
      method: 'PATCH',
      json: payload,
    })
    : await cmsRequest('/api/shop-product-pages', token, {
      method: 'POST',
      json: payload,
    });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存详情页失败 (${res.status}): ${err.slice(0, 300)}`);
  }
}

/** 上传媒体，返回 media id */
export async function uploadCmsMedia(file: File, alt: string, token: string): Promise<number> {
  const uploaded = await uploadCmsMediaFile(file, alt, token);
  return uploaded.id;
}

/** 上传媒体，返回 id + 公网可访问 URL */
export async function uploadCmsMediaFile(
  file: File,
  alt: string,
  token: string,
): Promise<{ id: number; publicUrl: string }> {
  const form = new FormData();
  form.append('file', file);
  form.append('alt', alt || file.name);
  const res = await cmsRequest('/api/media', token, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`媒体上传失败 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    doc?: { id: number; url?: string | null };
    id?: number;
    url?: string | null;
  };
  const doc = data.doc ?? data;
  const id = doc.id ?? data.id;
  if (!id) throw new Error('媒体上传成功但未返回 ID');
  const rawUrl = doc.url ?? data.url ?? null;
  const CMS_PUBLIC_URL =
    process.env.CMS_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_CMS_URL ||
    'https://admin.orasage.com/cms';
  const publicUrl = rawUrl
    ? (rawUrl.startsWith('http') ? rawUrl : `${CMS_PUBLIC_URL}${rawUrl.startsWith('/') ? '' : '/'}${rawUrl}`)
    : null;
  if (!publicUrl) throw new Error('媒体上传成功但未返回 URL');
  return { id, publicUrl };
}

/* ── 精选评价 ───────────────────────────────────────── */

export type CmsTestimonialDoc = {
  id: number;
  sku: string;
  locale: string;
  author: string;
  rating: number;
  body: string;
  sort?: number | null;
  enabled?: boolean;
};

export async function listCmsTestimonials(
  sku: string,
  locale: string,
  token: string,
): Promise<CmsTestimonialDoc[]> {
  const params = new URLSearchParams({
    'where[sku][equals]': sku,
    'where[locale][equals]': locale,
    sort: 'sort',
    limit: '50',
    depth: '0',
  });
  const res = await cmsRequest(`/api/shop-product-testimonials?${params}`, token);
  if (!res.ok) return [];
  const data = (await res.json()) as { docs?: CmsTestimonialDoc[] };
  return data.docs ?? [];
}

export type TestimonialInput = {
  author: string;
  rating: number;
  body: string;
  sort: number;
  enabled: boolean;
};

export async function upsertCmsTestimonial(
  sku: string,
  locale: string,
  input: TestimonialInput,
  token: string,
  id?: number,
): Promise<void> {
  const payload = { sku, locale, ...input };
  const res = id
    ? await cmsRequest(`/api/shop-product-testimonials/${id}`, token, {
      method: 'PATCH',
      json: payload,
    })
    : await cmsRequest('/api/shop-product-testimonials', token, {
      method: 'POST',
      json: payload,
    });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存评价失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

export async function deleteCmsTestimonial(id: number, token: string): Promise<void> {
  const res = await cmsRequest(`/api/shop-product-testimonials/${id}`, token, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`删除评价失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

/* ── 各站 Hero Globals ──────────────────────────────── */

export const HERO_APP_SLUGS = {
  main: 'home-hero',
  shop: 'shop-home-hero',
  bazi: 'bazi-home-hero',
  ziwei: 'ziwei-home-hero',
  tarot: 'tarot-home-hero',
} as const;

export type HeroAppId = keyof typeof HERO_APP_SLUGS;

export const HERO_APP_LABELS: Record<HeroAppId, string> = {
  main: '门户',
  shop: '商城',
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔罗',
};

export type CmsHeroGlobal = {
  id?: number;
  enabled?: boolean | null;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode?: 'text' | 'image' | 'video' | null;
  heroImage?: number | { id: number; url?: string | null } | null;
  heroVideo?: number | { id: number; url?: string | null } | null;
  videoExternalUrl?: string | null;
  videoAutoplay?: boolean | null;
  bodyText?: string | null;
};

export function isHeroAppId(value: string | null | undefined): value is HeroAppId {
  return Boolean(value && value in HERO_APP_SLUGS);
}

export async function getCmsHeroGlobal(
  app: HeroAppId,
  token: string,
): Promise<CmsHeroGlobal | null> {
  const slug = HERO_APP_SLUGS[app];
  const res = await cmsRequest(`/api/globals/${slug}?depth=1`, token);
  if (!res.ok) return null;
  return (await res.json()) as CmsHeroGlobal;
}

export type HeroGlobalInput = {
  enabled: boolean;
  eyebrow?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  displayMode: 'text' | 'image' | 'video';
  heroImage?: number | null;
  heroVideo?: number | null;
  videoExternalUrl?: string | null;
  videoAutoplay: boolean;
  bodyText?: string | null;
};

export async function updateCmsHeroGlobal(
  app: HeroAppId,
  input: HeroGlobalInput,
  token: string,
): Promise<void> {
  const slug = HERO_APP_SLUGS[app];
  const res = await cmsRequest(`/api/globals/${slug}`, token, {
    method: 'POST',
    json: input,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存 Hero 失败 (${res.status}): ${err.slice(0, 300)}`);
  }
}

/* ── 信息流 ─────────────────────────────────────────── */

export type FeedCollectionSlug = 'bazi-feed' | 'ziwei-feed';

export type CmsFeedDoc = {
  id: number;
  kind: 'order' | 'review';
  message: string;
  locale?: string | null;
  sort?: number | null;
  enabled?: boolean | null;
};

export async function listCmsFeedItems(
  collection: FeedCollectionSlug,
  token: string,
): Promise<CmsFeedDoc[]> {
  const params = new URLSearchParams({ sort: 'sort', limit: '200', depth: '0' });
  const res = await cmsRequest(`/api/${collection}?${params}`, token);
  if (!res.ok) return [];
  const data = (await res.json()) as { docs?: CmsFeedDoc[] };
  return data.docs ?? [];
}

export type FeedItemInput = {
  kind: 'order' | 'review';
  message: string;
  locale: string;
  sort: number;
  enabled: boolean;
};

export async function upsertCmsFeedItem(
  collection: FeedCollectionSlug,
  input: FeedItemInput,
  token: string,
  id?: number,
): Promise<void> {
  const res = id
    ? await cmsRequest(`/api/${collection}/${id}`, token, { method: 'PATCH', json: input })
    : await cmsRequest(`/api/${collection}`, token, { method: 'POST', json: input });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存信息流失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

export async function deleteCmsFeedItem(
  collection: FeedCollectionSlug,
  id: number,
  token: string,
): Promise<void> {
  const res = await cmsRequest(`/api/${collection}/${id}`, token, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`删除信息流失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

/* ── 信仰 taxonomy ──────────────────────────────────── */

export type CmsFaithDoc = {
  id: number;
  code: string;
  nameZh: string;
  nameEn: string;
  emoji?: string | null;
  rank?: number | null;
  adherentsM?: number | null;
  worshipFacing?: 'none' | 'qibla' | 'east' | 'jerusalem' | null;
  facingLabelZh?: string | null;
  facingLabelEn?: string | null;
  facingBearing?: number | null;
  wpStatus?: 'publish' | 'draft' | null;
};

export async function listCmsFaiths(token: string): Promise<CmsFaithDoc[]> {
  const params = new URLSearchParams({ sort: 'rank', limit: '200', depth: '0' });
  const res = await cmsRequest(`/api/faiths?${params}`, token);
  if (!res.ok) return [];
  const data = (await res.json()) as { docs?: CmsFaithDoc[] };
  return data.docs ?? [];
}

export async function getCmsFaith(id: number, token: string): Promise<CmsFaithDoc | null> {
  const res = await cmsRequest(`/api/faiths/${id}?depth=0`, token);
  if (!res.ok) return null;
  return (await res.json()) as CmsFaithDoc;
}

export type FaithInput = {
  code: string;
  nameZh: string;
  nameEn: string;
  emoji?: string | null;
  rank: number;
  adherentsM?: number | null;
  worshipFacing: 'none' | 'qibla' | 'east' | 'jerusalem';
  facingLabelZh?: string | null;
  facingLabelEn?: string | null;
  facingBearing?: number | null;
  wpStatus: 'publish' | 'draft';
};

export async function upsertCmsFaith(
  input: FaithInput,
  token: string,
  id?: number,
): Promise<number> {
  const res = id
    ? await cmsRequest(`/api/faiths/${id}`, token, { method: 'PATCH', json: input })
    : await cmsRequest('/api/faiths', token, { method: 'POST', json: input });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存信仰失败 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as { doc?: { id: number }; id?: number };
  return data.doc?.id ?? data.id ?? id ?? 0;
}

export async function deleteCmsFaith(id: number, token: string): Promise<void> {
  const res = await cmsRequest(`/api/faiths/${id}`, token, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`删除信仰失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

/* ── 内容页面（元数据 + legacyHtml）─────────────────── */

export type CmsPageDoc = {
  id: number;
  title: string;
  slug: string;
  appSource?: string | null;
  wpStatus?: 'publish' | 'draft' | null;
  daozangCategory?: string | null;
  sortWeight?: number | null;
  daozangVolume?: string | null;
  excerpt?: string | null;
  legacyHtml?: string | null;
  updatedAt?: string;
};

export async function listCmsPages(
  token: string,
  opts?: { appSource?: string; limit?: number },
): Promise<CmsPageDoc[]> {
  const params = new URLSearchParams({
    sort: '-updatedAt',
    limit: String(opts?.limit ?? 100),
    depth: '0',
  });
  if (opts?.appSource) {
    params.set('where[appSource][equals]', opts.appSource);
  }
  const res = await cmsRequest(`/api/pages?${params}`, token);
  if (!res.ok) return [];
  const data = (await res.json()) as { docs?: CmsPageDoc[] };
  return data.docs ?? [];
}

export async function getCmsPage(id: number, token: string): Promise<CmsPageDoc | null> {
  const res = await cmsRequest(`/api/pages/${id}?depth=0`, token);
  if (!res.ok) return null;
  return (await res.json()) as CmsPageDoc;
}

export type PageMetaInput = {
  title: string;
  slug: string;
  appSource: string;
  wpStatus: 'publish' | 'draft';
  daozangCategory?: string | null;
  sortWeight?: number | null;
  daozangVolume?: string | null;
  excerpt?: string | null;
  legacyHtml?: string | null;
};

export async function upsertCmsPage(
  input: PageMetaInput,
  token: string,
  id?: number,
): Promise<number> {
  const res = id
    ? await cmsRequest(`/api/pages/${id}`, token, { method: 'PATCH', json: input })
    : await cmsRequest('/api/pages', token, { method: 'POST', json: input });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`保存页面失败 (${res.status}): ${err.slice(0, 300)}`);
  }
  const data = (await res.json()) as { doc?: { id: number }; id?: number };
  return data.doc?.id ?? data.id ?? id ?? 0;
}

export async function deleteCmsPage(id: number, token: string): Promise<void> {
  const res = await cmsRequest(`/api/pages/${id}`, token, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`删除页面失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}

/* ── 媒体库 ─────────────────────────────────────────── */

export type CmsMediaDoc = {
  id: number;
  alt?: string | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  updatedAt?: string;
};

export async function listCmsMedia(
  token: string,
  opts?: { limit?: number; page?: number },
): Promise<{ docs: CmsMediaDoc[]; totalDocs: number; totalPages: number; page: number }> {
  const page = opts?.page ?? 1;
  const params = new URLSearchParams({
    sort: '-updatedAt',
    limit: String(opts?.limit ?? 48),
    page: String(page),
    depth: '0',
  });
  const res = await cmsRequest(`/api/media?${params}`, token);
  if (!res.ok) {
    return { docs: [], totalDocs: 0, totalPages: 0, page };
  }
  const data = (await res.json()) as {
    docs?: CmsMediaDoc[];
    totalDocs?: number;
    totalPages?: number;
    page?: number;
  };
  return {
    docs: data.docs ?? [],
    totalDocs: data.totalDocs ?? 0,
    totalPages: data.totalPages ?? 0,
    page: data.page ?? page,
  };
}

export async function updateCmsMediaAlt(
  id: number,
  alt: string,
  token: string,
): Promise<void> {
  const res = await cmsRequest(`/api/media/${id}`, token, {
    method: 'PATCH',
    json: { alt },
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`更新媒体失败 (${res.status}): ${err.slice(0, 200)}`);
  }
}
