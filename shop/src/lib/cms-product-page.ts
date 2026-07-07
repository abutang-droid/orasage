import { resolveCmsMediaUrl } from '@/lib/cms-media';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

export type ProductPageSectionType =
  | 'richText'
  | 'specList'
  | 'guide'
  | 'quote'
  | 'faq'
  | 'relatedSkus';

export type ProductPageHeroImage = {
  url: string;
  alt: string;
};

export type ProductPageSection = {
  type: ProductPageSectionType;
  title?: string;
  body?: string;
  quote?: string;
  attribution?: string;
  specItems?: Array<{ label: string; value: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  relatedSkus?: string[];
};

export type CmsProductPage = {
  sku: string;
  locale: string;
  status: 'draft' | 'published';
  subtitle?: string;
  seoTitle?: string;
  seoDescription?: string;
  galleryVideoUrl?: string;
  sceneVideoUrl?: string;
  heroImages: ProductPageHeroImage[];
  sections: ProductPageSection[];
};

type CmsHeroRow = {
  image?: { url?: string | null; alt?: string | null } | number | null;
  alt?: string | null;
  sort?: number | null;
};

type CmsSectionRow = {
  type?: ProductPageSectionType;
  title?: string | null;
  body?: string | null;
  quote?: string | null;
  attribution?: string | null;
  specItems?: Array<{ label?: string; value?: string }> | null;
  faqItems?: Array<{ question?: string; answer?: string }> | null;
  relatedSkus?: Array<{ sku?: string }> | null;
};

type CmsPageDoc = {
  sku?: string;
  locale?: string;
  status?: 'draft' | 'published';
  subtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
  heroImages?: CmsHeroRow[] | null;
  sections?: CmsSectionRow[] | null;
};

function mapHeroImages(rows: CmsHeroRow[] | null | undefined): ProductPageHeroImage[] {
  if (!rows?.length) return [];
  return [...rows]
    .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))
    .map((row) => {
      const url = resolveCmsMediaUrl(row.image);
      if (!url) return null;
      return {
        url,
        alt: row.alt?.trim() || '',
      };
    })
    .filter((row): row is ProductPageHeroImage => Boolean(row?.url));
}

function mapSections(rows: CmsSectionRow[] | null | undefined): ProductPageSection[] {
  if (!rows?.length) return [];
  return rows
    .filter((row) => row.type)
    .map((row) => ({
      type: row.type as ProductPageSectionType,
      title: row.title ?? undefined,
      body: row.body ?? undefined,
      quote: row.quote ?? undefined,
      attribution: row.attribution ?? undefined,
      specItems: row.specItems
        ?.filter((item) => item.label && item.value)
        .map((item) => ({ label: item.label!, value: item.value! })),
      faqItems: row.faqItems
        ?.filter((item) => item.question && item.answer)
        .map((item) => ({ question: item.question!, answer: item.answer! })),
      relatedSkus: row.relatedSkus?.map((item) => item.sku).filter((sku): sku is string => Boolean(sku)),
    }));
}

function mapDoc(doc: CmsPageDoc): CmsProductPage | null {
  if (!doc.sku) return null;
  return {
    sku: doc.sku,
    locale: doc.locale ?? 'zh-CN',
    status: doc.status ?? 'draft',
    subtitle: doc.subtitle ?? undefined,
    seoTitle: doc.seoTitle ?? undefined,
    seoDescription: doc.seoDescription ?? undefined,
    galleryVideoUrl: doc.galleryVideoUrl?.trim() || undefined,
    sceneVideoUrl: doc.sceneVideoUrl?.trim() || undefined,
    heroImages: mapHeroImages(doc.heroImages),
    sections: mapSections(doc.sections),
  };
}

/** 拉取已发布的商品详情页（首期仅 zh-CN） */
export async function fetchCmsProductPage(
  sku: string,
  locale = 'zh-CN',
): Promise<CmsProductPage | null> {
  try {
    const params = new URLSearchParams({
      'where[sku][equals]': sku,
      'where[locale][equals]': locale,
      'where[status][equals]': 'published',
      limit: '1',
      depth: '2',
    });
    const res = await fetch(`${CMS_INTERNAL_URL}/api/shop-product-pages?${params}`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return null;
    const data = (await res.json()) as { docs?: CmsPageDoc[] };
    const doc = data.docs?.[0];
    if (!doc) return null;
    return mapDoc(doc);
  } catch {
    return null;
  }
}
