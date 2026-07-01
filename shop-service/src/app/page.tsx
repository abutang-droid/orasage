import Link from 'next/link';
import { listActiveProducts } from '@/lib/orders';

export const dynamic = 'force-dynamic';

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

const APP_LABELS: Record<string, string> = {
  shop: '商城',
  bazi: '八字',
  ziwei: '紫微',
  tarot: '塔罗',
};

export default async function HomePage() {
  const products = await listActiveProducts();
  const featured = products.slice(0, 6);

  return (
    <>
      <section className="hero container">
        <h1>探索你的命理之旅</h1>
        <p>
          八字详批、紫微命盘、塔罗解读 — 一站式数字商品与会员服务。
          各命理 App 内也可直接购买，无需跳转。
        </p>
        <Link href="/products" className="btn btn-primary">
          浏览全部商品
        </Link>
      </section>

      <section className="container">
        <h2 className="page-title">精选商品</h2>
        {featured.length === 0 ? (
          <p className="empty">暂无商品，请运行 npm run db:seed 初始化数据。</p>
        ) : (
          <div className="product-grid">
            {featured.map((p) => (
              <article key={p.id} className="product-card">
                <div className="image">✨</div>
                <div className="body">
                  <span className="badge">{APP_LABELS[p.appSource] ?? p.appSource}</span>
                  <h3>
                    <Link href={`/products/${p.slug}`}>{p.name}</Link>
                  </h3>
                  <p className="desc">{p.description}</p>
                  <div className="meta">
                    <span className="price">{formatPrice(p.priceCents, p.currency)}</span>
                    <Link href={`/products/${p.slug}`}>查看 →</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
