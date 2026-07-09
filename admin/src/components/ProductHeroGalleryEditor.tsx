'use client';

import { useEffect, useRef, useState } from 'react';

const HERO_MAX = 6;

export type HeroImageRow = {
  mediaId?: number;
  url?: string | null;
  alt?: string;
  sort?: number;
};

type ExistingRow = HeroImageRow & { key: string };

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
      <input type="hidden" name={`hero_new_sort_${index}`} value={defaultSort} />
    </div>
  );
}

function ExistingHeroCard({
  row,
  index,
  dragIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  row: ExistingRow;
  index: number;
  dragIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (index: number) => void;
  onDragEnd: () => void;
}) {
  const isDragging = dragIndex === index;

  return (
    <div
      className={`hero-image-card hero-image-card--draggable${isDragging ? ' is-dragging' : ''}`}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={() => onDrop(index)}
      onDragEnd={onDragEnd}
    >
      <div className="hero-image-card-head">
        <button type="button" className="hero-image-drag-handle" tabIndex={-1} aria-hidden>
          ⋮⋮
        </button>
        <span className="hero-image-order">第 {index + 1} 张</span>
      </div>
      <input type="hidden" name={`hero_existing_id_${index}`} value={row.mediaId ?? ''} />
      <input type="hidden" name={`hero_sort_${index}`} value={index} />
      {row.url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={row.url} alt={row.alt ?? ''} className="hero-image-thumb" draggable={false} />
      ) : (
        <div className="hero-image-thumb hero-image-thumb--empty">无预览</div>
      )}
      <label>
        替代文字
        <input name={`hero_alt_${index}`} defaultValue={row.alt ?? ''} />
      </label>
      <label className="checkbox-label hero-image-remove">
        <input type="checkbox" name={`hero_remove_${index}`} /> 删除此图
      </label>
    </div>
  );
}

export function ProductHeroGalleryEditor({
  rows,
  maxRows = HERO_MAX,
  newSlotCount,
}: ProductHeroGalleryEditorProps) {
  const [existingRows, setExistingRows] = useState<ExistingRow[]>(() =>
    rows.slice(0, maxRows).map((row, i) => ({
      ...row,
      key: `existing-${row.mediaId ?? i}`,
    })),
  );
  const dragIndexRef = useRef<number | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setExistingRows(
      rows.slice(0, maxRows).map((row, i) => ({
        ...row,
        key: `existing-${row.mediaId ?? i}`,
      })),
    );
  }, [rows, maxRows]);

  const slots = newSlotCount ?? Math.min(3, Math.max(1, maxRows - existingRows.length));

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setExistingRows((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  return (
    <div className="hero-image-editor">
      {existingRows.length > 1 ? (
        <p className="product-media-hint muted hero-image-drag-hint">拖拽卡片调整轮播顺序，保存后生效。</p>
      ) : null}
      <div className="hero-image-grid">
        {existingRows.map((row, i) => (
          <ExistingHeroCard
            key={row.key}
            row={row}
            index={i}
            dragIndex={dragIndex}
            onDragStart={(index) => {
              dragIndexRef.current = index;
              setDragIndex(index);
            }}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(targetIndex) => {
              const from = dragIndexRef.current;
              if (from != null) reorder(from, targetIndex);
              dragIndexRef.current = null;
              setDragIndex(null);
            }}
            onDragEnd={() => {
              dragIndexRef.current = null;
              setDragIndex(null);
            }}
          />
        ))}
        {Array.from({ length: slots }, (_, j) => (
          <HeroNewSlot key={`new-${j}`} index={j} defaultSort={existingRows.length + j} />
        ))}
      </div>
    </div>
  );
}

export { HERO_MAX };
