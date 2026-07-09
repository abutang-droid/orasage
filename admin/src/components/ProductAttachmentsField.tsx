'use client';

import { useRef, useState } from 'react';

type AttachmentRow = { name: string; url: string };

type ProductAttachmentsFieldProps = {
  attachments?: Array<{ name: string; url: string }> | null;
};

const MAX_ROWS = 5;

function AttachmentRowEditor({
  index,
  row,
}: {
  index: number;
  row: AttachmentRow;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const hasExisting = Boolean(row.url?.trim());

  return (
    <div className="product-attachment-row">
      <input type="hidden" name={`attachment_existing_url_${index}`} value={row.url ?? ''} />
      <label>
        名称 {index + 1}
        <input name={`attachment_name_${index}`} defaultValue={row.name} placeholder="完整报告 PDF" />
      </label>
      <div className="product-attachment-url-field">
        <label>
          文件或 URL {index + 1}
          <input
            name={`attachment_url_${index}`}
            type="url"
            defaultValue={row.url}
            placeholder="https://... 或选择文件上传"
            readOnly={Boolean(fileName)}
          />
        </label>
        <input
          ref={inputRef}
          type="file"
          name={`attachment_file_${index}`}
          accept="application/pdf,image/jpeg,image/png,image/webp,.zip,.doc,.docx"
          className="product-media-file-input"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setFileName(file.name);
          }}
        />
        <button type="button" className="btn-secondary btn-secondary--sm" onClick={() => inputRef.current?.click()}>
          {fileName || hasExisting ? '更换文件' : '选择文件'}
        </button>
        {fileName ? <p className="product-media-pending">待保存：{fileName}</p> : null}
      </div>
      {(hasExisting || fileName) && (
        <label className="checkbox-label product-attachment-clear">
          <input type="checkbox" name={`attachment_clear_${index}`} /> 删除此附件
        </label>
      )}
    </div>
  );
}

export function ProductAttachmentsField({ attachments }: ProductAttachmentsFieldProps) {
  const rows = Array.from({ length: MAX_ROWS }, (_, i) => attachments?.[i] ?? { name: '', url: '' });

  return (
    <fieldset className="product-attachments-fields full-width">
      <legend>数字附件（报告 PDF、说明书等，最多 {MAX_ROWS} 个）</legend>
      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        可直接上传文件（保存时上传至 CMS），或填写可公开访问的 HTTPS 链接。
      </p>
      <div className="product-attachments-grid">
        {rows.map((row, i) => (
          <AttachmentRowEditor key={i} index={i} row={row} />
        ))}
      </div>
    </fieldset>
  );
}
