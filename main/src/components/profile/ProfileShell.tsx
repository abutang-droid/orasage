import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ProfileBackToolbar } from './ProfileBackToolbar';

type ProfileShellProps = {
  children: ReactNode;
  className?: string;
};

/** 「我的」模块内容容器 — 子页固定返回 Hub，顶栏由全站 Header 承担 */
export function ProfileShell({ children, className }: ProfileShellProps) {
  return (
    <div className={cn('portal-subpage mx-auto w-full max-w-3xl px-5 py-8 sm:px-6 sm:py-10', className)}>
      <ProfileBackToolbar />
      {children}
    </div>
  );
}
