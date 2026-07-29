import Link from 'next/link';
import {
  productPageStatusLabel,
  type ProductPageStatus,
} from '@/lib/cms-product-pages';

export function ProductCmsLinks({
  sku,
  pageStatus,
}: {
  sku: string;
  pageStatus: ProductPageStatus;
}) {
  return (
    <div className="admin-product-cms-links">
      <span
        className={`badge${pageStatus === 'published' ? ' ok' : pageStatus === 'draft' ? '' : ' off'}`}
        title="商品详情页"
      >
        详情：{productPageStatusLabel(pageStatus)}
      </span>
      <Link href={`/content/products/${encodeURIComponent(sku)}`} className="admin-cms-link">
        内容（PDP / 精选评价）
      </Link>
      <a
        href={`https://shop.orasage.com/product/${encodeURIComponent(sku)}`}
        target="_blank"
        rel="noreferrer"
        className="admin-cms-link"
      >
        预览
      </a>
    </div>
  );
}
