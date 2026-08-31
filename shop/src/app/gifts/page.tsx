import type { Metadata } from 'next';
import Link from 'next/link';
import { TrustBar } from '@/components/TrustBar';
import { Disclaimer } from '@/lib/orasage-app-shell/Disclaimer';
import { fetchProducts, type Product } from '@/lib/products';
import { getServerShopLocale } from '@/lib/currency-server';
import { fetchProductImageMap } from '@/lib/cms-product-images';
import { isCrystalGiftSku } from '../../../../shared/shop-crystal/index';
import { buildOrasageMetadata, ORASAGE_URLS } from '@/lib/orasage-seo';

export async function generateMetadata(): Promise<Metadata> {
  return buildOrasageMetadata({
    title: 'Gifts | OraSage',
    description:
      'Five Elements gift sets — crystal bracelets as mindful jewelry and intention reminders. Not fortune or outcome guarantees.',
    canonical: `${ORASAGE_URLS.shop}/gifts`,
  });
}

const SCENES = [
  { id: 'promotion', en: 'Promotion', zh: '升职祝贺' },
  { id: 'new-home', en: 'New Home', zh: '乔迁' },
  { id: 'new-year', en: 'New Year', zh: '新年' },
  { id: 'wedding', en: 'Wedding', zh: '婚礼' },
] as const;

function priceLabel(p: Product): string {
  return p.priceDisplay ?? `$${((p.priceCentsUsd ?? p.priceCents) / 100).toFixed(2)}`;
}

export default async function GiftsPage() {
  const locale = await getServerShopLocale();
  const isZh = locale.startsWith('zh');
  const t = (en: string, zh: string) => (isZh ? zh : en);
  const products = await fetchProducts(locale);
  const gifts = products.filter((p) => isCrystalGiftSku(p.sku)).slice(0, 5);
  const images = await fetchProductImageMap();

  // Prefer three showcase cards: wood / fire / water when present
  const prefer = ['crystal-wood-gift', 'crystal-fire-gift', 'crystal-water-gift'];
  const showcase = prefer
    .map((sku) => gifts.find((g) => g.sku === sku))
    .filter((g): g is Product => Boolean(g));
  const cards = showcase.length >= 3 ? showcase : gifts.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <link rel="canonical" href={`${ORASAGE_URLS.shop}/gifts`} />

      <header className="max-w-2xl">
        <p className="text-sm tracking-wide text-muted-foreground">{t('Gifts', '礼赠')}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('Gifts that mean something.', '有意味的礼赠。')}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {t(
            'Five Elements gift sets package a bracelet with card and pouch — jewelry as a tangible reminder of intention, not a promise of luck or wealth.',
            '五行礼盒含手串、祝福卡与绒布袋——器物承载意图，不是好运或财富承诺。',
          )}
        </p>
      </header>

      <div className="mt-6">
        <TrustBar locale={locale} />
      </div>

      <Disclaimer variant="product" locale={locale} className="mt-6" />

      <section className="mt-10" aria-labelledby="gift-skus">
        <h2 id="gift-skus" className="font-serif text-xl font-medium text-foreground">
          {t('Gift sets', '礼盒')}
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {cards.map((p) => {
                const img = images.get(p.sku) ?? p.imageUrl;
            return (
              <article
                key={p.sku}
                className="flex flex-col rounded-[var(--os-radius-card)] border border-border bg-card p-4 shadow-surface-1"
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="aspect-square w-full rounded-md object-cover" />
                ) : (
                  <div className="aspect-square w-full rounded-md bg-muted" aria-hidden />
                )}
                <h3 className="mt-3 text-sm font-medium text-foreground">{p.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
                <p className="mt-2 text-sm font-medium">{priceLabel(p)}</p>
                <Link
                  href={`/product/${p.sku}`}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-[var(--os-radius-btn)] bg-primary px-4 text-sm font-semibold text-primary-foreground"
                >
                  {t('View & add to cart', '查看并加入购物车')}
                </Link>
              </article>
            );
          })}
        </div>
        {gifts.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            {t('Gift SKUs will appear here when catalog is available.', '礼盒商品将在目录可用时显示。')}
          </p>
        )}
      </section>

      <section className="mt-12" aria-labelledby="gift-scenes">
        <h2 id="gift-scenes" className="font-serif text-xl font-medium text-foreground">
          {t('Occasions', '场景')}
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {SCENES.map((s) => (
            <span
              key={s.id}
              className="inline-flex min-h-9 items-center rounded-[var(--os-radius-btn)] border border-border px-3 text-xs text-muted-foreground"
            >
              {isZh ? s.zh : s.en}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {t('Filters ship in a later iteration.', '筛选将在后续迭代上线。')}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="gift-guides">
        <h2 id="gift-guides" className="font-serif text-xl font-medium text-foreground">
          {t('Gifting guides', '送礼指南')}
        </h2>
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li>{t('Choosing a bracelet for a friend starting a new chapter', '为开启新篇章的朋友选一串')}</li>
          <li>{t('Matching Five Elements symbolism to personality — without outcome claims', '用五行意象对应特质——不做结果承诺')}</li>
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">
          {t('Full articles land with Insights content.', '完整文章随玄析内容上线。')}
        </p>
      </section>

      <section className="mt-12" aria-labelledby="gift-faq">
        <h2 id="gift-faq" className="font-serif text-xl font-medium text-foreground">
          FAQ
        </h2>
        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-medium text-foreground">{t('Shipping', '发货')}</dt>
            <dd className="mt-1 text-muted-foreground">
              {t('See TrustBar for free-shipping threshold and policies.', '免运门槛与政策见信任条。')}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">{t('Returns', '退换')}</dt>
            <dd className="mt-1 text-muted-foreground">
              {t('Unused gift sets follow the shop return window.', '未使用礼盒遵循商城退换窗。')}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-foreground">{t('Gift card', '贺卡')}</dt>
            <dd className="mt-1 text-muted-foreground">
              {t('Card message options arrive in a later release.', '贺卡留言将在后续版本开放。')}
            </dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
