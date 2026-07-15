'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Check, ShoppingCart, Sparkles, Wand2 } from 'lucide-react';
import { Button } from '@orasage/ui/button';
import type { CrystalLineupItem } from '@/lib/crystal-lineup';
import { resolveInitialBaseSku } from '@/lib/crystal-lineup';
import type { CrystalBaseSku } from '../../../shared/shop-crystal/index';
import {
  CRYSTAL_ELEMENT_LABELS,
  getDefaultCrystalContent,
  normalizeCrystalLocale,
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

function productDisplayName(name: string, tagline?: string) {
  let rest = name;
  if (tagline && rest.startsWith(tagline)) {
    rest = rest.slice(tagline.length).replace(/^\s*[·•]\s*/, '');
  } else {
    rest = rest.replace(/^[^·]*·\s*/, '');
  }
  return rest
    .replace(/\s*[·•]\s*(礼盒装|禮盒裝|Gift box|Caixa presente)\s*$/i, '')
    .trim();
}

export function CrystalShowcase({ lineup, content }: CrystalShowcaseProps) {
  const t = useTranslations('crystalShowcase');
  const tp = useTranslations('product');
  const searchParams = useSearchParams();
  const { currency, locale } = useShopLocale();
  const { addItem } = useCart();
  const crystalLocale = normalizeCrystalLocale(locale);
  const defaults = useMemo(() => getDefaultCrystalContent(crystalLocale), [crystalLocale]);
  const elementLabels = CRYSTAL_ELEMENT_LABELS[crystalLocale];
  const panelId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);

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
    ? (content?.[active.baseSku] ?? defaults[active.baseSku])
    : null;

  const recommendationsHref = `https://orasage.com/${crystalLocale}/profile/recommendations`;
  const elementLabel = active
    ? (elementLabels[active.baseSku] ?? active.element)
    : '';

  useEffect(() => {
    const root = tablistRef.current;
    if (!root) return;
    const selected = root.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    selected?.scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' });
  }, [activeBaseSku]);

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

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    const idx = lineup.findIndex((row) => row.baseSku === active.baseSku);
    if (idx < 0) return;
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % lineup.length;
    if (e.key === 'ArrowLeft') next = idx <= 0 ? lineup.length - 1 : idx - 1;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = lineup.length - 1;
    const target = lineup[next];
    if (!target) return;
    selectBase(target.baseSku);
    const btn = tablistRef.current?.querySelector<HTMLElement>(
      `[role="tab"][data-base-sku="${target.baseSku}"]`,
    );
    btn?.focus();
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
          <a href={recommendationsHref} className="crystal-inline-link crystal-touch-link">
            {t('guideCta')}
          </a>
        </p>
      </section>

      <div className="crystal-element-tabs-wrap">
        <div
          className="crystal-element-tabs"
          role="tablist"
          aria-label={t('elementTabs')}
          ref={tablistRef}
          onKeyDown={onTabKeyDown}
        >
          {lineup.map((row) => {
            const selected = row.baseSku === active.baseSku;
            const rowEntry = content?.[row.baseSku] ?? defaults[row.baseSku];
            const label = elementLabels[row.baseSku] ?? row.element;
            return (
              <button
                key={row.baseSku}
                type="button"
                role="tab"
                data-base-sku={row.baseSku}
                id={`${panelId}-tab-${row.baseSku}`}
                aria-selected={selected}
                aria-controls={panelId}
                tabIndex={selected ? 0 : -1}
                className="crystal-element-tab"
                data-selected={selected}
                onClick={() => selectBase(row.baseSku)}
              >
                <span className="crystal-element-tab-char">{label}</span>
                <span className="crystal-element-tab-tagline">{rowEntry?.tagline}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        className="crystal-feature"
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${panelId}-tab-${active.baseSku}`}
      >
        <div className="crystal-feature-halo" aria-hidden />
        <div className="crystal-feature-media">
          <ProductImage
            sku={activeProduct.sku}
            name={activeProduct.name}
            category="crystal"
            imageUrl={activeProduct.imageUrl}
            className="crystal-feature-image"
            sizes="(max-width: 768px) 100vw, 36rem"
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
            {t('elementLabel', { element: elementLabel })}
          </p>
          <h2 className="crystal-feature-title">
            {entry?.tagline ? (
              <>
                <span className="crystal-feature-tagline">{entry.tagline}</span>
                <span className="crystal-feature-name">
                  {productDisplayName(active.standard.name, entry.tagline)}
                </span>
              </>
            ) : (
              productDisplayName(active.standard.name)
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

          <div className="crystal-pack-toggle" role="radiogroup" aria-label={t('packToggle')}>
            <button
              type="button"
              role="radio"
              className="crystal-pack-option"
              aria-checked={pack === 'standard'}
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
              role="radio"
              className="crystal-pack-option"
              aria-checked={pack === 'gift'}
              aria-disabled={!canGift}
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

          {entry?.packNote ? (
            <p className="crystal-packaging">{entry.packNote}</p>
          ) : null}

          <p className="crystal-learn-more">
            <Link
              href={`/product/${encodeURIComponent(activeProduct.sku)}`}
              className="crystal-detail-link crystal-touch-link"
            >
              {t('learnMore')}
            </Link>
          </p>

          <div className="crystal-feature-actions">
            <Button
              type="button"
              onClick={() => void handleBuy()}
              disabled={loading}
              loading={loading}
              className="crystal-action-buy min-w-0"
            >
              {loading ? tp('buying') : tp('buyNow')}
            </Button>
            <Button asChild variant="outline" className="crystal-action-diy min-w-0">
              <Link href={diyBaseHref} className="crystal-action-diy-link">
                <Wand2 size={16} strokeWidth={1.8} aria-hidden />
                <span>{tp('customBracelet')}</span>
              </Link>
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddToCart}
              aria-label={added ? tp('added') : tp('addToCart')}
              className="crystal-action-cart h-control-md w-11 min-w-11 shrink-0 p-0"
            >
              {added ? (
                <Check size={18} strokeWidth={2} aria-hidden />
              ) : (
                <ShoppingCart size={18} strokeWidth={1.8} aria-hidden />
              )}
            </Button>
          </div>
          <div className="sr-only" role="status" aria-live="polite">
            {added ? tp('addedToCart') : ''}
          </div>
          {error ? (
            <p className="crystal-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </section>

      {entry?.ritual ? (
        <section className="crystal-ritual">
          <span className="crystal-ritual-mark" aria-hidden>
            <Sparkles size={16} strokeWidth={1.8} />
          </span>
          <div>
            <h3 className="crystal-ritual-title">{t('ritualTitle')}</h3>
            <p className="crystal-ritual-text">{entry.ritual}</p>
          </div>
        </section>
      ) : null}

      <div
        className="crystal-thumb-strip"
        role="group"
        aria-label={t('elementTabs')}
      >
        {lineup.map((row) => {
          const selected = row.baseSku === active.baseSku;
          const thumbProduct = row.standard;
          const rowEntry = content?.[row.baseSku] ?? defaults[row.baseSku];
          const label = elementLabels[row.baseSku] ?? row.element;
          return (
            <button
              key={row.baseSku}
              type="button"
              className="crystal-thumb"
              data-selected={selected}
              aria-pressed={selected}
              onClick={() => selectBase(row.baseSku)}
              aria-label={thumbProduct.name}
            >
              <ProductImage
                sku={thumbProduct.sku}
                name={thumbProduct.name}
                category="crystal"
                imageUrl={thumbProduct.imageUrl}
                className="crystal-thumb-image"
                sizes="(max-width: 640px) 18vw, 7rem"
              />
              <span className="crystal-thumb-element">{label}</span>
              <span className="crystal-thumb-tagline">{rowEntry?.tagline}</span>
            </button>
          );
        })}
      </div>

      <section className="crystal-diy-entry">
        <div className="crystal-diy-entry-icon" aria-hidden>
          <Wand2 size={22} strokeWidth={1.6} />
        </div>
        <div className="crystal-diy-entry-body">
          <h3 className="crystal-diy-entry-title">{t('diyTitle')}</h3>
          <p className="crystal-diy-entry-hint">{t('diyHint')}</p>
          <div className="crystal-diy-entry-actions">
            <Button asChild className="crystal-diy-entry-cta">
              <Link href={diyElementHref} className="crystal-action-diy-link">
                <Wand2 size={16} strokeWidth={1.8} aria-hidden />
                <span>{t('diyCtaElement', { element: elementLabel })}</span>
              </Link>
            </Button>
            <Link href="/diy" className="crystal-diy-entry-generic crystal-touch-link">
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
