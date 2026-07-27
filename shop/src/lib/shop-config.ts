import type { ShopHomeLayout } from '../../../shared/shop-crystal/index';
import {
  mergeCrystalContent,
  type CrystalContentMap,
} from '../../../shared/shop-crystal/content';
import { setRuntimeWoldPerUsdt, woldPerUsdt } from '../../../shared/shop-locale/index';

export type ShopPublicConfig = {
  homeLayout: ShopHomeLayout;
  woldPerUsdt: number;
};

export async function fetchShopPublicConfig(): Promise<ShopPublicConfig> {
  try {
    const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
    const res = await fetch(`${authInternalUrl}/api/products/shop-config`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) {
      return { homeLayout: 'legacy', woldPerUsdt: woldPerUsdt() };
    }
    const data = (await res.json()) as { homeLayout?: string; woldPerUsdt?: number };
    const rate = typeof data.woldPerUsdt === 'number' && data.woldPerUsdt > 0
      ? data.woldPerUsdt
      : woldPerUsdt();
    setRuntimeWoldPerUsdt(rate);
    return {
      homeLayout: data.homeLayout === 'crystal_v1' ? 'crystal_v1' : 'legacy',
      woldPerUsdt: rate,
    };
  } catch {
    return { homeLayout: 'legacy', woldPerUsdt: woldPerUsdt() };
  }
}

export async function fetchShopHomeLayout(): Promise<ShopHomeLayout> {
  const config = await fetchShopPublicConfig();
  return config.homeLayout;
}

export async function fetchCrystalContent(): Promise<CrystalContentMap> {
  try {
    const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
    const res = await fetch(`${authInternalUrl}/api/products/crystal-content`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return mergeCrystalContent(null);
    const data = (await res.json()) as { content?: Partial<CrystalContentMap> };
    return mergeCrystalContent(data.content);
  } catch {
    return mergeCrystalContent(null);
  }
}
