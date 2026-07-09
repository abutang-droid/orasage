import { resolveCmsMediaUrl } from '@/lib/cms-media';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

export type ProductTestimonial = {
  id: string;
  author: string;
  rating: number;
  body: string;
  avatarUrl?: string;
};

type CmsTestimonialDoc = {
  id?: string | number;
  author?: string;
  rating?: number;
  body?: string;
  avatar?: { url?: string | null } | number | null;
};

async function fetchTestimonialsForLocale(
  sku: string,
  locale: string,
): Promise<ProductTestimonial[]> {
  try {
    const params = new URLSearchParams({
      'where[sku][equals]': sku,
      'where[locale][equals]': locale,
      'where[enabled][equals]': 'true',
      sort: 'sort',
      limit: '20',
      depth: '1',
    });
    const res = await fetch(`${CMS_INTERNAL_URL}/api/shop-product-testimonials?${params}`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return [];
    const data = (await res.json()) as { docs?: CmsTestimonialDoc[] };
    return (data.docs ?? [])
      .filter((doc) => doc.author && doc.body)
      .map((doc) => ({
        id: String(doc.id ?? doc.author),
        author: doc.author!,
        rating: Math.min(5, Math.max(1, Math.round(doc.rating ?? 5))),
        body: doc.body!,
        avatarUrl: resolveCmsMediaUrl(doc.avatar) ?? undefined,
      }));
  } catch {
    return [];
  }
}

/** 精选评价；当前语言无内容时回退 zh-CN */
export async function fetchProductTestimonials(
  sku: string,
  locale = 'zh-CN',
): Promise<ProductTestimonial[]> {
  const items = await fetchTestimonialsForLocale(sku, locale);
  if (items.length > 0) return items;
  if (locale !== 'zh-CN') {
    return fetchTestimonialsForLocale(sku, 'zh-CN');
  }
  return [];
}

export function averageTestimonialRating(items: ProductTestimonial[]): number | null {
  if (!items.length) return null;
  const sum = items.reduce((acc, item) => acc + item.rating, 0);
  return Math.round((sum / items.length) * 10) / 10;
}
