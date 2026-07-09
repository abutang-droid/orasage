type ProductImageFieldProps = {
  imageUrl?: string | null;
};

/** 商品编辑表单内嵌主图上传（新增商品用） */
export function ProductImageField({ imageUrl }: ProductImageFieldProps) {
  return (
    <div className="product-image-field product-image-field--card">
      <span className="product-image-field-label">列表主图（可选）</span>
      <div className="product-catalog-image-preview product-catalog-image-preview--compact">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="product-catalog-image-img" />
        ) : (
          <div className="product-catalog-image-empty">保存后可上传更多图片</div>
        )}
      </div>
      <input type="file" name="image" accept="image/jpeg,image/png,image/webp,image/gif" />
      <span className="muted product-image-hint">JPG/PNG/WebP，建议 1:1 或 4:5。也可保存后在编辑页「媒体资源」上传。</span>
    </div>
  );
}
