import { cmsProductImageAdminUrl, cmsProductImageCreateUrl } from '@/lib/cms-product-images';

type ProductImageCellProps = {
  sku: string;
  imageUrl?: string | null;
};

export function ProductImageCell({ sku, imageUrl }: ProductImageCellProps) {
  if (imageUrl) {
    return (
      <div className="product-image-cell">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" width={48} height={48} className="product-thumb" />
        <a href={cmsProductImageAdminUrl(sku)} className="muted product-image-link">
          更换主图
        </a>
      </div>
    );
  }

  return (
    <a href={cmsProductImageCreateUrl(sku)} className="btn-small">
      上传主图
    </a>
  );
}
