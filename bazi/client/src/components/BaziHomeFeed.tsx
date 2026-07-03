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

export function BaziHomeFeed() {
  const { t, locale } = useT();
  const [items, setItems] = useState<BaziFeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchBaziFeed(locale).then((feed) => {
      if (!cancelled) setItems(feed);
    });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (items.length === 0) return null;

  const orderLabel = t('feed.kind.order');
  const reviewLabel = t('feed.kind.review');
  const loop = [...items, ...items];

  return (
    <section className="bazi-home-feed" aria-label={t('feed.aria')}>
      <div className="bazi-home-feed-mask">
        <div className="bazi-home-feed-track">
          {loop.map((item, index) => (
            <span key={`${item.id}-${index}`} className="bazi-home-feed-item">
              <FeedChip
                kind={item.kind}
                label={item.kind === 'review' ? reviewLabel : orderLabel}
              />
              <span className="bazi-home-feed-text">{item.message}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
