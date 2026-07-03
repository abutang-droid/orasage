'use client';

import { useEffect, useState } from 'react';
import { fetchZiweiFeed, type ZiweiFeedItem } from '@/lib/cms-ziwei-feed';
import { useT, useLocale } from '@/lib/i18n';

function FeedChip({ kind, label }: { kind: ZiweiFeedItem['kind']; label: string }) {
  return (
    <span className={`ziwei-feed-chip ziwei-feed-chip--${kind}`} aria-hidden>
      {label}
    </span>
  );
}

/** CMS 可配置的滚动订单/评价信息流 */
export function ZiweiHomeFeed() {
  const t = useT();
  const { locale } = useLocale();
  const [items, setItems] = useState<ZiweiFeedItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    void fetchZiweiFeed(locale).then((feed) => {
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
    <section className="ziwei-home-feed" aria-label={t('feed.aria')}>
      <div className="ziwei-home-feed-mask">
        <div className="ziwei-home-feed-track">
          {loop.map((item, index) => (
            <span key={`${item.id}-${index}`} className="ziwei-home-feed-item">
              <FeedChip
                kind={item.kind}
                label={item.kind === 'review' ? reviewLabel : orderLabel}
              />
              <span className="ziwei-home-feed-text">{item.message}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
