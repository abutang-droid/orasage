import Link from 'next/link';
import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getProducts } from '@/lib/api';
import { redirect } from 'next/navigation';

export default async function ContentProductsIndexPage() {
  const admin = await getAdminUser();
  if (!admin) redirect(loginUrl());
  if (!staffCan(admin, 'content.product') && !staffCan(admin, 'shop.catalog')) {
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
          内容入口（content.product）：PDP 长文、图集、运营精选评价。价格 / 库存 / 可见性等交易字段在{' '}
          <Link href="/shop/products">商城 · 商品</Link>。用户 UGC 审核在{' '}
          <Link href="/shop/reviews">商城 · 评价</Link>。
        </p>
      </header>
      <section className="panel">
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {list.map((p) => (
            <li key={p.sku} style={{ marginBottom: '0.35rem' }}>
              <Link href={`/content/products/${encodeURIComponent(p.sku)}`}>
                {p.name} <span className="muted">({p.sku})</span>
              </Link>
              {' · '}
              <Link
                href={`/shop/products/${encodeURIComponent(p.sku)}`}
                className="muted"
              >
                交易编辑
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
