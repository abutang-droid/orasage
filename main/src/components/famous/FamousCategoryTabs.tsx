import { Link } from '@/i18n/navigation';
import { FAMOUS_CATEGORIES, type FamousCategory } from '@/lib/famous-index';
import { cn } from '@/lib/utils';

export type FamousCategoryFilter = FamousCategory | 'all';

type Props = {
  active: FamousCategoryFilter;
  labels: Record<FamousCategoryFilter, string>;
  ariaLabel: string;
};

/** 分类 Tab（服务端渲染的链接，?cat= 过滤，URL 可分享） */
export function FamousCategoryTabs({ active, labels, ariaLabel }: Props) {
  const tabs: FamousCategoryFilter[] = ['all', ...FAMOUS_CATEGORIES];

  return (
    <nav aria-label={ariaLabel} className="-mx-5 mt-6 px-5 sm:mx-0 sm:px-0">
      <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((cat) => {
          const isActive = cat === active;
          return (
            <Link
              key={cat}
              href={cat === 'all' ? '/famous' : `/famous?cat=${cat}`}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isActive
                  ? 'border-foreground bg-foreground font-medium text-background'
                  : 'border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground',
              )}
            >
              {labels[cat]}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
