'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { persistProductVideoAction } from '@/app/content-actions';
import { formatBytes, uploadMediaWithProgress } from '@/lib/client-media-upload';
import { UploadProgressBar } from './UploadProgressBar';

type ProductVideoUploadFieldProps = {
  /** form field prefix, e.g. galleryVideo → galleryVideoFile / galleryVideoUrl / galleryVideoClear */
  name: 'galleryVideo' | 'sceneVideo' | string;
  label: string;
  description?: string;
  currentUrl?: string | null;
  /** When set, upload + persist immediately (no wait for page-level save). */
  sku?: string;
  locale?: string;
};

export function ProductVideoUploadField({
  name,
  label,
  description,
  currentUrl,
  sku,
  locale = 'zh-CN',
}: ProductVideoUploadFieldProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(currentUrl?.trim() || null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'saving' | 'done' | 'error'>('idle');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const immediate = Boolean(sku);
  const field = name === 'sceneVideo' ? 'sceneVideo' : 'galleryVideo';

  useEffect(() => {
    setSavedUrl(currentUrl?.trim() || null);
    setCleared(false);
    setPhase('idle');
    setStatusMsg(null);
    setError(null);
  }, [currentUrl]);

  // Revoke object URLs when preview changes; abort in-flight upload only on unmount.
  // (Abort must NOT run on previewUrl change — that fires right after select and kills the upload.)
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const displayUrl = cleared ? null : (previewUrl ?? savedUrl ?? null);
  const hasExisting = Boolean(savedUrl);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setCleared(false);
    setError(null);
    setStatusMsg(null);

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
          `${sku} ${label}`,
          (p) => setPercent(p.percent),
          controller.signal,
        );
        setPhase('saving');
        setStatusMsg('正在写入商品详情…');
        const result = await persistProductVideoAction({
          sku,
          locale,
          field,
          url: uploaded.publicUrl,
        });
        if (!result.ok) throw new Error(result.error);
        setSavedUrl(uploaded.publicUrl);
        setPhase('done');
        setStatusMsg(`已保存 · ${file.name}（${formatBytes(file.size)}）`);
        setPercent(100);
        // Drop file input so page-level submit won't re-upload.
        if (inputRef.current) inputRef.current.value = '';
        router.refresh();
      } catch (err) {
        if (controller.signal.aborted) return;
        setPhase('error');
        setError(err instanceof Error ? err.message : '上传失败');
        setStatusMsg(null);
      }
    })();
  };

  const onClearChange = (checked: boolean) => {
    setCleared(checked);
    if (!checked) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setFileName(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = '';

    if (!immediate || !sku) {
      setPhase('idle');
      return;
    }

    setPhase('saving');
    setStatusMsg('正在清除视频…');
    void persistProductVideoAction({ sku, locale, field, url: null }).then((result) => {
      if (!result.ok) {
        setPhase('error');
        setError(result.error);
        setStatusMsg(null);
        return;
      }
      setSavedUrl(null);
      setPhase('done');
      setStatusMsg('已清除并保存');
      router.refresh();
    });
  };

  return (
    <div className="product-video-upload">
      <span className="product-video-upload-label">{label}</span>
      {description ? <p className="product-media-hint muted">{description}</p> : null}
      {!cleared && savedUrl ? (
        <input type="hidden" name={`${name}Url`} value={savedUrl} />
      ) : null}

      <button
        type="button"
        className={`product-video-preview${displayUrl ? '' : ' product-video-preview--empty'}`}
        onClick={() => inputRef.current?.click()}
        disabled={phase === 'uploading' || phase === 'saving'}
      >
        {displayUrl ? (
          <video src={displayUrl} controls className="product-video-player" />
        ) : (
          <div className="product-video-empty">
            <span className="hero-image-upload-icon">+</span>
            <span>点击上传视频</span>
          </div>
        )}
      </button>

      {phase === 'uploading' || phase === 'saving' ? (
        <UploadProgressBar
          percent={phase === 'saving' ? 100 : percent}
          label={
            phase === 'saving'
              ? '上传完成，正在保存…'
              : `上传中… ${fileName ?? ''}`
          }
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
          <p className="product-media-hint muted">支持 MP4 / WebM / MOV</p>
        )
      ) : null}
      {phase === 'idle' && immediate && !statusMsg ? (
        <p className="product-media-hint muted">选择后立即上传并保存 · MP4 / WebM / MOV</p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        name={immediate ? undefined : `${name}File`}
        accept="video/mp4,video/webm,video/quicktime"
        className="product-media-file-input"
        onChange={onFileChange}
      />

      <div className="product-video-upload-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => inputRef.current?.click()}
          disabled={phase === 'uploading' || phase === 'saving'}
        >
          {displayUrl ? '更换视频' : '选择视频'}
        </button>
        {(hasExisting || fileName) && (
          <label className="checkbox-label product-video-clear">
            <input
              type="checkbox"
              name={immediate ? undefined : `${name}Clear`}
              checked={cleared}
              onChange={(e) => onClearChange(e.target.checked)}
              disabled={phase === 'uploading' || phase === 'saving'}
            />
            删除视频
          </label>
        )}
      </div>
    </div>
  );
}
