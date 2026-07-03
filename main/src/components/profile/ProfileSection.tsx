import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ProfileSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
};

/** Profile 子页统一标题区 — 与 FAQ / 内容页语义 token 一致 */
export function ProfileSection({ title, description, children, className }: ProfileSectionProps) {
  return (
    <section className={cn('space-y-5 sm:space-y-6', className)}>
      <header>
        <h2 className="font-serif text-heading-2 font-bold tracking-[-0.01em] text-foreground">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground sm:text-[15px]">
            {description}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
