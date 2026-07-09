import { useTranslations } from 'next-intl';
import { FileDown } from 'lucide-react';

type Attachment = { name: string; url: string };

/** 数字附件下载区（报告 PDF、说明书等） */
export function ProductAttachments({ items }: { items: Attachment[] }) {
  const t = useTranslations('pdp');
  if (!items.length) return null;

  return (
    <section className="shop-pdp-attachments">
      <h2 className="shop-pdp-section-title">{t('attachmentsTitle')}</h2>
      <ul className="shop-pdp-attachment-list">
        {items.map((item) => (
          <li key={item.url}>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shop-pdp-attachment-link"
            >
              <FileDown size={16} strokeWidth={1.8} aria-hidden />
              <span>{item.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
