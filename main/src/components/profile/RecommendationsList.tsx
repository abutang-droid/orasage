'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchRecommendations, type UserRecommendation } from '@/lib/auth';
import { externalUrls } from '@/lib/urls';

const CRYSTAL_LABELS: Record<string, string> = {
  'crystal-wood': '绿幽灵',
  'crystal-fire': '红玛瑙',
  'crystal-earth': '黄水晶',
  'crystal-metal': '白水晶',
  'crystal-water': '海蓝宝',
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function RecommendationsList({ compact = false }: { compact?: boolean }) {
  const t = useTranslations('profile.recommendations');
  const [items, setItems] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setItems(await fetchRecommendations());
      } catch {
        setError(t('loadError'));
      } finally {
        setLoading(false);
      }
    })();
  }, [t]);

  if (loading) {
    return <p className="text-sm text-sage-muted">{t('loading')}</p>;
  }

  if (error) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (items.length === 0) {
    return <p className="text-sm text-sage-muted">{t('empty')}</p>;
  }

  const list = compact ? items.slice(0, 3) : items;

  return (
    <ul className="space-y-3">
      {list.map((r) => {
        const crystalName = CRYSTAL_LABELS[r.crystalSku] ?? r.crystalSku;
        return (
          <li
            key={r.id}
            className="rounded-2xl border border-sage-border/60 bg-sage-card/30 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium text-sage-gold">{crystalName}</p>
                <p className="mt-1 text-xs text-sage-muted">
                  {r.appLabel}
                  {!compact && ` · ${formatDate(r.createdAt)}`}
                </p>
              </div>
              <a
                href={`${externalUrls.shop}?sku=${encodeURIComponent(r.crystalSku)}`}
                className="shrink-0 rounded-full border border-sage-gold/40 px-3 py-1 text-xs text-sage-gold transition hover:bg-sage-gold/10"
              >
                {t('viewShop')}
              </a>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-sage-muted">{r.reason}</p>
          </li>
        );
      })}
    </ul>
  );
}
