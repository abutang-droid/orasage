'use client';

import { useEffect, useState } from 'react';
import { localeLabel } from '@orasage/i18n';
import { pickLabel, SHELL_LABELS } from './labels';

const QUERY_KEY = 'langUnavailable';

export type LocaleFallbackNoticeProps = {
  /** Active UI locale (phase-1). */
  locale?: string;
  className?: string;
};

/**
 * Soft banner when a bookmarked / deep-linked locale is not live yet
 * (phase 1: zh-CN / en / pt-BR). Triggered by `?langUnavailable=<code>`
 * from main middleware deprecated-locale redirects.
 */
export function LocaleFallbackNotice({
  locale = 'zh-CN',
  className = '',
}: LocaleFallbackNoticeProps) {
  const [requested, setRequested] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const code = url.searchParams.get(QUERY_KEY);
    if (!code) return;
    setRequested(code);
    url.searchParams.delete(QUERY_KEY);
    window.history.replaceState({}, '', url.toString());
  }, []);

  if (!requested) return null;

  // localeLabel covers phase-1 + FUTURE_LOCALE_LABELS (avoid named re-export
  // issues under Next's package resolution for @orasage/i18n).
  const requestedLabel = localeLabel(requested, requested);
  const activeLabel = localeLabel(locale);
  const template = pickLabel(SHELL_LABELS.localeUnavailable, locale);
  const message = template
    .replace('{requested}', requestedLabel)
    .replace('{active}', activeLabel);

  return (
    <div
      className={`orasage-locale-fallback-notice${className ? ` ${className}` : ''}`}
      role="status"
    >
      <p>{message}</p>
      <button
        type="button"
        className="orasage-locale-fallback-dismiss"
        onClick={() => setRequested(null)}
        aria-label={pickLabel(SHELL_LABELS.localeUnavailableDismiss, locale)}
      >
        {pickLabel(SHELL_LABELS.localeUnavailableDismiss, locale)}
      </button>
    </div>
  );
}
