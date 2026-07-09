'use client';

import { useEffect, useRef, useState } from 'react';

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

function HeroNewSlot({ index, defaultSort }: { index: number; defaultSort: number }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  };

  return (
    <div className="hero-image-card hero-image-card--new">
      <button
        type="button"
        className="hero-image-upload-slot hero-image-upload-slot--clickable"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="hero-image-thumb hero-image-thumb--in-slot" />
        ) : (
          <>
            <span className="hero-image-upload-icon">+</span>
            <span>点击上传图片</span>
          </>
        )}
      </button>
      {fileName ? (
        <p className="product-media-pending">待保存：{fileName}</p>
      ) : (
        <p className="product-media-hint muted">支持 JPG / PNG / WebP / GIF</p>
      )}
      <input
        ref={inputRef}
        type="file"
        name={`hero_new_${index}`}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="product-media-file-input"
        onChange={onFileChange}
      />
      <label>
        替代文字
        <input name={`hero_new_alt_${index}`} placeholder="商品细节描述" />
      </label>
      <label>
        排序
        <input name={`hero_new_sort_${index}`} type="number" defaultValue={defaultSort} />
      </label>
    </div>
  );
}

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
        <HeroNewSlot key={`new-${j}`} index={j} defaultSort={heroRows.length + j} />
      ))}
    </div>
  );
}

export { HERO_MAX };
