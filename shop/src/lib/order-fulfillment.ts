import { getProduct } from '@/lib/products';
import { parseCartOrderContext } from '../../../shared/shop-cart/cart-order';
import { inferRequiresShipping, inferRequiresWristSize } from '../../../shared/shop-fulfillment/index';
import type { AuthOrder } from '@/lib/orders';

export type OrderFulfillment = {
  requiresShipping: boolean;
  requiresWristSize: boolean;
};

export async function resolveOrderFulfillment(order: AuthOrder): Promise<OrderFulfillment> {
  const cart = parseCartOrderContext(order.recommendationContext);
  if (cart) {
    const products = await Promise.all(cart.items.map((line) => getProduct(line.sku)));
    return {
      requiresShipping: products.some(
        (product) => product && (product.requiresShipping ?? inferRequiresShipping(product)),
      ),
      requiresWristSize: products.some(
        (product) => product && (product.requiresWristSize ?? inferRequiresWristSize(product)),
      ),
    };
  }

  if (order.sku) {
    const product = await getProduct(order.sku);
    if (product) {
      return {
        requiresShipping: product.requiresShipping ?? inferRequiresShipping(product),
        requiresWristSize: product.requiresWristSize ?? inferRequiresWristSize(product),
      };
    }
  }

  return { requiresShipping: false, requiresWristSize: false };
}

export async function orderNeedsShippingBeforePay(order: AuthOrder): Promise<boolean> {
  const fulfillment = await resolveOrderFulfillment(order);
  return fulfillment.requiresShipping;
}
