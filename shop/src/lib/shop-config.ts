import type { ShopHomeLayout } from '../../../shared/shop-crystal/index';

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
