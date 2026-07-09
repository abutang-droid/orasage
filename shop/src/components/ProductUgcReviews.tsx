'use client';

import { useState } from 'react';

export type UgcReview = {
  id: number;
  rating: number;
  body: string;
  author: string;
  featured?: boolean;
  createdAt: string;
};

export function ProductUgcReviews({ sku, reviews }: { sku: string; reviews: UgcReview[] }) {
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(sku)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, rating, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || '提交失败');
      setMessage(data.review?.message ?? '评价已提交，审核通过后将展示');
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交失败');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="shop-pdp-ugc-reviews" aria-labelledby="shop-pdp-ugc-title">
      <h2 id="shop-pdp-ugc-title" className="shop-pdp-passage-heading">
        用户评价
      </h2>

      {reviews.length > 0 ? (
        <ul className="shop-pdp-voice-list">
          {reviews.map((item) => (
            <li key={item.id} className="shop-pdp-voice">
              {item.featured ? <span className="badge ok">精选</span> : null}
              <p className="shop-pdp-voice-body">{item.body}</p>
              <p className="shop-pdp-voice-meta">
                <span className="shop-pdp-voice-stars" aria-label={`${item.rating} 星`}>
                  {'★'.repeat(item.rating)}
                </span>
                <span className="shop-pdp-voice-author">{item.author}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted">暂无用户公开评价，购买后可留下第一条。</p>
      )}

      <form className="shop-review-form panel" onSubmit={(e) => void onSubmit(e)}>
        <h3 className="shop-review-form-title">写下你的评价</h3>
        <label>
          评分
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} 星</option>
            ))}
          </select>
        </label>
        <label>
          评价内容
          <textarea
            rows={4}
            required
            minLength={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="分享佩戴或使用体验…"
          />
        </label>
        {message ? <p className="muted panel-notice">{message}</p> : null}
        {error ? <p className="panel-notice panel-notice--error">{error}</p> : null}
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? '提交中…' : '提交评价'}
        </button>
      </form>
    </section>
  );
}
