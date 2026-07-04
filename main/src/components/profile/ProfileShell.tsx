import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ProfileShellProps = {
  children: ReactNode;
  className?: string;
};

/** 「我的」模块内容容器 — 无独立标题栏/返回条，顶栏由全站 Header 承担 */
export function ProfileShell({ children, className }: ProfileShellProps) {
  return (
    <div className={cn('portal-subpage mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10', className)}>
      {children}
    </div>
  );
}
