import { Link } from '@/i18n/navigation';
import { famousArticlePath } from '@/lib/cms';
import { Badge, Card, CardContent } from '@orasage/ui';

export type FamousCardData = {
  slug: string;
  name: string;
  description?: string;
  birth: string | null;
  pillars: string | null;
  pattern: string | null;
  fallback: boolean;
};

type Props = {
  item: FamousCardData;
  readLabel: string;
  /** 混合语言列表时给回退语言内容加「中文」标注 */
  fallbackTag?: string | null;
};

/** 名人案例列表人物卡：人名 + 格局 + 身份 + 生辰 + 四柱 */
export function FamousPersonCard({ item, readLabel, fallbackTag }: Props) {
  return (
    <Card variant="interactive" asChild className="h-full">
      <Link href={famousArticlePath(item.slug)} className="group flex h-full flex-col">
        <CardContent className="flex h-full flex-col p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-serif text-heading-3 font-medium leading-snug text-foreground transition-colors group-hover:text-foreground/80">
              {item.name}
            </h2>
            <span className="flex shrink-0 items-center gap-1.5 pt-1">
              {item.fallback && fallbackTag && <Badge variant="outline">{fallbackTag}</Badge>}
              {item.pattern && <Badge variant="muted">{item.pattern}</Badge>}
            </span>
          </div>

          {item.description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          )}

          {item.birth && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.birth}</p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 pt-4">
            {item.pillars ? (
              <span className="font-mono text-sm tracking-wide text-foreground">{item.pillars}</span>
            ) : (
              <span />
            )}
            <span className="whitespace-nowrap text-sm font-medium text-foreground transition-transform duration-fast group-hover:translate-x-0.5">
              {readLabel} →
            </span>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
