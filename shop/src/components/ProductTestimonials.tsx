import { getTranslations } from 'next-intl/server';
import type { ProductTestimonial } from '@/lib/cms-product-testimonials';

export async function ProductTestimonials({ items }: { items: ProductTestimonial[] }) {
  if (!items.length) return null;
  const t = await getTranslations('pdp');

  return (
    <section className="shop-pdp-voices" aria-labelledby="shop-pdp-voices-title">
      <h2 id="shop-pdp-voices-title" className="shop-pdp-passage-heading">
        {t('voicesTitle')}
      </h2>
      <ul className="shop-pdp-voice-list">
        {items.map((item) => (
          <li key={item.id} className="shop-pdp-voice">
            <p className="shop-pdp-voice-body">{item.body}</p>
            <p className="shop-pdp-voice-meta">
              <span className="shop-pdp-voice-stars" aria-label={t('starsAria', { rating: item.rating })}>
                {'★'.repeat(item.rating)}
              </span>
              <span className="shop-pdp-voice-author">{item.author}</span>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
