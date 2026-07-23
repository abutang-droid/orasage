'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { setLocaleCookie } from '@/lib/orasage-app-shell/locale-cookie';
import { updateProfile } from '@/lib/auth';

/**
 * 门户顶栏全局语言切换器（phase 1：zh-CN / en / pt-BR）。
 * 写跨子域 NEXT_LOCALE cookie（DS §10），切换 next-intl 路径 locale，
 * 并（若已登录）同步 languagePreference。
 * 视觉复用 app-shell 语言下拉，与各子应用顶栏一致。
 */
export function PortalLocaleSwitcher({ className = '' }: { className?: string }) {
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  function select(code: Locale) {
    setOpen(false);
    if (code === active) return;
    setLocaleCookie(code);
    // Path-locale replace remounts the segment; follow with refresh so RSC
    // payloads (CMS / nav) don't stay on the previous language.
    startTransition(() => {
      router.replace(pathname, { locale: code });
      router.refresh();
    });
    // 已登录时同步偏好；游客请求 401 由 catch 吞掉
    void updateProfile({ languagePreference: code }).catch(() => undefined);
  }

  return (
    <div className={`orasage-app-lang${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="orasage-app-lang-btn"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{localeNames[active] ?? active}</span>
      </button>
      {open && (
        <div className="orasage-app-lang-menu" role="listbox" aria-label="Languages">
          {locales.map((code) => (
            <button
              key={code}
              type="button"
              className="orasage-app-lang-item"
              role="option"
              aria-current={code === active ? 'true' : undefined}
              onClick={() => select(code)}
            >
              {localeNames[code]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
