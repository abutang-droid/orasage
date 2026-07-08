import { ChevronRight, Search } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { decodeHtmlEntities, type DaozangIndexItem, daozangArticlePath } from '@/lib/cms';

import { Badge, Card, CardContent } from '@orasage/ui';

/** 道藏面包屑：道藏 › 顶级 · 分类 ›（当前页） */
export function DaozangBreadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-60 rtl:rotate-180" aria-hidden />}
            {item.href ? (
              <Link
                href={item.href}
                className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** 站内搜索（GET 表单，无需客户端 JS） */
export function DaozangSearchForm({
  locale,
  placeholder,
  defaultValue,
}: {
  locale: string;
  placeholder: string;
  defaultValue?: string;
}) {
  return (
    <form action={`/${locale}/daozang`} method="get" role="search" className="relative max-w-md">
      <Search
        className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="h-10 w-full rounded-full border border-input bg-background ps-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </form>
  );
}

/** 文章卡片：标题 + 摘要 + 可选分类角标 */
export function DaozangArticleCard({
  item,
  categoryLabel,
  displayTitle,
}: {
  item: DaozangIndexItem;
  categoryLabel?: string;
  /** 列表展示用短标题（如去掉「书名 · 」前缀） */
  displayTitle?: string;
}) {
  const title = displayTitle ?? decodeHtmlEntities(item.title);
  return (
    <Card variant="interactive" asChild>
      <Link href={daozangArticlePath(item.slug)} className="group block">
        <CardContent className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-heading-3 font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
              {title}
            </h2>
            {categoryLabel && (
              <Badge variant="muted" className="shrink-0">
                {categoryLabel}
              </Badge>
            )}
          </div>
          {item.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {item.excerpt}
            </p>
          )}
        </CardContent>
      </Link>
    </Card>
  );
}
