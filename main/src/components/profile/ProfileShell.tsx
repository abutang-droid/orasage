import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ProfileBackToolbar } from './ProfileBackToolbar';

type ProfileShellProps = {
  children: ReactNode;
  className?: string;
};

/** 「我的」模块内容容器 — 全端强制手机列宽（28rem），与八字/紫微/商店对齐 */
export function ProfileShell({ children, className }: ProfileShellProps) {
  return (
    <div className={cn('portal-subpage mx-auto w-full max-w-md px-5 py-8', className)}>
      <ProfileBackToolbar />
      {children}
    </div>
  );
}
