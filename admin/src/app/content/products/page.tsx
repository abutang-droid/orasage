import Link from 'next/link';
import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import { CMS_BRIDGE } from '@/lib/content-bridge';
import { redirect } from 'next/navigation';

export default async function ContentProductsIndexPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());
  if (
    !staffCan(admin, 'content.product')
    && !staffCan(admin, 'shop.catalog')
    && admin.role !== 'admin'
  ) {
    redirect('/');
  }

  let products: Awaited<ReturnType<typeof getProducts>>['products'] = [];
  try {
    ({ products } = await getProducts());
  } catch (err) {
    console.error('[admin/content/products]', err);
  }

  const list = products.filter((p) => p.visibility === 'public' || p.active).slice(0, 80);

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>商品内容</h1>
        <p className="muted">
          PDP 长文 / 图集 / 精选评价（content.product）。交易字段在{' '}
          <Link href="/shop/products">商城 · 商品</Link>。
        </p>
      </header>
      <section className="panel">
        <p className="muted" style={{ marginBottom: '0.75rem' }}>
          <a href={CMS_BRIDGE.testimonials}>CMS 精选评价集合 →</a>
          {' · '}
          <a href={CMS_BRIDGE.productPages}>CMS 商品详情集合 →</a>
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {list.map((p) => (
            <li key={p.sku} style={{ marginBottom: '0.35rem' }}>
              <Link href={`/content/products/${encodeURIComponent(p.sku)}`}>
                {p.name} <span className="muted">({p.sku})</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
