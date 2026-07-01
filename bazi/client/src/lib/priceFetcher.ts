/**
 * PriceFetcher — WooCommerce 商品定价缓存
 *
 * 从 WordPress REST API 获取产品定价，避免前端硬编码。
 * 数据缓存 1 小时，fallback 到默认美元定价。
 */

import type { PlanType } from "@shared/types";

// ─── 默认定价（美元，fallback）───
const DEFAULT_PRICES: Record<string, { single: number; couple: number }> = {
  basic:    { single: 9.99,  couple: 9.99 },
  advanced: { single: 99,    couple: 198 },
  premium:  { single: 299,   couple: 598 },
};

/**
 * 后端 fetch 到的 WooCommerce 商品价格记录（内部缓存）
 * 由服务端的 getPlans 接口返回或专门的 /api/price 端点提供
 */
interface ProductPriceCache {
  /** 格式: { "342": 9.99, "486": 99, ... } */
  products: Record<number, number>;
  fetchedAt: number;
}

/**
 * WooCommerce 商品 ID → 方案类型映射
 * (与 PlanSelectionModal / usePaymentFlow 的 PRODUCT_ID_MAP 保持一致)
 */
const PRODUCT_ID_MAP: Record<string, { single: number; couple: number }> = {
  basic:    { single: 342, couple: 342 },
  advanced: { single: 486, couple: 2226 },
  premium:  { single: 488, couple: 3591 },
};

// ─── 模块级缓存 ───
let _cache: ProductPriceCache | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 小时
let _fetchPromise: Promise<ProductPriceCache> | null = null;

/** 构建 WordPress REST API 获取产品价格的完整 URL */
function getPriceApiUrl(): string {
  const baseUrl = import.meta.env.VITE_WP_URL || "https://www.c2.pub";
  const productIds = [342, 486, 488, 2226, 3591];
  const idsParam = productIds.join(",");
  return `${baseUrl}/wp-json/wc/v3/products?include=${idsParam}&per_page=10`;
}

/** 从 WordPress REST API 获取产品定价 */
async function fetchPrices(): Promise<ProductPriceCache> {
  // 避免并发重复请求
  if (_fetchPromise) return _fetchPromise;

  _fetchPromise = (async () => {
    try {
      const url = getPriceApiUrl();
      const res = await fetch(url, {
        headers: {
          "Accept": "application/json",
          // 如果没有认证凭据，用公开的 consumer key（只读）
          // 生产环境应该通过服务端代理
        },
      });

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

      console.log("[PriceFetcher] Fetched prices from WP:", productsMap);
      return { products: productsMap, fetchedAt: Date.now() };
    } catch (e) {
      console.warn("[PriceFetcher] Failed to fetch prices, using defaults:", e);
      // Fallback: 返回空 product map（将从默认定价取值）
      return { products: {}, fetchedAt: 0 };
    } finally {
      _fetchPromise = null;
    }
  })();

  return _fetchPromise;
}

/** 异步初始化缓存 */
async function ensureCache(): Promise<ProductPriceCache> {
  if (_cache && Date.now() - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache;
  }
  _cache = await fetchPrices();
  return _cache;
}

/** 清除缓存（用于测试或强制刷新） */
export function clearPriceCache(): void {
  _cache = null;
  _fetchPromise = null;
}

/** 获取指定方案的美元价格（带 $ 前缀） */
async function getPriceLabel(
  planType: PlanType,
  mode: "single" | "couple" = "single",
): Promise<string> {
  const cache = await ensureCache();
  const productId = PRODUCT_ID_MAP[planType]?.[mode] ?? 342;

  if (cache.products[productId]) {
    return `$${cache.products[productId].toFixed(2)}`;
  }

  // Fallback 默认定价
  const fallback = DEFAULT_PRICES[planType]?.[mode] ?? 9.99;
  return `$${fallback.toFixed(2)}`;
}

/**
 * React Hook：获取方案定价
 * 用法: const { prices, loading } = usePriceFetcher();
 */
import { useState, useEffect } from "react";

export function usePriceFetcher(): { prices: Record<string, { single: string; couple: string }> | null; loading: boolean } {
  const [result, setResult] = useState<{
    prices: Record<string, { single: string; couple: string }> | null;
    loading: boolean;
  }>({ prices: null, loading: true });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const cache = await ensureCache();
        if (cancelled) return;

        // 构建前端用的价格映射
        const prices: Record<string, { single: string; couple: string }> = {};
        for (const planType of ["basic", "advanced", "premium"] as PlanType[]) {
          const singleId = PRODUCT_ID_MAP[planType]?.single ?? 342;
          const coupleId = PRODUCT_ID_MAP[planType]?.couple ?? 342;
          const singlePrice = cache.products[singleId] ?? DEFAULT_PRICES[planType]?.single ?? 9.99;
          const couplePrice = cache.products[coupleId] ?? DEFAULT_PRICES[planType]?.couple ?? 9.99;
          prices[planType] = {
            single: `$${singlePrice.toFixed(2)}`,
            couple: `$${couplePrice.toFixed(2)}`,
          };
        }
        setResult({ prices, loading: false });
      } catch {
        if (!cancelled) setResult({ prices: null, loading: false });
      }
    })();

    return () => { cancelled = true; };
  }, []);

  return result;
}
