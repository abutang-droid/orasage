import Image from 'next/image';
import type { ProductCategory } from '@/lib/products';
import { fallbackProductImageUrl } from '@/lib/cms-product-images';
import { isCmsMediaUrl } from '@/lib/cms-media';

type ProductImageProps = {
  sku: string;
  name: string;
  category?: ProductCategory;
  imageUrl?: string | null;
  className?: string;
  /** Override Next/Image `sizes` (defaults assume single-column catalog). */
  sizes?: string;
  priority?: boolean;
};

export function ProductImage({
  sku,
  name,
  category,
  imageUrl,
  className = '',
  sizes = '(max-width: 640px) 92vw, 28rem',
  priority = false,
}: ProductImageProps) {
  const src = imageUrl || fallbackProductImageUrl(sku, category);
  // CMS media: skip Next optimizer (remote host + writable .next/cache/images required).
  // Avoids blank tiles when image optimization fails in production.
  const unoptimized = isCmsMediaUrl(src) || src.startsWith('http://') || src.startsWith('https://');

  return (
    <div className={`shop-product-image-wrap ${className}`.trim()}>
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className="shop-product-image"
        priority={priority}
        unoptimized={unoptimized}
      />
    </div>
  );
}
