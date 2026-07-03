'use client';

import Link from 'next/link';
import { CurrencyToggle } from '@/components/CurrencyToggle';

type Props = {
  title?: string;
  showBack?: boolean;
};

/** 商店顶栏：栏目名 + 子页返回，无登录 */
export function ShopHeader({ title = '能量商城', showBack = false }: Props) {
  return (
    <header className="safe-top border-b border-sage-border/40 bg-sage-bg">
      <div className="safe-x mx-auto flex h-12 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <span className="shrink-0 font-serif text-base tracking-wide text-sage-gold sm:text-lg">{title}</span>
        <div className="flex items-center gap-2">
          {!showBack && <CurrencyToggle />}
          {showBack ? (
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex min-h-[44px] items-center gap-1 text-sm text-sage-muted transition hover:text-sage-gold"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              返回
            </button>
          ) : (
            <Link href="https://orasage.com/zh-CN" className="shrink-0 text-xs text-sage-muted hover:text-sage-primary">
              主站
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
