'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import { useLocale } from 'next-intl';
import { locales, localeNames, type Locale } from '@/i18n/routing';
import { usePathname, useRouter } from '@/i18n/navigation';
import { setLocaleCookie } from '@/lib/orasage-app-shell/locale-cookie';
import { updateProfile } from '@/lib/auth';

/**
 * 门户顶栏全局语言切换器（12 语言）。
 * WAI-ARIA listbox：方向键 / Home / End / Escape（HOME-P2-02）。
 */
export function PortalLocaleSwitcher({ className = '' }: { className?: string }) {
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pending, startTransition] = useTransition();
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, locales.indexOf(active));
    setActiveIndex(idx);
  }, [open, active]);

  function select(code: Locale) {
    setOpen(false);
    triggerRef.current?.focus();
    if (code === active || pending) return;
    setLocaleCookie(code);
    startTransition(() => {
      router.replace(pathname, { locale: code });
    });
    void updateProfile({ languagePreference: code }).catch(() => undefined);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % locales.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? locales.length - 1 : i - 1));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(locales.length - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const code = locales[activeIndex];
      if (code) select(code);
    }
  }

  return (
    <div
      className={`orasage-app-lang${className ? ` ${className}` : ''}${pending ? ' is-pending' : ''}`}
      ref={wrapRef}
      aria-busy={pending || undefined}
    >
      <button
        ref={triggerRef}
        type="button"
        className="orasage-app-lang-btn"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        disabled={pending}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{localeNames[active] ?? active}</span>
      </button>
      {open ? (
        <div
          id={listId}
          className="orasage-app-lang-menu"
          role="listbox"
          aria-label="Languages"
          tabIndex={-1}
          onKeyDown={onListKeyDown}
          ref={(node) => {
            if (node && open) node.focus();
          }}
        >
          {locales.map((code, index) => (
            <button
              key={code}
              type="button"
              className="orasage-app-lang-item"
              role="option"
              id={`${listId}-opt-${code}`}
              aria-selected={code === active}
              tabIndex={index === activeIndex ? 0 : -1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(code)}
            >
              {localeNames[code]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
