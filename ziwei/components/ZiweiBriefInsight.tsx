'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';
import type { ZiweiChart } from '@/lib/ziwei/types';
import { useT } from '@/lib/i18n';

type Props = {
  chart: ZiweiChart;
  minorMode?: boolean;
};

export function ZiweiBriefInsight({ chart, minorMode = false }: Props) {
  const t = useT();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/insight/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chart, minorMode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || t('insight.error'));
      setText(data.text ?? '');
    } catch (e) {
      setError(e instanceof Error ? e.message : t('insight.error'));
    } finally {
      setLoading(false);
    }
  }, [chart, minorMode, t]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [load, retryKey]);

  return (
    <Card asChild className="ziwei-brief-insight border-0 shadow-none">
      <section aria-busy={loading || undefined}>
        <h2 className="ziwei-section-title">{minorMode ? '命理简读（青少年版）' : '命理简读'}</h2>
        <div className="ziwei-brief-slot">
          {loading ? (
            <p className="ziwei-brief-muted" role="status" aria-live="polite">
              {t('insight.loading')}
            </p>
          ) : error ? (
            <div className="ziwei-brief-error" role="alert">
              <p>{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setRetryKey((k) => k + 1)}
              >
                {t('insight.retry')}
              </Button>
            </div>
          ) : text ? (
            <div className="ziwei-brief-body">{text}</div>
          ) : (
            <p className="ziwei-brief-muted">{t('insight.empty')}</p>
          )}
        </div>
      </section>
    </Card>
  );
}
