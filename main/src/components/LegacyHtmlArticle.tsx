import type { ReactNode } from 'react';
import { decodeHtmlEntities, sanitizeLegacyHtml } from '@/lib/cms';

type Props = {
  html: string;
  className?: string;
};

/** 渲染 CMS legacyHtml 正文，适配主站阅读样式 */
export function LegacyHtmlArticle({ html, className = '' }: Props) {
  const clean = sanitizeLegacyHtml(html);
  return (
    <article
      className={`legacy-html-article prose-sage break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}

export function ArticleTitle({ children }: { children: ReactNode }) {
  const text = typeof children === 'string' ? decodeHtmlEntities(children) : children;
  return <>{text}</>;
}
