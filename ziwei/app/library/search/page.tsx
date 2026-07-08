/**
 * /library/search?q=xxx — 搜索结果页
 */

import Link from 'next/link';
import { ScrollText } from 'lucide-react';
import { Card } from '@orasage/ui/card';
import { searchClassics, getParagraphById } from '@/lib/classics';

export const metadata = {
  title: '搜索 · 古籍原典库',
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim() || '';
  const hits = q ? searchClassics(q, 50) : [];

  return (
    <div style={{ background: 'var(--bg-page)' }}>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div style={{ fontSize: '13px', color: 'var(--tx-3)', letterSpacing: '0.15em', marginBottom: '4px' }}>
            搜索关键词
          </div>
          <h1 style={{ fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.1em' }}>
            「{q || '（空）'}」
          </h1>
          <div style={{ fontSize: '12px', color: 'var(--tx-3)', marginTop: '8px' }}>
            共找到 <strong style={{ color: 'var(--ac)' }}>{hits.length}</strong> 条古籍原文匹配
          </div>
        </div>

        {hits.length === 0 ? (
          <Card
            className="rounded-xl border-[rgba(184,146,42,0.15)] px-5 py-10 text-center shadow-none"
            style={{ background: 'var(--bg-card)', color: 'var(--tx-2)' }}
          >
            <ScrollText size={40} strokeWidth={1.5} style={{ marginBottom: '12px', opacity: 0.4 }} aria-hidden />
            {q ? (
              <>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>暂未在已收录古籍中找到这个关键词</div>
                <div style={{ fontSize: '11px', color: 'var(--tx-3)', lineHeight: 1.7 }}>
                  我们持续补充内容中。可尝试搜索：<br />
                  <span style={{ color: 'var(--ac)' }}>七杀朝斗 / 双禄朝垣 / 化忌 / 紫微 / 命宫 / 机月同梁</span>
                </div>
              </>
            ) : (
              <div style={{ fontSize: '13px' }}>请输入要搜索的关键词</div>
            )}
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {hits.map((hit, i) => {
              const ctx = getParagraphById(hit.paragraphId);
              const chapterIdx = ctx?.chapterIdx ?? 0;
              return (
                <Card
                  key={i}
                  variant="interactive"
                  asChild
                  className="rounded-[10px] border-[rgba(184,146,42,0.18)] px-5 py-4 shadow-none transition-[border-color]"
                  style={{ background: 'var(--bg-card)' }}
                >
                <Link
                  href={`/library/${hit.bookSlug}/${chapterIdx}#${hit.paragraphId}`}
                  style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '11px',
                    color: 'var(--tx-3)',
                    marginBottom: '8px',
                    letterSpacing: '0.1em',
                  }}>
                    <span style={{ color: 'var(--ac)', fontWeight: 600 }}>《{hit.bookTitle}》</span>
                    <span style={{ opacity: 0.5 }}>·</span>
                    <span>{hit.chapterTitle}</span>
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: 'var(--tx-0)',
                      lineHeight: 1.9,
                      letterSpacing: '0.02em',
                    }}
                    dangerouslySetInnerHTML={{ __html: hit.snippet }}
                  />
                </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        mark { background: rgba(184,146,42,0.3); color: #8b6a14; padding: 0 2px; border-radius: 2px; font-weight: 600; }
      `}</style>
    </div>
  );
}
