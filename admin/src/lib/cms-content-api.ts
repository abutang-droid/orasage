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
  const form = new FormData();
  form.append('file', file);
  form.append('alt', alt || file.name);
  const res = await cmsRequest('/api/media', token, { method: 'POST', body: form });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`媒体上传失败 (${res.status}): ${err.slice(0, 200)}`);
  }
  const data = (await res.json()) as { doc?: { id: number }; id?: number };
  const id = data.doc?.id ?? data.id;
  if (!id) throw new Error('媒体上传成功但未返回 ID');
  return id;
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
