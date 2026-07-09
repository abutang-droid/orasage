'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, ShoppingCart, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@orasage/ui/button';
import type { CrystalLineupItem } from '@/lib/crystal-lineup';
import { resolveInitialBaseSku } from '@/lib/crystal-lineup';
import type { CrystalBaseSku } from '../../../shared/shop-crystal/index';
import {
  DEFAULT_CRYSTAL_CONTENT,
  type CrystalContentMap,
} from '../../../shared/shop-crystal/content';
import type { Product } from '@/lib/products';
import { useShopLocale } from '@/components/ShopLocaleProvider';
import { formatShopPrice, resolvePriceCents } from '@/lib/currency';
import { useCart } from '@/lib/cart';
import { ProductImage } from './ProductImage';

type PackVariant = 'standard' | 'gift';

type CrystalShowcaseProps = {
  lineup: CrystalLineupItem[];
  content?: CrystalContentMap;
};

function resolveDisplayPrice(product: Product, currency: 'cny' | 'usd') {
  const cents = product.priceCentsResolved
    ?? resolvePriceCents(
      { priceCents: product.priceCents, priceCentsUsd: product.priceCentsUsd },
      currency,
    );
  return product.priceDisplay ?? formatShopPrice(cents, currency);
}

export function CrystalShowcase({ lineup, content }: CrystalShowcaseProps) {
  const t = useTranslations('crystalShowcase');
  const tp = useTranslations('product');
  const searchParams = useSearchParams();
  const { currency } = useShopLocale();
  const { addItem } = useCart();

  const initialBase = resolveInitialBaseSku(lineup, searchParams.get('element'));
  const [activeBaseSku, setActiveBaseSku] = useState<CrystalBaseSku>(initialBase);
  const [pack, setPack] = useState<PackVariant>('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  const active = useMemo(
    () => lineup.find((row) => row.baseSku === activeBaseSku) ?? lineup[0],
    [lineup, activeBaseSku],
  );

  const activeProduct = pack === 'gift' && active?.gift ? active.gift : active?.standard;
  const canGift = Boolean(active?.gift);
  const entry = active
    ? (content?.[active.baseSku] ?? DEFAULT_CRYSTAL_CONTENT[active.baseSku])
    : null;

  if (!active || !activeProduct) {
    return <p className="text-center text-sage-muted">{t('empty')}</p>;
  }

  async function handleBuy() {
    if (!activeProduct) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sku: activeProduct.sku }),
      });
      const data = await res.json();
      if (res.status === 401) {
        window.location.href = `/checkout?sku=${encodeURIComponent(activeProduct.sku)}`;
        return;
      }
      if (!res.ok) throw new Error(data.error || tp('buyFailed'));
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.orderNo) {
        window.location.href = `/checkout?order=${encodeURIComponent(data.orderNo)}`;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tp('buyFailed'));
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart() {
    if (!activeProduct) return;
    addItem(activeProduct.sku);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  function selectBase(baseSku: CrystalBaseSku) {
    setActiveBaseSku(baseSku);
    setPack('standard');
    setError('');
  }

  const diyElementHref = `/diy?element=${encodeURIComponent(active.element)}`;
  const diyBaseHref = `/diy?base=${encodeURIComponent(active.baseSku)}`;

  return (
    <div className="crystal-showcase">
      <section className="crystal-guide">
        <h2 className="crystal-section-title">
          <Sparkles size={16} strokeWidth={1.8} aria-hidden className="crystal-title-icon" />
          {t('guideTitle')}
        </h2>
        <ol className="crystal-guide-steps">
          <li>{t('guideStep1')}</li>
          <li>{t('guideStep2')}</li>
          <li>{t('guideStep3')}</li>
        </ol>
        <p className="crystal-guide-note">
          <a href="https://orasage.com/zh-CN/profile/recommendations" className="crystal-inline-link">
            {t('guideCta')}
          </a>
        </p>
      </section>

      <div className="crystal-element-tabs" role="tablist" aria-label={t('elementTabs')}>
        {lineup.map((row) => {
          const selected = row.baseSku === active.baseSku;
          const rowEntry = content?.[row.baseSku] ?? DEFAULT_CRYSTAL_CONTENT[row.baseSku];
          return (
            <button
              key={row.baseSku}
              type="button"
              role="tab"
              aria-selected={selected}
              className="crystal-element-tab"
              data-selected={selected}
              style={{ '--crystal-accent': row.accent } as React.CSSProperties}
              onClick={() => selectBase(row.baseSku)}
            >
              <span className="crystal-element-tab-char">{row.element}</span>
              <span className="crystal-element-tab-tagline">{rowEntry?.tagline}</span>
            </button>
          );
        })}
      </div>

      <section
        className="crystal-feature"
        style={{ '--crystal-accent': active.accent } as React.CSSProperties}
      >
        <div className="crystal-feature-halo" aria-hidden />
        <div className="crystal-feature-media">
          <ProductImage
            sku={activeProduct.sku}
            name={activeProduct.name}
            category="crystal"
            imageUrl={activeProduct.imageUrl}
            className="crystal-feature-image"
            priority
          />
          {entry?.keywords?.length ? (
            <div className="crystal-keyword-chips" aria-label={t('keywordsLabel')}>
              {entry.keywords.map((kw) => (
                <span key={kw} className="crystal-keyword-chip">{kw}</span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="crystal-feature-body">
          <p className="crystal-feature-eyebrow">
            {t('elementLabel', { element: active.element })}
          </p>
          <h2 className="crystal-feature-title">
            {entry?.tagline ? (
              <>
                <span className="crystal-feature-tagline">{entry.tagline}</span>
                <span className="crystal-feature-name">
                  {active.standard.name.replace(/^[^·]*·\s*/, '').replace(/ · 礼盒装$/, '')}
                </span>
              </>
            ) : (
              active.standard.name.replace(/ · 礼盒装$/, '')
            )}
          </h2>
          <p className="crystal-feature-desc">{active.standard.desc}</p>

          {entry?.story ? (
            <blockquote className="crystal-story">{entry.story}</blockquote>
          ) : null}

          {entry?.benefits?.length ? (
            <ul className="crystal-benefits">
              {entry.benefits.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          ) : null}

          <div className="crystal-pack-toggle" role="group" aria-label={t('packToggle')}>
            <button
              type="button"
              className="crystal-pack-option"
              data-active={pack === 'standard'}
              onClick={() => setPack('standard')}
            >
              <span className="crystal-pack-name">{t('packStandard')}</span>
              <span className="crystal-pack-hint">{t('packStandardHint')}</span>
              <span className="crystal-pack-price">
                {resolveDisplayPrice(active.standard, currency)}
              </span>
            </button>
            <button
              type="button"
              className="crystal-pack-option"
              data-active={pack === 'gift'}
              data-disabled={!canGift}
              disabled={!canGift}
              onClick={() => canGift && setPack('gift')}
            >
              <span className="crystal-pack-name">{t('packGift')}</span>
              <span className="crystal-pack-hint">{t('packGiftHint')}</span>
              <span className="crystal-pack-price">
                {active.gift ? resolveDisplayPrice(active.gift, currency) : '—'}
              </span>
            </button>
          </div>

          {activeProduct.packaging ? (
            <p className="crystal-packaging">{activeProduct.packaging}</p>
          ) : null}

          <p className="crystal-learn-more">
            <Link href={`/product/${encodeURIComponent(activeProduct.sku)}`} className="crystal-detail-link">
              {t('learnMore')}
            </Link>
          </p>

          <div className="crystal-feature-actions">
            <Button
              type="button"
              onClick={() => void handleBuy()}
              disabled={loading}
              loading={loading}
              className="min-w-0 flex-1"
            >
              {loading ? tp('buying') : tp('buyNow')}
            </Button>
            <Button asChild variant="outline" className="min-w-0 flex-1">
              <Link href={diyBaseHref}>✦ {tp('customBracelet')}</Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddToCart}
              aria-label={added ? tp('added') : tp('addToCart')}
              className="h-control-md w-11 min-w-11 shrink-0 p-0"
            >
              {added ? (
                <Check size={18} strokeWidth={2} aria-hidden />
              ) : (
                <ShoppingCart size={18} strokeWidth={1.8} aria-hidden />
              )}
            </Button>
          </div>
          {error ? <p className="crystal-error">{error}</p> : null}
        </div>
      </section>

      {entry?.ritual ? (
        <section
          className="crystal-ritual"
          style={{ '--crystal-accent': active.accent } as React.CSSProperties}
        >
          <span className="crystal-ritual-mark" aria-hidden>✦</span>
          <div>
            <h3 className="crystal-ritual-title">{t('ritualTitle')}</h3>
            <p className="crystal-ritual-text">{entry.ritual}</p>
          </div>
        </section>
      ) : null}

      <div className="crystal-thumb-strip">
        {lineup.map((row) => {
          const selected = row.baseSku === active.baseSku;
          const thumbProduct = row.standard;
          const rowEntry = content?.[row.baseSku] ?? DEFAULT_CRYSTAL_CONTENT[row.baseSku];
          return (
            <button
              key={row.baseSku}
              type="button"
              className="crystal-thumb"
              data-selected={selected}
              style={{ '--crystal-accent': row.accent } as React.CSSProperties}
              onClick={() => selectBase(row.baseSku)}
              aria-label={thumbProduct.name}
            >
              <ProductImage
                sku={thumbProduct.sku}
                name={thumbProduct.name}
                category="crystal"
                imageUrl={thumbProduct.imageUrl}
                className="crystal-thumb-image"
              />
              <span className="crystal-thumb-element">{row.element}</span>
              <span className="crystal-thumb-tagline">{rowEntry?.tagline}</span>
            </button>
          );
        })}
      </div>

      <section
        className="crystal-diy-entry"
        style={{ '--crystal-accent': active.accent } as React.CSSProperties}
      >
        <div className="crystal-diy-entry-icon" aria-hidden>
          <Wand2 size={22} strokeWidth={1.6} />
        </div>
        <div className="crystal-diy-entry-body">
          <h3 className="crystal-diy-entry-title">{t('diyTitle')}</h3>
          <p className="crystal-diy-entry-hint">{t('diyHint')}</p>
          <div className="crystal-diy-entry-actions">
            <Button asChild className="crystal-diy-entry-cta">
              <Link href={diyElementHref}>
                ✦ {t('diyCtaElement', { element: active.element })}
              </Link>
            </Button>
            <Link href="/diy" className="crystal-diy-entry-generic">
              {t('diyCtaGeneric')}
            </Link>
          </div>
        </div>
      </section>

      <section className="crystal-compare">
        <h3 className="crystal-section-title">{t('compareTitle')}</h3>
        <div className="crystal-compare-grid">
          <div className="crystal-compare-cell">
            <h4>{t('packStandard')}</h4>
            <p>{t('compareStandard')}</p>
          </div>
          <div className="crystal-compare-cell">
            <h4>{t('packGift')}</h4>
            <p>{t('compareGift')}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
