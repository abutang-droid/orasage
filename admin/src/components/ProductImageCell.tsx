type ProductImageCellProps = {
  imageUrl?: string | null;
};

/** 商品列表主图预览（上传在编辑表单内完成） */
export function ProductImageCell({ imageUrl }: ProductImageCellProps) {
  if (imageUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={imageUrl} alt="" width={48} height={48} className="product-thumb" />
    );
  }

  return <span className="muted product-image-missing">—</span>;
}
