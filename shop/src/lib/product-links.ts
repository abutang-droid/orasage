export type ProductLink = {
  id: number;
  kind: 'internal' | 'media' | 'review' | 'article';
  title: string;
  url: string;
  sourceName?: string | null;
};

type LinksResponse = {
  links?: Array<{
    id?: number;
    kind?: string;
    title?: string;
    url?: string;
    sourceName?: string | null;
    active?: boolean;
  }>;
};

/** R5：商品关联页面（媒体报道/用户测评），来自 auth 单商品接口 */
export async function fetchProductLinks(sku: string, locale = 'zh-CN'): Promise<ProductLink[]> {
  const { ENV } = await import('./env');
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/products/${encodeURIComponent(sku)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 60 } } as RequestInit,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as LinksResponse;
    return (data.links ?? [])
      .filter((l) => l.title && l.url && l.active !== false)
      .map((l) => ({
        id: l.id ?? 0,
        kind: (l.kind as ProductLink['kind']) ?? 'media',
        title: l.title!,
        url: l.url!,
        sourceName: l.sourceName ?? null,
      }));
  } catch {
    return [];
  }
}
