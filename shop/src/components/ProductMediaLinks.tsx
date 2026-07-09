import { useTranslations } from 'next-intl';
import { ExternalLink } from 'lucide-react';
import type { ProductLink } from '@/lib/product-links';

/** R5：媒体与用户报道区块（站内文章/站外媒体/用户测评） */
export function ProductMediaLinks({ items }: { items: ProductLink[] }) {
  const t = useTranslations('pdp');
  if (!items.length) return null;

  return (
    <section className="shop-pdp-media-links">
      <h2 className="shop-pdp-section-title">{t('mediaLinksTitle')}</h2>
      <ul className="shop-pdp-media-link-list">
        {items.map((item) => {
          const external = item.kind === 'media' || item.kind === 'review';
          return (
            <li key={`${item.id}-${item.url}`}>
              <a
                href={item.url}
                target="_blank"
                rel={external ? 'noopener nofollow' : 'noopener'}
                className="shop-pdp-media-link"
              >
                <span className="shop-pdp-media-link-kind">{t(`linkKind.${item.kind}`)}</span>
                <span className="shop-pdp-media-link-title">{item.title}</span>
                {item.sourceName ? (
                  <span className="shop-pdp-media-link-source">{item.sourceName}</span>
                ) : null}
                <ExternalLink size={14} strokeWidth={1.8} aria-hidden />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
