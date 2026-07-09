import { ENV } from './env';

export type UgcReview = {
  id: number;
  rating: number;
  body: string;
  author: string;
  featured?: boolean;
  createdAt: string;
};

export async function fetchUgcReviews(sku: string): Promise<UgcReview[]> {
  try {
    const res = await fetch(
      `${ENV.authInternalUrl}/api/reviews/products/${encodeURIComponent(sku)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const data = await res.json() as { reviews?: UgcReview[] };
    return data.reviews ?? [];
  } catch {
    return [];
  }
}
