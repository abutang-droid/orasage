import { listActiveProducts, getProductBySlug } from '@/lib/orders';
import { jsonOk, jsonError, handleRouteError } from '@/lib/api';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');

    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) return jsonError('product not found', 404);
      return jsonOk({ product });
    }

    const items = await listActiveProducts();
    return jsonOk({ products: items });
  } catch (e) {
    return handleRouteError(e);
  }
}
