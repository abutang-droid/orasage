'use client';

import { useFormFields } from '@payloadcms/ui';
import type { UIFieldClientComponent } from 'payload';

export const LegacyHtmlPreview: UIFieldClientComponent = () => {
  const legacyHtml = useFormFields(([fields]) => fields.legacyHtml?.value as string | undefined);

  if (!legacyHtml?.trim()) {
    return (
      <div
        style={{
          padding: '12px 16px',
          borderRadius: 6,
          background: 'var(--theme-elevation-100)',
          color: 'var(--theme-elevation-600)',
          fontSize: 14,
        }}
      >
        暂无迁移原文。若从 c2.pub 导入，正文会显示在下方「原始 HTML」字段。
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          marginBottom: 8,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--theme-elevation-800)',
        }}
      >
        原文预览（WordPress 导入）
      </div>
      <div
        style={{
          border: '1px solid var(--theme-elevation-200)',
          borderRadius: 6,
          padding: 16,
          maxHeight: 480,
          overflow: 'auto',
          background: 'var(--theme-elevation-0)',
        }}
        className="legacy-html-preview"
        dangerouslySetInnerHTML={{ __html: legacyHtml }}
      />
      <style>{`
        .legacy-html-preview img { max-width: 100%; height: auto; }
        .legacy-html-preview table { max-width: 100%; overflow-x: auto; display: block; }
      `}</style>
    </div>
  );
};
