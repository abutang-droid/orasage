'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@orasage/ui/button';
import type { NavContext } from './config';
import {
  applyLocaleChange,
  CORE_LOCALES,
  isCoreLocale,
  LOCALE_LABELS,
  localeLabel,
  type CoreLocale,
} from './locale-cookie';

export type LocaleSwitcherProps = {
  locale?: string;
  context?: NavContext;
  onLocaleChange?: (locale: string) => void;
  className?: string;
};

export function LocaleSwitcher({
  locale = 'zh-CN',
  context = 'portal',
  onLocaleChange,
  className = '',
}: LocaleSwitcherProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const active = isCoreLocale(locale) ? locale : 'zh-CN';

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const select = (code: CoreLocale) => {
    setOpen(false);
    if (code === active) return;
    applyLocaleChange(code, context, onLocaleChange);
  };

  return (
    <div className={`orasage-app-lang${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <Button
        type="button"
        variant="ghost"
        className="orasage-app-lang-btn h-auto min-h-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{localeLabel(active)}</span>
        <ChevronDown size={14} strokeWidth={2} aria-hidden />
      </Button>
      {open && (
        <div className="orasage-app-lang-menu" role="listbox" aria-label="Languages">
          {CORE_LOCALES.map((code) => (
            <Button
              key={code}
              type="button"
              variant="ghost"
              className="orasage-app-lang-item h-auto min-h-0 w-full justify-start border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
              role="option"
              aria-current={code === active ? 'true' : undefined}
              onClick={() => select(code)}
            >
              {LOCALE_LABELS[code]}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
