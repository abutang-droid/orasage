/**
 * 服务端 WooCommerce 定价缓存
 *
 * 从 WooCommerce REST API 获取产品定价，带 1 小时缓存。
 * 用于 buyPlan 记录真实购买金额到数据库。
 */

import { ENV } from "./_core/env";

// ─── 默认定价（美元，API 不可用时 fallback）───
export const DEFAULT_PRICE_MAP: Record<string, string> = {
  basic: "9.9",
  advanced: "99",
  premium: "299",
};

interface ProductPriceCache {
  products: Record<number, number>;
  fetchedAt: number;
}

let _cache: ProductPriceCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小时
let _fetchPromise: Promise<ProductPriceCache> | null = null;

function getPriceApiUrl(): string {
  const baseUrl = ENV.wordpressUrl || "https://www.c2.pub";
  const productIds = [342, 486, 488, 2226, 3591];
  const idsParam = productIds.join(",");
  return `${baseUrl}/wp-json/wc/v3/products?include=${idsParam}&per_page=10`;
}

async function fetchPricesFromWP(): Promise<ProductPriceCache> {
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const ck = ENV.wpWooKey;
      const cs = ENV.wpWooSecret;
      // 未配置 Woo 凭据时（平台定价已迁 auth-service），跳过外呼，直接用默认价，
      // 避免每次购买都打一次注定 401 的外部请求并刷警告日志
      if (!ck || !cs) {
        return { products: {}, fetchedAt: Date.now() };
      }
      const url = getPriceApiUrl();
      const headers: Record<string, string> = { Accept: "application/json" };
      const auth = Buffer.from(ck + ":" + cs).toString("base64");
      headers["Authorization"] = "Basic " + auth;

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const products: any[] = await res.json();
      const productsMap: Record<number, number> = {};

      for (const p of products) {
        const id = p.id as number;
        const price = parseFloat(p.price || "0");
        if (id > 0 && price > 0) {
          productsMap[id] = price;
        }
      }

      console.log("[ServerPriceFetcher] Fetched:", productsMap);
      return { products: productsMap, fetchedAt: Date.now() };
    } catch (e) {
      console.warn("[ServerPriceFetcher] Fetch failed, using defaults:", e);
      return { products: {}, fetchedAt: 0 };
    } finally {
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}

async function ensureCache(): Promise<ProductPriceCache> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache;
  }
  _cache = await fetchPricesFromWP();
  return _cache;
}

/** 清除缓存（测试用） */
export function clearServerPriceCache(): void {
  _cache = null;
  _fetchPromise = null;
}

/** 根据 WooCommerce 产品 ID 获取价格字符串 */
async function getPriceByProductId(productId: number): Promise<number | null> {
  const cache = await ensureCache();
  if (cache.products[productId]) {
    return cache.products[productId];
  }
  return null;
}

/**
 * 获取计费方案的实际价格映射
 * 优先从 WooCommerce API 获取，失败时 fallback 到默认定价
 */
export async function getPriceMap(): Promise<Record<string, string>> {
  const planProductMap: Record<string, number> = {
    basic: 342,
    advanced: 486,
    premium: 488,
  };

  try {
    const cache = await ensureCache();
    const result: Record<string, string> = {};

    for (const [plan, pid] of Object.entries(planProductMap)) {
      const price = cache.products[pid];
      if (price !== undefined && price > 0) {
        result[plan] = price.toFixed(1);
      } else {
        result[plan] = DEFAULT_PRICE_MAP[plan] ?? "9.9";
      }
    }
    return result;
  } catch {
    return { ...DEFAULT_PRICE_MAP };
  }
}
