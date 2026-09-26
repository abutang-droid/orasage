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

export type TarotBillingHidden = {
  dailyOverage: boolean;
  threeCardReport: boolean;
  threeCardBundle: boolean;
  destinySliceUnlock: boolean;
};

export type TarotBillingConfig = {
  skus: TarotBillingSkus;
  dailyOverage: TarotBillingProduct | null;
  threeCardReport: TarotBillingProduct | null;
  threeCardBundle: TarotBillingProduct | null;
  destinySliceUnlock: TarotBillingProduct | null;
  hidden: TarotBillingHidden;
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

type SlotRow = {
  sku: string;
  product?: Record<string, unknown> | null;
  active?: boolean;
};

type SlotsResponse = {
  slots?: Record<string, SlotRow[]>;
};

const HIDDEN_NONE: TarotBillingHidden = {
  dailyOverage: false,
  threeCardReport: false,
  threeCardBundle: false,
  destinySliceUnlock: false,
};

function readSlot(data: SlotsResponse, key: string, fallbackSku: string) {
  const rows = data.slots?.[key];
  const configured = Array.isArray(rows);
  const visible = rows?.find((row) => row.active !== false && row.product) ?? null;
  return {
    sku: visible?.sku || rows?.[0]?.sku || fallbackSku,
    product: mapProduct(visible?.product),
    hidden: configured && !visible,
  };
}

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

function firstSku(data: SlotsResponse, key: string, fallback: string) {
  return data.slots?.[key]?.[0]?.sku || fallback;
}

export async function fetchTarotBillingSkus(): Promise<TarotBillingSkus> {
  try {
    const data = await fetchTarotSlots();
    return {
      dailyOverageSku: firstSku(data, 'daily.overage', FALLBACK.dailyOverageSku),
      threeCardReportSku: firstSku(data, 'threecard.report', FALLBACK.threeCardReportSku),
      threeCardBundleSku: firstSku(data, 'threecard.bundle', FALLBACK.threeCardBundleSku),
      destinySliceUnlockSku: firstSku(data, 'singlecard.unlock', FALLBACK.destinySliceUnlockSku),
    };
  } catch {
    return FALLBACK;
  }
}

export async function fetchTarotBillingConfig(locale = 'zh-CN'): Promise<TarotBillingConfig> {
  try {
    const data = await fetchTarotSlots(locale);
    const overage = readSlot(data, 'daily.overage', FALLBACK.dailyOverageSku);
    const report = readSlot(data, 'threecard.report', FALLBACK.threeCardReportSku);
    const bundle = readSlot(data, 'threecard.bundle', FALLBACK.threeCardBundleSku);
    const sliceUnlock = readSlot(data, 'singlecard.unlock', FALLBACK.destinySliceUnlockSku);
    return {
      skus: {
        dailyOverageSku: overage.sku,
        threeCardReportSku: report.sku,
        threeCardBundleSku: bundle.sku,
        destinySliceUnlockSku: sliceUnlock.sku,
      },
      dailyOverage: overage.hidden ? null : overage.product,
      threeCardReport: report.hidden ? null : report.product,
      threeCardBundle: bundle.hidden ? null : bundle.product,
      destinySliceUnlock: sliceUnlock.hidden ? null : sliceUnlock.product,
      hidden: {
        dailyOverage: overage.hidden,
        threeCardReport: report.hidden,
        threeCardBundle: bundle.hidden,
        destinySliceUnlock: sliceUnlock.hidden,
      },
    };
  } catch {
    return {
      skus: FALLBACK,
      dailyOverage: null,
      threeCardReport: null,
      threeCardBundle: null,
      destinySliceUnlock: null,
      hidden: HIDDEN_NONE,
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
