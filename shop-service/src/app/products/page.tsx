import Link from 'next/link';
import { listActiveProducts } from '@/lib/orders';

export const dynamic = 'force-dynamic';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function ProductsPage() {
  const products = await listActiveProducts();

  return (
    <div className="container">
      <h1 className="page-title">全部商品</h1>
      {products.length === 0 ? (
        <p className="empty">暂无商品</p>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <article key={p.id} className="product-card">
              <div className="image">🔮</div>
              <div className="body">
                <h3>
                  <Link href={`/products/${p.slug}`}>{p.name}</Link>
                </h3>
                <p className="desc">{p.description}</p>
                <div className="meta">
                  <span className="price">{formatPrice(p.priceCents, p.currency)}</span>
                  <Link href={`/products/${p.slug}`}>购买</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
