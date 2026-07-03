import type { HTMLAttributes, ReactNode } from 'react';
import { PortalBackToolbar } from '@/components/PortalBackToolbar';
import { cn } from '@/lib/utils';

/** 内容页通用容器 — DS v1.1 阅读宽度与间距 */
type PageShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <article
      className={cn('portal-subpage mx-auto w-full max-w-3xl px-5 py-10 sm:px-6 sm:py-12', className)}
      {...props}
    >
      <PortalBackToolbar />
      {children}
    </article>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-[1.75rem] font-bold leading-[var(--os-line-heading-1)] tracking-[var(--os-letter-tight)] text-foreground sm:text-heading-1">
      {children}
    </h1>
  );
}

export function PageLead({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground sm:mt-4 sm:text-base">
      {children}
    </p>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="portal-subpage-body mt-5 space-y-4 break-words sm:mt-6">
      {children}
    </div>
  );
}
