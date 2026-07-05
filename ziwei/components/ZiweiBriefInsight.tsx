'use client';

import { useEffect, useState } from 'react';
import type { ZiweiChart } from '@/lib/ziwei/types';

type Props = {
  chart: ZiweiChart;
};

export function ZiweiBriefInsight({ chart }: Props) {
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
          body: JSON.stringify({ chart }),
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
  }, [chart]);

  return (
    <section className="ziwei-brief-insight">
      <h2 className="ziwei-section-title">命理简读</h2>
      {loading ? (
        <p className="ziwei-brief-muted">正在生成简读…</p>
      ) : error ? (
        <p className="ziwei-brief-error">{error}</p>
      ) : (
        <div className="ziwei-brief-body">{text}</div>
      )}
    </section>
  );
}
