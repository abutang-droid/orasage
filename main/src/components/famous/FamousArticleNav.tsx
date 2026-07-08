import { getTranslations } from 'next-intl/server';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { famousArticlePath } from '@/lib/cms';
import type { FamousNeighbors } from '@/lib/famous-list';
import { cn } from '@/lib/utils';

type Props = {
  neighbors: FamousNeighbors;
};

/** 详情页文末：同分类上一位 / 下一位 + 相关人物推荐 */
export async function FamousArticleNav({ neighbors }: Props) {
  const t = await getTranslations('famous');
  const { prev, next, related } = neighbors;

  if (!prev && !next && related.length === 0) return null;

  return (
    <nav className="mt-10 space-y-5 border-t border-border pt-8 sm:mt-12" aria-label={t('navAria')}>
      {(prev || next) && (
        <div className="flex items-stretch justify-between gap-3">
          {prev ? (
            <Link
              href={famousArticlePath(prev.slug)}
              className={cn(
                'group flex min-h-11 max-w-[46%] flex-1 items-center gap-1.5 rounded-[var(--os-radius-btn)] border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none sm:px-4',
              )}
            >
              <ChevronLeft className="size-4 shrink-0 opacity-70 transition-transform group-hover:-translate-x-0.5" aria-hidden />
              <span className="min-w-0 truncate">{t('personPrev', { name: prev.name })}</span>
            </Link>
          ) : (
            <span className="flex-1" />
          )}
          {next ? (
            <Link
              href={famousArticlePath(next.slug)}
              className={cn(
                'group flex min-h-11 max-w-[46%] flex-1 items-center justify-end gap-1.5 rounded-[var(--os-radius-btn)] border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none sm:px-4',
              )}
            >
              <span className="min-w-0 truncate text-end">{t('personNext', { name: next.name })}</span>
              <ChevronRight className="size-4 shrink-0 opacity-70 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          ) : (
            <span className="flex-1" />
          )}
        </div>
      )}

      {related.length > 0 && (
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground">{t('relatedTitle')}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 text-sm leading-relaxed">
            {related.map((item, i) => (
              <span key={item.slug} className="inline-flex items-center">
                {i > 0 && <span className="mx-1 text-muted-foreground/50" aria-hidden>·</span>}
                <Link
                  href={famousArticlePath(item.slug)}
                  className="text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {item.name}
                </Link>
              </span>
            ))}
          </p>
        </div>
      )}
    </nav>
  );
}
