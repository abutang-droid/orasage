'use client';

import { useEffect, useRef, useState } from 'react';

type ProductVideoUploadFieldProps = {
  /** form field prefix, e.g. galleryVideo → galleryVideoFile / galleryVideoUrl / galleryVideoClear */
  name: string;
  label: string;
  description?: string;
  currentUrl?: string | null;
};

export function ProductVideoUploadField({
  name,
  label,
  description,
  currentUrl,
}: ProductVideoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const displayUrl = cleared ? null : (previewUrl ?? currentUrl ?? null);
  const hasExisting = Boolean(currentUrl?.trim());

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setFileName(file.name);
    setCleared(false);
  };

  const onClearChange = (checked: boolean) => {
    setCleared(checked);
    if (checked) {
      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      setFileName(null);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="product-video-upload">
      <span className="product-video-upload-label">{label}</span>
      {description ? <p className="product-media-hint muted">{description}</p> : null}
      {!cleared && hasExisting && !fileName ? (
        <input type="hidden" name={`${name}Url`} value={currentUrl ?? ''} />
      ) : null}

      <button
        type="button"
        className={`product-video-preview${displayUrl ? '' : ' product-video-preview--empty'}`}
        onClick={() => inputRef.current?.click()}
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

      {fileName ? (
        <p className="product-media-pending">待保存：{fileName}</p>
      ) : (
        <p className="product-media-hint muted">支持 MP4 / WebM / MOV</p>
      )}

      <input
        ref={inputRef}
        type="file"
        name={`${name}File`}
        accept="video/mp4,video/webm,video/quicktime"
        className="product-media-file-input"
        onChange={onFileChange}
      />

      <div className="product-video-upload-actions">
        <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()}>
          {displayUrl ? '更换视频' : '选择视频'}
        </button>
        {(hasExisting || fileName) && (
          <label className="checkbox-label product-video-clear">
            <input
              type="checkbox"
              name={`${name}Clear`}
              checked={cleared}
              onChange={(e) => onClearChange(e.target.checked)}
            />
            删除视频
          </label>
        )}
      </div>
    </div>
  );
}
