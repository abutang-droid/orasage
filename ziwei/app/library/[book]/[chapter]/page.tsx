/**
 * /library/[book]/[chapter] — 单章节阅读页
 */

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card } from '@orasage/ui/card';
import { ALL_BOOKS, getChapter } from '@/lib/classics';

export async function generateStaticParams() {
  return ALL_BOOKS.flatMap(b =>
    b.chapters.map((_, i) => ({ book: b.slug, chapter: String(i) }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book: bookSlug, chapter: chIdx } = await params;
  const result = getChapter(bookSlug, parseInt(chIdx));
  if (!result) return {};
  return {
    title: `${result.chapter.title} · 《${result.book.title}》· 紫微斗数古籍`,
    description: result.chapter.subtitle || `《${result.book.title}》${result.chapter.title}原文`,
  };
}

export default async function ChapterPage({ params }: { params: Promise<{ book: string; chapter: string }> }) {
  const { book: bookSlug, chapter: chIdx } = await params;
  const result = getChapter(bookSlug, parseInt(chIdx));
  if (!result) notFound();

  const { book, chapter, chapterIdx } = result;
  const prevIdx = chapterIdx - 1;
  const nextIdx = chapterIdx + 1;

  return (
    <div style={{ background: 'var(--bg-page)' }}>

      <article className="max-w-3xl mx-auto px-6 py-12">
        {/* 标题 */}
        <div className="text-center mb-10">
          <div style={{ fontSize: '11px', color: 'var(--tx-3)', letterSpacing: '0.25em', marginBottom: '8px' }}>
            《{book.title}》· {book.dynasty}
          </div>
          <h1 style={{ fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 700, color: 'var(--tx-0)', letterSpacing: '0.15em', marginBottom: '8px' }}>
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <div style={{ fontSize: '13px', color: 'var(--tx-2)', letterSpacing: '0.1em' }}>
              {chapter.subtitle}
            </div>
          )}
        </div>

        {/* 段落 */}
        <Card
          className="rounded-[14px] border-[rgba(184,146,42,0.2)] p-[32px_28px] shadow-none"
          style={{ background: 'var(--bg-card)' }}
        >
          {chapter.paragraphs.map((p, i) => (
            <div
              key={p.id}
              id={p.id}
              style={{
                marginBottom: i === chapter.paragraphs.length - 1 ? 0 : '20px',
                paddingBottom: i === chapter.paragraphs.length - 1 ? 0 : '20px',
                borderBottom: i === chapter.paragraphs.length - 1 ? 'none' : '1px dashed rgba(184,146,42,0.15)',
                scrollMarginTop: '80px',
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '12px',
              }}>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--ac)',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  minWidth: '24px',
                }}>
                  {String(p.idx).padStart(2, '0')}
                </span>
                <p style={{
                  flex: 1,
                  fontSize: '16px',
                  color: 'var(--tx-0)',
                  lineHeight: 2,
                  letterSpacing: '0.04em',
                  fontFamily: '"PingFang SC", "Hiragino Sans GB", serif',
                }}>
                  {p.text}
                </p>
              </div>
              {p.translation && (
                <div style={{
                  marginTop: '8px',
                  marginLeft: '36px',
                  padding: '8px 12px',
                  background: 'rgba(184,146,42,0.05)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'var(--tx-2)',
                  lineHeight: 1.8,
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--ac)', marginRight: '6px' }}>白话</span>
                  {p.translation}
                </div>
              )}
              {p.niNote && (
                <div style={{
                  marginTop: '8px',
                  marginLeft: '36px',
                  padding: '8px 12px',
                  background: 'rgba(196,90,45,0.05)',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: 'var(--tx-2)',
                  lineHeight: 1.8,
                }}>
                  <span style={{ fontSize: '10px', color: 'var(--ji)', marginRight: '6px' }}>倪师注</span>
                  {p.niNote}
                </div>
              )}
            </div>
          ))}
        </Card>

        {/* 章节导航 */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          {prevIdx >= 0 ? (
            <Card
              variant="interactive"
              asChild
              className="flex-1 rounded-[10px] border-[rgba(184,146,42,0.2)] p-[14px_18px] shadow-none"
              style={{ background: 'var(--bg-card)' }}
            >
              <Link href={`/library/${book.slug}/${prevIdx}`} style={{ textDecoration: 'none', color: 'var(--tx-0)' }}>
                <div style={{ fontSize: '10px', color: 'var(--tx-3)', letterSpacing: '0.2em', marginBottom: '2px' }}>← 上一章</div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{book.chapters[prevIdx].title}</div>
              </Link>
            </Card>
          ) : <div style={{ flex: 1 }} />}
          {nextIdx < book.chapters.length ? (
            <Card
              variant="interactive"
              asChild
              className="flex-1 rounded-[10px] border-[rgba(184,146,42,0.2)] p-[14px_18px] text-right shadow-none"
              style={{ background: 'var(--bg-card)' }}
            >
              <Link href={`/library/${book.slug}/${nextIdx}`} style={{ textDecoration: 'none', color: 'var(--tx-0)' }}>
                <div style={{ fontSize: '10px', color: 'var(--tx-3)', letterSpacing: '0.2em', marginBottom: '2px' }}>下一章 →</div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{book.chapters[nextIdx].title}</div>
              </Link>
            </Card>
          ) : <div style={{ flex: 1 }} />}
        </div>
      </article>
    </div>
  );
}
