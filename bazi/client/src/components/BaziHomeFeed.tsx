import { useEffect, useState } from 'react';
import { fetchBaziFeed, type BaziFeedItem } from '@/lib/cms-bazi-feed';
import { useT } from '@/lib/i18n';

function FeedChip({ kind, label }: { kind: BaziFeedItem['kind']; label: string }) {
  return (
    <span className={`bazi-feed-chip bazi-feed-chip--${kind}`} aria-hidden>
      {label}
    </span>
  );
}

function FeedRow({ items, orderLabel, reviewLabel }: {
  items: BaziFeedItem[];
  orderLabel: string;
  reviewLabel: string;
}) {
  return (
    <>
      {items.map((item) => (
        <span key={item.id} className="bazi-home-feed-item">
          <FeedChip
            kind={item.kind}
            label={item.kind === 'review' ? reviewLabel : orderLabel}
          />
          <span className="bazi-home-feed-text">{item.message}</span>
        </span>
      ))}
    </>
  );
}

export function BaziHomeFeed() {
  const { t, locale } = useT();
  const [items, setItems] = useState<BaziFeedItem[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchBaziFeed(locale).then((feed) => {
      if (!cancelled) setItems(feed);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(mq.matches);
    sync();
    mq.addEventListener?.('change', sync);
    return () => mq.removeEventListener?.('change', sync);
  }, []);

  if (items.length === 0) return null;

  const orderLabel = t('feed.kind.order');
  const reviewLabel = t('feed.kind.review');

  return (
    <section className="bazi-home-feed" aria-label={t('feed.aria')}>
      <div className="bazi-home-feed-mask">
        <div className="bazi-home-feed-track">
          <FeedRow items={items} orderLabel={orderLabel} reviewLabel={reviewLabel} />
          {/* 视觉循环副本不进入可访问树（T6-02） */}
          {!reduceMotion ? (
            <span aria-hidden="true">
              <FeedRow items={items} orderLabel={orderLabel} reviewLabel={reviewLabel} />
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
