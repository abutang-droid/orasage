import {
  cmsProductPageEditUrl,
  cmsProductTestimonialsUrl,
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
        title="CMS 商品详情页"
      >
        详情：{productPageStatusLabel(pageStatus)}
      </span>
      <a href={cmsProductPageEditUrl(sku)} target="_blank" rel="noreferrer" className="admin-cms-link">
        编辑详情
      </a>
      <a
        href={cmsProductTestimonialsUrl(sku)}
        target="_blank"
        rel="noreferrer"
        className="admin-cms-link"
      >
        精选评价
      </a>
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
