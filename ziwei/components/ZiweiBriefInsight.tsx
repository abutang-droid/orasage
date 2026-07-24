'use client';

import { useEffect, useState } from 'react';
import { Card } from '@orasage/ui/card';
import { useLocale } from '@/lib/i18n';
import { aiRequestLanguage } from '@/lib/ai-request-lang';
import type { ZiweiChart } from '@/lib/ziwei/types';

type Props = {
  chart: ZiweiChart;
  minorMode?: boolean;
};

export function ZiweiBriefInsight({ chart, minorMode = false }: Props) {
  const { locale } = useLocale();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/insight/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chart, minorMode, language: aiRequestLanguage(locale) }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || '生成失败');
        if (!cancelled) setText(data.text ?? '');
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '生成失败');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [chart, minorMode, locale]);

  return (
    <Card asChild className="ziwei-brief-insight border-0 shadow-none">
      <section>
        <h2 className="ziwei-section-title">{minorMode ? '命理简读（青少年版）' : '命理简读'}</h2>
        {loading ? (
          <p className="ziwei-brief-muted">正在生成简读…</p>
        ) : error ? (
          <p className="ziwei-brief-error">{error}</p>
        ) : (
          <div className="ziwei-brief-body">{text}</div>
        )}
      </section>
    </Card>
  );
}
