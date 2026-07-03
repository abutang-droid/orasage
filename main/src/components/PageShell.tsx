import type { HTMLAttributes, ReactNode } from 'react';
import { PortalBackToolbar } from '@/components/PortalBackToolbar';
import { cn } from '@/lib/utils';

/** 内容页通用容器 — 移动优先内边距与阅读宽度 */
type PageShellProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
};

export function PageShell({ children, className, ...props }: PageShellProps) {
  return (
    <article
      className={cn('mx-auto w-full max-w-3xl px-5 py-10 text-foreground sm:px-6 sm:py-16', className)}
      {...props}
    >
      <PortalBackToolbar />
      {children}
    </article>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-2xl leading-snug text-foreground sm:text-3xl">
      {children}
    </h1>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 space-y-4 break-words text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base [&_a]:text-primary [&_a]:underline-offset-2 [&_a:hover]:underline [&_a:focus-visible]:outline-none [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-ring [&_a:focus-visible]:ring-offset-2 [&_a:focus-visible]:ring-offset-background [&_li]:my-2 [&_ol]:ps-5 [&_ul]:ps-5">
      {children}
    </div>
  );
}
