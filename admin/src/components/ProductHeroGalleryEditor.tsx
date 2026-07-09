const HERO_MAX = 6;

export type HeroImageRow = {
  mediaId?: number;
  url?: string | null;
  alt?: string;
  sort?: number;
};

type ProductHeroGalleryEditorProps = {
  rows: HeroImageRow[];
  maxRows?: number;
  newSlotCount?: number;
};

export function ProductHeroGalleryEditor({
  rows,
  maxRows = HERO_MAX,
  newSlotCount,
}: ProductHeroGalleryEditorProps) {
  const heroRows = rows.slice(0, maxRows);
  const slots = newSlotCount ?? Math.min(3, Math.max(1, maxRows - heroRows.length));

  return (
    <div className="hero-image-grid">
      {heroRows.map((row, i) => (
        <div key={`existing-${row.mediaId ?? i}`} className="hero-image-card">
          <input type="hidden" name={`hero_existing_id_${i}`} value={row.mediaId ?? ''} />
          {row.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={row.url} alt={row.alt ?? ''} className="hero-image-thumb" />
          ) : (
            <div className="hero-image-thumb hero-image-thumb--empty">无预览</div>
          )}
          <label>
            替代文字
            <input name={`hero_alt_${i}`} defaultValue={row.alt ?? ''} />
          </label>
          <label>
            排序
            <input name={`hero_sort_${i}`} type="number" defaultValue={row.sort ?? i} />
          </label>
          <label className="checkbox-label hero-image-remove">
            <input type="checkbox" name={`hero_remove_${i}`} /> 删除此图
          </label>
        </div>
      ))}
      {Array.from({ length: slots }, (_, j) => (
        <div key={`new-${j}`} className="hero-image-card hero-image-card--new">
          <div className="hero-image-upload-slot">
            <span className="hero-image-upload-icon">+</span>
            <span>上传图片</span>
          </div>
          <label>
            选择文件
            <input type="file" name={`hero_new_${j}`} accept="image/jpeg,image/png,image/webp,image/gif" />
          </label>
          <label>
            替代文字
            <input name={`hero_new_alt_${j}`} placeholder="商品细节描述" />
          </label>
          <label>
            排序
            <input name={`hero_new_sort_${j}`} type="number" defaultValue={heroRows.length + j} />
          </label>
        </div>
      ))}
    </div>
  );
}

export { HERO_MAX };
