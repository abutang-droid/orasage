type ProductImageFieldProps = {
  imageUrl?: string | null;
};

/** 商品编辑表单内嵌主图上传 */
export function ProductImageField({ imageUrl }: ProductImageFieldProps) {
  return (
    <label className="product-image-field">
      <span className="product-image-field-label">主图</span>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="product-thumb product-thumb--form" width={72} height={72} />
      ) : (
        <span className="muted product-image-missing">尚未上传</span>
      )}
      <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
      <span className="muted product-image-hint">JPG/PNG/WebP，建议 1:1 或 4:5。留空则保持现有主图。</span>
    </label>
  );
}
