const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export type TarotBillingSkus = {
  dailyOverageSku: string;
  threeCardReportSku: string;
  threeCardBundleSku: string;
  destinySliceUnlockSku: string;
};

const FALLBACK: TarotBillingSkus = {
  dailyOverageSku: 'tarot-daily-draw',
  threeCardReportSku: 'report-tarot',
  threeCardBundleSku: 'report-tarot-bundle',
  destinySliceUnlockSku: 'tarot-destiny-slice',
};

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
  destinySliceUnlock: TarotBillingProduct | null;
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

type SlotsResponse = {
  slots?: Record<string, Array<{ sku: string; product?: Record<string, unknown> | null }>>;
};

let cachedSlots: { at: number; locale: string; value: SlotsResponse } | null = null;
const CACHE_MS = 60_000;

/** 计费槽位统一入口：GET /api/billing/slots?app=tarot */
async function fetchTarotSlots(locale = 'zh-CN'): Promise<SlotsResponse> {
  if (cachedSlots && cachedSlots.locale === locale && Date.now() - cachedSlots.at < CACHE_MS) {
    return cachedSlots.value;
  }
  const res = await fetch(
    `${AUTH_INTERNAL}/api/billing/slots?app=tarot&locale=${encodeURIComponent(locale)}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`billing slots ${res.status}`);
  const data = (await res.json()) as SlotsResponse;
  cachedSlots = { at: Date.now(), locale, value: data };
  return data;
}

function firstEntry(data: SlotsResponse, key: string) {
  return data.slots?.[key]?.[0] ?? null;
}

export async function fetchTarotBillingSkus(): Promise<TarotBillingSkus> {
  try {
    const data = await fetchTarotSlots();
    return {
      dailyOverageSku: firstEntry(data, 'daily.overage')?.sku ?? FALLBACK.dailyOverageSku,
      threeCardReportSku: firstEntry(data, 'threecard.report')?.sku ?? FALLBACK.threeCardReportSku,
      threeCardBundleSku: firstEntry(data, 'threecard.bundle')?.sku ?? FALLBACK.threeCardBundleSku,
      destinySliceUnlockSku: firstEntry(data, 'singlecard.unlock')?.sku ?? FALLBACK.destinySliceUnlockSku,
    };
  } catch {
    return FALLBACK;
  }
}

export async function fetchTarotBillingConfig(locale = 'zh-CN'): Promise<TarotBillingConfig> {
  try {
    const data = await fetchTarotSlots(locale);
    const overage = firstEntry(data, 'daily.overage');
    const report = firstEntry(data, 'threecard.report');
    const bundle = firstEntry(data, 'threecard.bundle');
    const sliceUnlock = firstEntry(data, 'singlecard.unlock');
    return {
      skus: {
        dailyOverageSku: overage?.sku ?? FALLBACK.dailyOverageSku,
        threeCardReportSku: report?.sku ?? FALLBACK.threeCardReportSku,
        threeCardBundleSku: bundle?.sku ?? FALLBACK.threeCardBundleSku,
        destinySliceUnlockSku: sliceUnlock?.sku ?? FALLBACK.destinySliceUnlockSku,
      },
      dailyOverage: mapProduct(overage?.product),
      threeCardReport: mapProduct(report?.product),
      threeCardBundle: mapProduct(bundle?.product),
      destinySliceUnlock: mapProduct(sliceUnlock?.product),
    };
  } catch {
    return {
      skus: FALLBACK,
      dailyOverage: null,
      threeCardReport: null,
      threeCardBundle: null,
      destinySliceUnlock: null,
    };
  }
}

export async function fetchTarotDailyRecommendProduct(seed: string, locale = 'zh-CN') {
  try {
    const res = await fetch(
      `${AUTH_INTERNAL}/api/billing/slot?app=tarot&key=recommend.daily&seed=${encodeURIComponent(seed)}&locale=${encodeURIComponent(locale)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    const data = await res.json() as { product?: Record<string, unknown> };
    return mapProduct(data.product);
  } catch {
    return null;
  }
}
