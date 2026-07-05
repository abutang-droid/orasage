const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export type TarotBillingSkus = {
  dailyOverageSku: string;
  threeCardReportSku: string;
  threeCardBundleSku: string;
};

const FALLBACK: TarotBillingSkus = {
  dailyOverageSku: 'tarot-daily-draw',
  threeCardReportSku: 'report-tarot',
  threeCardBundleSku: 'report-tarot-bundle',
};

let cachedSkus: { at: number; value: TarotBillingSkus } | null = null;
const CACHE_MS = 60_000;

export async function fetchTarotBillingSkus(): Promise<TarotBillingSkus> {
  if (cachedSkus && Date.now() - cachedSkus.at < CACHE_MS) {
    return cachedSkus.value;
  }
  try {
    const res = await fetch(`${AUTH_INTERNAL}/api/tarot/billing/skus`, { cache: 'no-store' });
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as { skus?: TarotBillingSkus };
    const skus = data.skus ?? FALLBACK;
    cachedSkus = { at: Date.now(), value: skus };
    return skus;
  } catch {
    return FALLBACK;
  }
}

export type TarotBillingProduct = {
  sku: string;
  name: string;
  desc: string;
  priceDisplay: string;
  requiresShipping?: boolean;
};

export type TarotBillingConfig = {
  skus: TarotBillingSkus;
  dailyOverage: TarotBillingProduct | null;
  threeCardReport: TarotBillingProduct | null;
  threeCardBundle: TarotBillingProduct | null;
};

function mapProduct(p: Record<string, unknown> | null | undefined): TarotBillingProduct | null {
  if (!p || typeof p.sku !== 'string') return null;
  return {
    sku: p.sku,
    name: typeof p.name === 'string' ? p.name : '',
    desc: typeof p.desc === 'string' ? p.desc : typeof p.description === 'string' ? p.description : '',
    priceDisplay: typeof p.priceDisplay === 'string' ? p.priceDisplay : '',
    requiresShipping: Boolean(p.requiresShipping),
  };
}

export async function fetchTarotBillingConfig(locale = 'zh-CN'): Promise<TarotBillingConfig> {
  try {
    const res = await fetch(
      `${AUTH_INTERNAL}/api/tarot/billing/config?locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) {
      const skus = await fetchTarotBillingSkus();
      return { skus, dailyOverage: null, threeCardReport: null, threeCardBundle: null };
    }
    const data = await res.json() as Record<string, unknown>;
    const skus = (data.skus as TarotBillingSkus) ?? await fetchTarotBillingSkus();
    return {
      skus,
      dailyOverage: mapProduct(data.dailyOverage as Record<string, unknown>),
      threeCardReport: mapProduct(data.threeCardReport as Record<string, unknown>),
      threeCardBundle: mapProduct(data.threeCardBundle as Record<string, unknown>),
    };
  } catch {
    const skus = await fetchTarotBillingSkus();
    return { skus, dailyOverage: null, threeCardReport: null, threeCardBundle: null };
  }
}

export async function fetchTarotDailyRecommendProduct(seed: string, locale = 'zh-CN') {
  try {
    const res = await fetch(
      `${AUTH_INTERNAL}/api/tarot/billing/daily-recommend?seed=${encodeURIComponent(seed)}&locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json() as { product?: Record<string, unknown> };
    return mapProduct(data.product);
  } catch {
    return null;
  }
}
