import { getTranslations } from 'next-intl/server';
import { freeShippingThresholdUsd } from '../../../shared/shop-fulfillment/index';

type TrustBarProps = {
  locale: string;
};

function formatThreshold(locale: string, thresholdUsd: number): string {
  if (locale.startsWith('zh')) {
    return `$${thresholdUsd.toFixed(2)}`;
  }
  return `$${thresholdUsd.toFixed(2)}`;
}

export async function TrustBar({ locale }: TrustBarProps) {
  const t = await getTranslations('pdp.trustBar');
  const threshold = formatThreshold(locale, freeShippingThresholdUsd());
  const items = [
    { icon: '✓', text: t('authentic') },
    { icon: '↺', text: t('returns') },
    { icon: '🚚', text: t('freeShipping', { threshold }) },
  ];

  return (
    <ul className="shop-trust-bar" aria-label={t('ariaLabel')}>
      {items.map((it, i) => (
        <li key={i}>
          <span aria-hidden="true">{it.icon}</span> {it.text}
        </li>
      ))}
    </ul>
  );
}
