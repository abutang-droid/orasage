import type { ShopHomeLayout } from '../../../shared/shop-crystal/index';
import {
  mergeCrystalContent,
  type CrystalContentMap,
} from '../../../shared/shop-crystal/content';

export async function fetchShopHomeLayout(): Promise<ShopHomeLayout> {
  try {
    const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
    const res = await fetch(`${authInternalUrl}/api/products/shop-config`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return 'legacy';
    const data = (await res.json()) as { homeLayout?: string };
    return data.homeLayout === 'crystal_v1' ? 'crystal_v1' : 'legacy';
  } catch {
    return 'legacy';
  }
}

export async function fetchCrystalContent(
  locale = 'zh-CN',
): Promise<CrystalContentMap> {
  try {
    const authInternalUrl = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
    const res = await fetch(`${authInternalUrl}/api/products/crystal-content`, {
      next: { revalidate: 30 },
    } as RequestInit);
    if (!res.ok) return mergeCrystalContent(null, locale);
    const data = (await res.json()) as { content?: Partial<CrystalContentMap> };
    return mergeCrystalContent(data.content, locale);
  } catch {
    return mergeCrystalContent(null, locale);
  }
}
