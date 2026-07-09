type ProductAttachmentsFieldProps = {
  attachments?: Array<{ name: string; url: string }> | null;
};

const MAX_ROWS = 5;

export function ProductAttachmentsField({ attachments }: ProductAttachmentsFieldProps) {
  const rows = Array.from({ length: MAX_ROWS }, (_, i) => attachments?.[i] ?? { name: '', url: '' });

  return (
    <fieldset className="product-attachments-fields full-width">
      <legend>数字附件（报告 PDF、说明书链接等，最多 {MAX_ROWS} 个）</legend>
      <p className="muted" style={{ marginBottom: '0.75rem' }}>
        填写可公开访问的 HTTPS 链接；实体商品通常留空。
      </p>
      <div className="product-attachments-grid">
        {rows.map((row, i) => (
          <div key={i} className="product-attachment-row">
            <label>
              名称 {i + 1}
              <input name={`attachment_name_${i}`} defaultValue={row.name} placeholder="完整报告 PDF" />
            </label>
            <label>
              URL {i + 1}
              <input name={`attachment_url_${i}`} type="url" defaultValue={row.url} placeholder="https://..." />
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
