'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@orasage/ui/button';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.orasage.com';
const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? 'https://shop.orasage.com';

export type UgcReview = {
  id: number;
  rating: number;
  body: string;
  author: string;
  featured?: boolean;
  createdAt: string;
};

type Eligibility =
  | { status: 'loading' }
  | { status: 'unauthenticated' }
  | { status: 'not_purchased' }
  | { status: 'eligible'; orderNo: string }
  | { status: 'error' };

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

export function ProductUgcReviews({ sku, reviews }: { sku: string; reviews: UgcReview[] }) {
  const t = useTranslations('pdp.reviews');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [body, setBody] = useState('');
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    setEligibility({ status: 'loading' });
    fetch(`/api/reviews/${encodeURIComponent(sku)}/eligibility`, {
      credentials: 'include',
      cache: 'no-store',
    })
      .then(async (res) => {
        const data = (await res.json().catch(() => ({}))) as {
          eligible?: boolean;
          reason?: string;
          orderNo?: string;
        };
        if (cancelled) return;
        if (data.eligible && data.orderNo) {
          setEligibility({ status: 'eligible', orderNo: data.orderNo });
          return;
        }
        if (data.reason === 'unauthenticated') {
          setEligibility({ status: 'unauthenticated' });
          return;
        }
        if (data.reason === 'not_purchased') {
          setEligibility({ status: 'not_purchased' });
          return;
        }
        setEligibility({ status: 'error' });
      })
      .catch(() => {
        if (!cancelled) setEligibility({ status: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [sku]);

  const returnUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${SHOP_URL}/product/${encodeURIComponent(sku)}`;
  const loginHref = `${AUTH_URL}/login?redirect=${encodeURIComponent(returnUrl)}`;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (eligibility.status !== 'eligible') return;
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
          orderNo: eligibility.orderNo,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        window.location.href = loginHref;
        return;
      }
      if (!res.ok) throw new Error(data.error || t('submitFailed'));
      setMessage(data.review?.message ?? t('submitSuccess'));
      setBody('');
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('submitFailed'));
    } finally {
      setPending(false);
    }
  };

  const displayStars = hoverRating || rating;

  return (
    <section className="shop-pdp-ugc-reviews" aria-labelledby="shop-pdp-ugc-title">
      <h2 id="shop-pdp-ugc-title" className="shop-pdp-passage-heading">
        {t('title')}
      </h2>
      <p className="shop-pdp-review-disclaimer text-sm text-muted-foreground">{t('disclaimer')}</p>

      {reviews.length > 0 ? (
        <ul className="shop-pdp-voice-list">
          {reviews.map((item) => (
            <li key={item.id} className="shop-pdp-voice">
              {item.featured ? <span className="shop-review-featured">{t('featured')}</span> : null}
              <p className="shop-pdp-voice-body">{item.body}</p>
              <p className="shop-pdp-voice-meta">
                <span className="shop-pdp-voice-stars" aria-label={t('starLabel', { n: item.rating })}>
                  {'★'.repeat(item.rating)}
                  <span className="shop-review-stars-empty" aria-hidden>
                    {'★'.repeat(Math.max(0, 5 - item.rating))}
                  </span>
                </span>
                <span className="shop-pdp-voice-author">{item.author}</span>
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="shop-review-empty">{t('empty')}</p>
      )}

      <div className="shop-review-compose">
        <p className="shop-review-compose-eyebrow">{t('eyebrow')}</p>
        <h3 className="shop-review-compose-title">{t('composeTitle')}</h3>
        <p className="shop-review-compose-hint">{t('composeHint')}</p>

        {eligibility.status === 'loading' ? (
          <p className="shop-review-gate" aria-live="polite">
            {t('checking')}
          </p>
        ) : null}

        {eligibility.status === 'unauthenticated' ? (
          <div className="shop-review-gate">
            <p className="shop-review-gate-text">{t('loginRequired')}</p>
            <Button asChild variant="secondary" className="shop-review-gate-cta">
              <a href={loginHref}>{t('loginCta')}</a>
            </Button>
          </div>
        ) : null}

        {eligibility.status === 'not_purchased' ? (
          <div className="shop-review-gate">
            <p className="shop-review-gate-text">{t('purchaseRequired')}</p>
          </div>
        ) : null}

        {eligibility.status === 'error' ? (
          <p className="shop-review-gate shop-review-gate--error">{t('eligibilityError')}</p>
        ) : null}

        {eligibility.status === 'eligible' && !message ? (
          <form className="shop-review-form" onSubmit={(e) => void onSubmit(e)}>
            <div
              className="shop-review-rating"
              role="radiogroup"
              aria-label={t('ratingLabel')}
              onMouseLeave={() => setHoverRating(0)}
            >
              {STAR_VALUES.map((n) => {
                const active = n <= displayStars;
                return (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={t('starLabel', { n })}
                    className={`shop-review-star${active ? ' is-active' : ''}`}
                    onMouseEnter={() => setHoverRating(n)}
                    onFocus={() => setHoverRating(n)}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                );
              })}
            </div>

            <label className="shop-review-field">
              <span className="shop-review-field-label">{t('bodyLabel')}</span>
              <textarea
                className="shop-review-textarea"
                rows={4}
                required
                minLength={5}
                maxLength={2000}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('bodyPlaceholder')}
              />
            </label>

            {error ? (
              <p className="shop-review-feedback shop-review-feedback--error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="shop-review-form-actions">
              <Button type="submit" disabled={pending || body.trim().length < 5} loading={pending}>
                {pending ? t('submitting') : t('submit')}
              </Button>
            </div>
          </form>
        ) : null}

        {message ? (
          <p className="shop-review-feedback shop-review-feedback--ok" role="status">
            {message}
          </p>
        ) : null}
      </div>
    </section>
  );
}
