'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@orasage/ui/badge';
import { fetchZiweiFeed, type ZiweiFeedItem } from '@/lib/cms-ziwei-feed';
import { useT, useLocale } from '@/lib/i18n';

function FeedChip({ kind, label }: { kind: ZiweiFeedItem['kind']; label: string }) {
  return (
    <Badge
      variant="outline"
      className={`ziwei-feed-chip ziwei-feed-chip--${kind} h-auto rounded-full px-2 py-0.5 text-[0.625rem] font-semibold`}
      aria-hidden
    >
      {label}
    </Badge>
  );
}

function FeedItems({
  items,
  orderLabel,
  reviewLabel,
}: {
  items: ZiweiFeedItem[];
  orderLabel: string;
  reviewLabel: string;
}) {
  return (
    <>
      {items.map((item) => (
        <span key={item.id} className="ziwei-home-feed-item">
          <FeedChip
            kind={item.kind}
            label={item.kind === 'review' ? reviewLabel : orderLabel}
          />
          <span className="ziwei-home-feed-text">{item.message}</span>
        </span>
      ))}
    </>
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

  return (
    <section className="ziwei-home-feed" aria-label={t('feed.aria')}>
      <div className="ziwei-home-feed-mask">
        <div className="ziwei-home-feed-track">
          <div className="ziwei-home-feed-group">
            <FeedItems items={items} orderLabel={orderLabel} reviewLabel={reviewLabel} />
          </div>
          <div className="ziwei-home-feed-group" aria-hidden>
            <FeedItems items={items} orderLabel={orderLabel} reviewLabel={reviewLabel} />
          </div>
        </div>
      </div>
    </section>
  );
}
