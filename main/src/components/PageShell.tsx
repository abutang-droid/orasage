import type { ReactNode } from 'react';

/** 内容页通用容器 — 移动优先内边距与阅读宽度 */
export function PageShell({ children }: { children: ReactNode }) {
  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-10 text-foreground sm:px-6 sm:py-16">
      {children}
    </article>
  );
}

export function PageTitle({ children }: { children: ReactNode }) {
  return (
    <h1 className="font-serif text-2xl leading-snug text-brand-gold sm:text-3xl">
      {children}
    </h1>
  );
}

export function PageBody({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-base">
      {children}
    </div>
  );
}
