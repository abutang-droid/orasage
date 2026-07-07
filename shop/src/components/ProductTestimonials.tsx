import Image from 'next/image';
import type { ProductTestimonial } from '@/lib/cms-product-testimonials';
import { averageTestimonialRating } from '@/lib/cms-product-testimonials';

export function ProductTestimonials({ items }: { items: ProductTestimonial[] }) {
  if (!items.length) return null;

  const average = averageTestimonialRating(items);

  return (
    <section className="shop-pdp-section shop-pdp-testimonials" aria-labelledby="shop-pdp-testimonials-title">
      <div className="shop-pdp-testimonials-head">
        <h2 id="shop-pdp-testimonials-title" className="shop-pdp-section-title">
          精选评价
        </h2>
        <span className="shop-pdp-testimonials-badge">运营精选</span>
        {average != null ? (
          <p className="shop-pdp-testimonials-avg" aria-label={`平均 ${average} 星`}>
            {'★'.repeat(Math.round(average))}
            <span className="shop-pdp-testimonials-avg-num">{average.toFixed(1)}</span>
          </p>
        ) : null}
      </div>
      <ul className="shop-pdp-testimonials-list">
        {items.map((item) => (
          <li key={item.id} className="shop-pdp-testimonial-card">
            <div className="shop-pdp-testimonial-meta">
              {item.avatarUrl ? (
                <span className="shop-pdp-testimonial-avatar">
                  <Image src={item.avatarUrl} alt="" width={36} height={36} />
                </span>
              ) : (
                <span className="shop-pdp-testimonial-avatar shop-pdp-testimonial-avatar--fallback" aria-hidden>
                  {item.author.slice(0, 1)}
                </span>
              )}
              <div>
                <p className="shop-pdp-testimonial-author">{item.author}</p>
                <p className="shop-pdp-testimonial-stars" aria-label={`${item.rating} 星`}>
                  {'★'.repeat(item.rating)}
                  {'☆'.repeat(5 - item.rating)}
                </p>
              </div>
            </div>
            <p className="shop-pdp-testimonial-body">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
