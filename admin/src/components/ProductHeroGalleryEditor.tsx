'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { persistHeroImageAppendAction } from '@/app/content-actions';
import { formatBytes, uploadMediaWithProgress } from '@/lib/client-media-upload';
import { UploadProgressBar } from './UploadProgressBar';

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
  /** When set with locale, each new image uploads and saves immediately. */
  sku?: string;
  locale?: string;
  onHeroCountChange?: (count: number) => void;
};

function HeroNewSlot({
  index,
  defaultSort,
  sku,
  locale,
  onAppended,
  disabled,
}: {
  index: number;
  defaultSort: number;
  sku?: string;
  locale: string;
  onAppended?: (row: HeroImageRow) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const immediate = Boolean(sku);
  const router = useRouter();

  // Revoke object URLs when preview changes; abort in-flight upload only on unmount.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setError(null);
    setStatusMsg(null);
    setMediaId(null);

    if (!immediate || !sku) {
      setPhase('idle');
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setPhase('uploading');
    setPercent(0);

    void (async () => {
      try {
        const uploaded = await uploadMediaWithProgress(
          file,
          `${sku} 详情图`,
          (p) => setPercent(p.percent),
          controller.signal,
        );
        setMediaId(uploaded.id);
        setPhase('saving');
        setStatusMsg('正在写入轮播图…');
        const altInput = document.querySelector<HTMLInputElement>(
          `input[name="hero_new_alt_${index}"]`,
        );
        const alt = altInput?.value?.trim() || '';
        const result = await persistHeroImageAppendAction({
          sku,
          locale,
          mediaId: uploaded.id,
          alt,
        });
        if (!result.ok) throw new Error(result.error);
        setPhase('done');
        setStatusMsg(`已保存 · ${file.name}（${formatBytes(file.size)}）`);
        onAppended?.({
          mediaId: uploaded.id,
          url: uploaded.publicUrl,
          alt: alt || undefined,
          sort: defaultSort,
        });
        router.refresh();
        // Reset slot for next upload
        setTimeout(() => {
          setPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setFileName(null);
          setMediaId(null);
          setPhase('idle');
          setStatusMsg(null);
          setPercent(0);
          if (inputRef.current) inputRef.current.value = '';
        }, 600);
      } catch (err) {
        if (controller.signal.aborted) return;
        setPhase('error');
        setError(err instanceof Error ? err.message : '上传失败');
        setStatusMsg(null);
      }
    })();
  };

  return (
    <div className="hero-image-card hero-image-card--new">
      <button
        type="button"
        className="hero-image-upload-slot hero-image-upload-slot--clickable"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || phase === 'uploading' || phase === 'saving'}
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
      {phase === 'uploading' || phase === 'saving' ? (
        <UploadProgressBar
          percent={phase === 'saving' ? 100 : percent}
          label={phase === 'saving' ? '上传完成，正在保存…' : `上传中… ${fileName ?? ''}`}
        />
      ) : null}
      {phase === 'done' && statusMsg ? (
        <UploadProgressBar percent={100} success={statusMsg} />
      ) : null}
      {phase === 'error' && error ? (
        <UploadProgressBar percent={percent} error={error} />
      ) : null}
      {phase === 'idle' && !immediate ? (
        fileName ? (
          <p className="product-media-pending">待保存：{fileName}</p>
        ) : (
          <p className="product-media-hint muted">支持 JPG / PNG / WebP / GIF</p>
        )
      ) : null}
      {phase === 'idle' && immediate && !statusMsg ? (
        <p className="product-media-hint muted">选择后立即上传并保存</p>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        name={immediate ? undefined : `hero_new_${index}`}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="product-media-file-input"
        onChange={onFileChange}
        disabled={disabled}
      />
      {mediaId && !immediate ? (
        <input type="hidden" name={`hero_new_media_id_${index}`} value={mediaId} />
      ) : null}
      <label>
        替代文字
        <input name={`hero_new_alt_${index}`} placeholder="商品细节描述" disabled={disabled} />
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
  sku,
  locale = 'zh-CN',
  onHeroCountChange,
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

  useEffect(() => {
    onHeroCountChange?.(existingRows.length);
  }, [existingRows.length, onHeroCountChange]);

  const slots = newSlotCount ?? Math.min(3, Math.max(0, maxRows - existingRows.length));
  // Keep at least one empty slot when under max (for immediate upload UX).
  const emptySlots = existingRows.length >= maxRows
    ? 0
    : Math.max(slots > 0 ? slots : 1, 1);

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
        <p className="product-media-hint muted hero-image-drag-hint">
          {sku
            ? '新图选择后立即上传保存；拖拽调整顺序后需点页面「保存」生效。'
            : '拖拽卡片调整轮播顺序，保存后生效。'}
        </p>
      ) : sku ? (
        <p className="product-media-hint muted hero-image-drag-hint">
          选择图片后立即上传并保存到详情页，无需等整页保存。
        </p>
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
        {Array.from({ length: emptySlots }, (_, j) => (
          <HeroNewSlot
            key={`new-${j}-${existingRows.length}`}
            index={j}
            defaultSort={existingRows.length + j}
            sku={sku}
            locale={locale}
            disabled={existingRows.length >= maxRows}
            onAppended={(row) => {
              setExistingRows((prev) => {
                if (prev.length >= maxRows) return prev;
                if (prev.some((r) => r.mediaId === row.mediaId)) return prev;
                return [
                  ...prev,
                  {
                    ...row,
                    key: `existing-${row.mediaId}-${Date.now()}`,
                  },
                ];
              });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { HERO_MAX };
