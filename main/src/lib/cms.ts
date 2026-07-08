const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

export type PublishSection =
  | 'daozang'
  | 'famous'
  | 'main'
  | 'bazi'
  | 'ziwei'
  | 'tarot'
  | 'shop';

export type CmsPage = {
  id: number;
  title: string;
  slug: string;
  appSource?: PublishSection | null;
  legacyHtml?: string | null;
  wpStatus?: 'publish' | 'draft' | null;
  wpType?: 'doc' | 'post' | 'page' | null;
  locale?: string | null;
  sourceUrl?: string | null;
  daozangCategory?: string | null;
  sortWeight?: number | null;
  excerpt?: string | null;
  updatedAt?: string;
};

/** 道藏轻量索引条目（不含 legacyHtml 正文，用于目录/搜索/上下篇） */
export type DaozangIndexItem = Pick<
  CmsPage,
  'id' | 'title' | 'slug' | 'daozangCategory' | 'sortWeight' | 'excerpt'
>;

type CmsListResponse = {
  docs: CmsPage[];
  totalDocs: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

const localeMap: Record<string, string> = {
  'zh-CN': 'zh-CN',
  'zh-TW': 'zh-TW',
  en: 'en',
  'pt-BR': 'pt',
  es: 'es',
  fr: 'fr',
  de: 'de',
  ja: 'ja',
  ko: 'ko',
  th: 'th',
  vi: 'vi',
  ar: 'ar',
};

export function cmsLocale(siteLocale: string): string {
  return localeMap[siteLocale] || siteLocale;
}

export function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(Number(num)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function stripHtml(html: string, max = 140): string {
  const plain = decodeHtmlEntities(
    sanitizeLegacyHtml(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  )
    .replace(/目录\s*/g, '')
    .replace(/手机阅读\s*/g, '')
    .replace(/扫码下载\/打开问真八字\s*/g, '')
    .replace(/在手机上继续阅读本书\s*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > max ? `${plain.slice(0, max)}…` : plain;
}

const JUNK_SLUG_RE =
  /^(cart|checkout|confirmation|order-history|wiki|shop|store|my-account|sample-page|hello-world)(\/|$)/i;
const JUNK_TITLE_RE =
  /^(cart|checkout|confirmation|order history|wiki|shop|store|my account|sample page|hello world)$/i;

/** 过滤 WordPress 迁移时混入的非正文页面 */
export function isJunkCmsPage(page: Pick<CmsPage, 'title' | 'slug'>): boolean {
  const title = decodeHtmlEntities(page.title).trim();
  const slug = page.slug.replace(/^\/+/, '').toLowerCase();
  if (JUNK_SLUG_RE.test(slug)) return true;
  if (JUNK_TITLE_RE.test(title)) return true;
  if (/^zh-cn\/(cart|checkout|order-history|wiki)/i.test(slug)) return true;
  return false;
}

/** 清洗 WordPress 迁移正文：去二维码/外链推广/脚本，修复常见乱码 */
export function sanitizeLegacyHtml(html: string): string {
  let out = html;

  // 移除脚本、嵌入、二维码图片、常见推广块
  out = out
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<object[\s\S]*?<\/object>/gi, '')
    .replace(/<embed[\s\S]*?>/gi, '')
    .replace(/<img[^>]*(qr|qrcode|weixin|wechat|wx\.|mp\.weixin|公众号|扫码)[^>]*>/gi, '')
    .replace(/<img[^>]*(wp-content\/uploads\/[^"']*qr[^"']*|barcode)[^>]*>/gi, '')
    .replace(/<a[^>]*(weixin|wechat|mp\.weixin|javascript:)[^>]*>[\s\S]*?<\/a>/gi, '')
    .replace(/<div[^>]*(qr|qrcode|wechat|weixin|related|share|social|promo|广告)[^>]*>[\s\S]*?<\/div>/gi, '')
    .replace(/<p[^>]*(qr|qrcode|wechat|weixin|扫码|关注公众号)[^>]*>[\s\S]*?<\/p>/gi, '')
  // 问真八字等第三方 App 推广行
    .replace(/<p[^>]*>[\s\S]*?(手机阅读|扫码下载|问真八字|在手机上继续阅读)[\s\S]*?<\/p>/gi, '')
    .replace(/目录\s*手机阅读[\s\S]*?在手机上继续阅读本书/gi, '');

  // 移除孤立小尺寸图片（常见二维码 80–400px）
  out = out.replace(/<img[^>]*width=["']?\d{2,3}["']?[^>]*height=["']?\d{2,3}["']?[^>]*>/gi, (tag) => {
    if (/qr|qrcode|weixin|wechat|扫码/i.test(tag)) return '';
    return tag;
  });

  // WordPress 正文用 <p><font class='gold'>…</font></p> 标记章节标题，短文本转为语义化 h3（排版 + 文内目录）
  out = out.replace(
    /<p[^>]*>\s*<font[^>]*class=["']gold["'][^>]*>([\s\S]*?)<\/font>\s*<\/p>/gi,
    (match, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      // 过长或含句读的 gold 段落是强调正文而非章节标题
      if (!text || text.length > 32 || /[。；：!？]/.test(text)) return match;
      return `<h3>${inner}</h3>`;
    },
  );

  // 常见 UTF-8 被误读为 Latin-1 的乱码（如 Ã©、â€œ）
  if (/Ã.|Â.|â./.test(out)) {
    try {
      const bytes = Uint8Array.from([...out].map((c) => c.charCodeAt(0) & 0xff));
      const fixed = new TextDecoder('utf-8').decode(bytes);
      if (fixed && !fixed.includes('\uFFFD')) out = fixed;
    } catch {
      // keep original
    }
  }

  return out.replace(/\n{3,}/g, '\n\n').trim();
}

function buildWhere(section: PublishSection, locale?: string): URLSearchParams {
  const params = new URLSearchParams();
  params.set('where[and][0][appSource][equals]', section);
  params.set('where[and][1][wpStatus][equals]', 'publish');
  if (locale) {
    params.set('where[and][2][locale][equals]', locale);
  }
  return params;
}

export async function fetchCmsPages(options: {
  section: PublishSection;
  locale?: string;
  page?: number;
  limit?: number;
}): Promise<CmsListResponse> {
  const params = buildWhere(options.section, options.locale);
  params.set('limit', String(options.limit ?? 30));
  params.set('page', String(options.page ?? 1));
  params.set('depth', '0');
  params.set('sort', 'title');

  const res = await fetch(`${CMS_INTERNAL_URL}/api/pages?${params}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status}`);
  }
  const data: CmsListResponse = await res.json();
  return { ...data, docs: data.docs.filter((page) => !isJunkCmsPage(page)) };
}

/**
 * 拉取道藏全量轻量索引（不含正文，132 篇量级）。
 * 分类总览、分类列表、搜索与详情页上下篇共用此索引，
 * 归类过滤在应用层完成，兼容 CMS 尚未回填 daozangCategory 的数据。
 */
export async function fetchDaozangIndex(locale?: string): Promise<DaozangIndexItem[]> {
  const items: DaozangIndexItem[] = [];
  let page = 1;
  while (page <= 20) {
    const params = buildWhere('daozang', locale);
    params.set('limit', '200');
    params.set('page', String(page));
    params.set('depth', '0');
    params.set('sort', 'title');
    for (const field of ['title', 'slug', 'wpType', 'daozangCategory', 'sortWeight', 'excerpt']) {
      params.set(`select[${field}]`, 'true');
    }

    const res = await fetch(`${CMS_INTERNAL_URL}/api/pages?${params}`, {
      next: { revalidate: 120 },
    });
    if (!res.ok) {
      throw new Error(`CMS fetch failed: ${res.status}`);
    }
    const data: CmsListResponse = await res.json();
    items.push(
      // WordPress 静态页（cart/团队成员等）误挂在道藏栏目，不属于知识库目录
      ...data.docs.filter((item) => item.wpType !== 'page' && !isJunkCmsPage(item)),
    );
    if (!data.hasNextPage) break;
    page += 1;
  }
  return items;
}

export async function fetchCmsPageBySlug(slug: string): Promise<CmsPage | null> {
  const params = new URLSearchParams();
  params.set('where[and][0][slug][equals]', slug);
  params.set('where[and][1][wpStatus][equals]', 'publish');
  params.set('limit', '1');
  params.set('depth', '0');

  const res = await fetch(`${CMS_INTERNAL_URL}/api/pages?${params}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) return null;
  const data: CmsListResponse = await res.json();
  return data.docs[0] ?? null;
}

/** 名人案例语言回退链：繁体界面回退 zh-HK，再回退 zh-CN；其余语言回退 zh-CN */
export function famousLocaleChain(cmsLoc: string): string[] {
  if (cmsLoc === 'zh-CN') return ['zh-CN'];
  if (cmsLoc === 'zh-TW') return ['zh-HK', 'zh-CN'];
  return [cmsLoc, 'zh-CN'];
}

export type FamousDoc = CmsPage & {
  /** true = 来自回退语言（非当前界面语言）的内容 */
  fallback: boolean;
};

/**
 * 拉取名人案例全量列表（带语言回退链）。
 * 分类过滤 / 去重 / 分页在 main 侧完成，故一次取全量（当前共 110 篇，revalidate 缓存 120s）。
 */
export async function fetchFamousPages(cmsLoc: string): Promise<FamousDoc[]> {
  const chain = famousLocaleChain(cmsLoc);
  const results = await Promise.all(
    chain.map((locale) => fetchCmsPages({ section: 'famous', locale, limit: 200 })),
  );
  return results.flatMap((res, i) => res.docs.map((doc) => ({ ...doc, fallback: i > 0 })));
}

export function daozangArticlePath(slug: string): string {
  return `/daozang/${slug}`;
}

export function famousArticlePath(slug: string): string {
  return `/famous/${slug}`;
}
