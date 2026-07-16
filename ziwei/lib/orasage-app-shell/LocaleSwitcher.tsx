'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
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
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const active = isCoreLocale(locale) ? locale : 'zh-CN';

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
    setActiveIndex(Math.max(0, CORE_LOCALES.indexOf(active)));
  }, [open, active]);

  const select = (code: CoreLocale) => {
    setOpen(false);
    triggerRef.current?.focus();
    if (code === active) return;
    applyLocaleChange(code, context, onLocaleChange);
  };

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
  }

  function onListKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % CORE_LOCALES.length);
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? CORE_LOCALES.length - 1 : i - 1));
      return;
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(CORE_LOCALES.length - 1);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const code = CORE_LOCALES[activeIndex];
      if (code) select(code);
    }
  }

  return (
    <div className={`orasage-app-lang${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        className="orasage-app-lang-btn h-auto min-h-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
        aria-label="Select language"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <span>{localeLabel(active)}</span>
      </Button>
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
          {CORE_LOCALES.map((code, index) => (
            <Button
              key={code}
              type="button"
              variant="ghost"
              className="orasage-app-lang-item h-auto min-h-0 w-full justify-start border-0 bg-transparent p-0 shadow-none hover:bg-transparent"
              role="option"
              id={`${listId}-opt-${code}`}
              aria-selected={code === active}
              tabIndex={index === activeIndex ? 0 : -1}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => select(code)}
            >
              {LOCALE_LABELS[code]}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
