'use client';

type Props = {
  percent: number;
  label?: string;
  error?: string | null;
  success?: string | null;
};

export function UploadProgressBar({ percent, label, error, success }: Props) {
  const clamped = Math.max(0, Math.min(100, percent));
  if (error) {
    return <p className="product-media-upload-status product-media-upload-status--error">{error}</p>;
  }
  if (success) {
    return <p className="product-media-upload-status product-media-upload-status--ok">{success}</p>;
  }
  if (clamped <= 0 && !label) return null;
  return (
    <div className="product-media-progress" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
      {label ? <p className="product-media-progress-label">{label}</p> : null}
      <div className="product-media-progress-track">
        <div className="product-media-progress-fill" style={{ width: `${clamped}%` }} />
      </div>
      <p className="product-media-progress-pct">{clamped}%</p>
    </div>
  );
}
