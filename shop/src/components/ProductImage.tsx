import Image from 'next/image';
import type { ProductCategory } from '@/lib/products';
import { fallbackProductImageUrl } from '@/lib/cms-product-images';

type ProductImageProps = {
  sku: string;
  name: string;
  category?: ProductCategory;
  imageUrl?: string | null;
  className?: string;
  priority?: boolean;
  /** Responsive sizes hint — feature vs thumb slots differ (SHOP S07). */
  sizes?: string;
};

export function ProductImage({
  sku,
  name,
  category,
  imageUrl,
  className = '',
  priority = false,
  sizes = '(max-width: 640px) 50vw, 25vw',
}: ProductImageProps) {
  const src = imageUrl || fallbackProductImageUrl(sku, category);

  return (
    <div className={`shop-product-image-wrap ${className}`.trim()}>
      <Image
        src={src}
        alt={name}
        fill
        sizes={sizes}
        className="shop-product-image"
        priority={priority}
      />
    </div>
  );
}
