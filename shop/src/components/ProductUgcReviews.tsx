'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

export type UgcReview = {
  id: number;
  rating: number;
  body: string;
  author: string;
  featured?: boolean;
  createdAt: string;
};

type Eligibility = {
  authenticated: boolean;
  canReview: boolean;
  reason: 'login_required' | 'purchase_required' | 'ok' | string;
  orderNo: string | null;
};

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? ORASAGE_URLS.auth;

function formatReviewDate(iso: string, localeHint: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(localeHint, { year: 'numeric', month: 'short', day: 'numeric' }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}

function StarPicker({
  value,
  onChange,
  label,
  optionLabel,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  optionLabel: (n: number) => string;
}) {
  return (
    <fieldset className="shop-review-stars">
      <legend className="shop-review-label">{label}</legend>
      <div className="shop-review-star-row" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n <= value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={optionLabel(n)}
              className={`shop-review-star${active ? ' is-active' : ''}`}
              onClick={() => onChange(n)}
            >
              ★
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProductUgcReviews({ sku, reviews }: { sku: string; reviews: UgcReview[] }) {
  const t = useTranslations('pdp');
  const tr = useTranslations('pdp.reviews');
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [eligLoading, setEligLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setEligLoading(true);
    void (async () => {
      try {
        const res = await fetch(`/api/reviews/${encodeURIComponent(sku)}/eligibility`, {
          credentials: 'include',
          cache: 'no-store',
        });
        const data = (await res.json().catch(() => null)) as Eligibility | null;
        if (!cancelled) {
          setEligibility(
            data ?? { authenticated: false, canReview: false, reason: 'login_required', orderNo: null },
          );
        }
      } catch {
        if (!cancelled) {
          setEligibility({
            authenticated: false,
            canReview: false,
            reason: 'login_required',
            orderNo: null,
          });
        }
      } finally {
        if (!cancelled) setEligLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sku]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eligibility?.canReview) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/reviews/${encodeURIComponent(sku)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          rating,
          body,
          orderNo: eligibility.orderNo ?? undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || tr('submitFailed'));
      setMessage(data.review?.message ?? tr('submitted'));
      setBody('');
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('submitFailed'));
    } finally {
      setPending(false);
    }
  };

  const loginHref = `${AUTH_URL}/login?redirect=${encodeURIComponent(
    typeof window !== 'undefined' ? window.location.href : `/product/${sku}`,
  )}`;

  const localeHint =
    typeof document !== 'undefined'
      ? document.documentElement.lang || 'zh-CN'
      : 'zh-CN';

  return (
    <section className="shop-pdp-ugc-reviews" aria-labelledby="shop-pdp-ugc-title">
      <header className="shop-review-header">
        <h2 id="shop-pdp-ugc-title" className="shop-pdp-passage-heading">
          {tr('title')}
        </h2>
        <p className="shop-review-count">
          {tr('count', { count: reviews.length })}
        </p>
      </header>

      {reviews.length > 0 ? (
        <ul className="shop-review-list">
          {reviews.map((item) => (
            <li key={item.id} className="shop-review-item">
              <div className="shop-review-item-top">
                <span
                  className="shop-review-item-stars"
                  aria-label={t('starsAria', { rating: item.rating })}
                >
                  {'★'.repeat(item.rating)}
                  <span className="shop-review-item-stars-empty" aria-hidden>
                    {'★'.repeat(Math.max(0, 5 - item.rating))}
                  </span>
                </span>
                {item.featured ? (
                  <span className="shop-review-badge">{tr('featured')}</span>
                ) : null}
              </div>
              <p className="shop-review-item-body">{item.body}</p>
              <p className="shop-review-item-meta">
                <span className="shop-review-item-author">{item.author}</span>
                {item.createdAt ? (
                  <time dateTime={item.createdAt}>
                    {formatReviewDate(item.createdAt, localeHint)}
                  </time>
                ) : null}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="shop-review-empty">{tr('empty')}</p>
      )}

      <div className="shop-review-compose">
        <h3 className="shop-review-compose-title">{tr('formTitle')}</h3>
        <p className="shop-review-compose-hint">{tr('formHint')}</p>

        {eligLoading ? (
          <p className="shop-review-gate muted">{tr('gateLoading')}</p>
        ) : message ? (
          <p className="shop-review-success" role="status">
            {message}
          </p>
        ) : !eligibility?.authenticated || eligibility.reason === 'login_required' ? (
          <div className="shop-review-gate">
            <p className="shop-review-gate-text">{tr('loginRequired')}</p>
            <a className="btn-primary shop-review-gate-cta" href={loginHref}>
              {tr('loginCta')}
            </a>
          </div>
        ) : !eligibility.canReview || eligibility.reason === 'purchase_required' ? (
          <div className="shop-review-gate">
            <p className="shop-review-gate-text">{tr('purchaseRequired')}</p>
          </div>
        ) : (
          <form className="shop-review-form" onSubmit={(e) => void onSubmit(e)}>
            <StarPicker
              value={rating}
              onChange={setRating}
              label={tr('rating')}
              optionLabel={(n) => tr('starOption', { n })}
            />
            <label className="shop-review-field">
              <span className="shop-review-label">{tr('body')}</span>
              <textarea
                className="shop-review-textarea"
                rows={4}
                required
                minLength={5}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={tr('placeholder')}
              />
              <span className="shop-review-field-hint">{tr('charsHint')}</span>
            </label>
            {error ? (
              <p className="shop-review-error" role="alert">
                {error}
              </p>
            ) : null}
            <button type="submit" className="btn-primary shop-review-submit" disabled={pending}>
              {pending ? tr('submitting') : tr('submit')}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
