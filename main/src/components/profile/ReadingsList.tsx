'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { fetchReadings, type UserReading } from '@/lib/auth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProfileListSkeleton } from './ProfileListSkeleton';

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
    return <ProfileListSkeleton rows={3} />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (readings.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <ul className="space-y-3">
      {readings.map((r) => (
        <li key={r.id}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-foreground">{r.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.appLabel}</p>
                </div>
                <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
              </div>
              {r.summary && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{r.summary}</p>
              )}
              {r.recommendationReason && (
                <p className="mt-2 text-xs text-primary/90">{r.recommendationReason}</p>
              )}
              {r.reportUrl && (
                <a
                  href={r.reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-4 inline-flex')}
                >
                  {t('viewReport')}
                </a>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
