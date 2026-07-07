import type { ProductTestimonial } from '@/lib/cms-product-testimonials';

export function ProductTestimonials({ items }: { items: ProductTestimonial[] }) {
  if (!items.length) return null;

  return (
    <section className="shop-pdp-voices" aria-labelledby="shop-pdp-voices-title">
      <h2 id="shop-pdp-voices-title" className="shop-pdp-passage-heading">
        佩戴者的声音
      </h2>
      <ul className="shop-pdp-voice-list">
        {items.map((item) => (
          <li key={item.id} className="shop-pdp-voice">
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
    </section>
  );
}
