import { notFound } from 'next/navigation';
import { getProductBySlug } from '@/lib/orders';
import { CheckoutButton } from './checkout-button';

export const dynamic = 'force-dynamic';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <h1 className="page-title">{product.name}</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'start',
        }}
      >
        <div
          className="product-card"
          style={{
            height: 280,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
          }}
        >
          ✨
        </div>
        <div>
          <p style={{ color: 'var(--muted)', marginBottom: '1.5rem' }}>{product.description}</p>
          <p className="price" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
            {formatPrice(product.priceCents, product.currency)}
          </p>
          <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--muted)' }}>
            类型：{product.type} · 来源：{product.appSource}
          </p>
          <CheckoutButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}
