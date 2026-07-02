'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchReadings, type UserReading } from '@/lib/auth';

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ReadingsList() {
  const t = useTranslations('profile.readings');
  const [readings, setReadings] = useState<UserReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setReadings(await fetchReadings());
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

  if (readings.length === 0) {
    return <p className="text-sm text-sage-muted">{t('empty')}</p>;
  }

  return (
    <ul className="space-y-3">
      {readings.map((r) => (
        <li
          key={r.id}
          className="rounded-2xl border border-sage-border/60 bg-sage-card/30 p-4"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-medium text-white">{r.title}</p>
              <p className="mt-1 text-xs text-sage-muted">{r.appLabel}</p>
            </div>
            <p className="text-xs text-sage-purple">{formatDate(r.createdAt)}</p>
          </div>
          {r.summary && (
            <p className="mt-3 text-sm leading-relaxed text-sage-muted line-clamp-3">{r.summary}</p>
          )}
          {r.recommendationReason && (
            <p className="mt-2 text-xs text-sage-gold/80">{r.recommendationReason}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
