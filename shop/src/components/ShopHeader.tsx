import Link from 'next/link';
import { getAuthUser, loginUrl, centerUrl } from '@/lib/auth';

export async function ShopHeader() {
  const user = await getAuthUser();

  return (
    <header className="safe-top sticky top-0 z-50 border-b border-sage-border/60 bg-sage-bg/95 backdrop-blur-md">
      <div className="safe-x mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16">
        <Link href="/" className="font-serif text-lg tracking-widest text-sage-gold sm:text-xl">
          OraSage
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="https://orasage.com" className="hidden text-xs text-sage-muted sm:inline hover:text-sage-primary">
            返回主站
          </Link>
          {user ? (
            <a
              href={centerUrl()}
              className="rounded-full border border-sage-gold/40 px-3 py-2 text-xs text-sage-gold sm:px-4 sm:text-sm"
            >
              用户中心
            </a>
          ) : (
            <a
              href={loginUrl()}
              className="rounded-full border border-sage-gold/40 px-3 py-2 text-xs text-sage-gold sm:px-4 sm:text-sm"
            >
              登录
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
