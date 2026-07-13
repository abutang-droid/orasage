'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { useFaithCopy } from '@/lib/i18n/ui-strings';
import type { Lang } from '@/lib/i18n/context';
import {
  CUSTOM_FAITH_ID,
  FAITH_STORAGE_KEY,
  SPECIAL_FAITH_IDS,
  formatFaithLabel,
  getCustomFaithOption,
  getFaithById,
  getMoreFaiths,
  getTopFaiths,
  isCustomFaithId,
  type FaithOption,
} from '@/lib/faiths/religions';
import { splitFaithsByRank } from '@/lib/cms/faiths';

type FaithPickerProps = {
  value?: string | null;
  onChange: (faithId: string) => void;
  onSkip?: () => void;
  countryCode?: string | null;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
  /** 将「自定义」放在首屏网格第一位 */
  customFirst?: boolean;
};

type FaithApiResponse = {
  faiths?: FaithOption[];
  top?: FaithOption[];
  more?: FaithOption[];
  source?: 'cms' | 'fallback';
  regional?: boolean;
};

function faithPrimaryName(faith: FaithOption, lang: Lang) {
  return lang === 'zh' ? faith.nameZh : faith.nameEn;
}

function faithSecondaryName(faith: FaithOption, lang: Lang) {
  return lang === 'zh' ? faith.nameEn : faith.nameZh;
}

function FaithCard({
  faith,
  selected,
  onSelect,
  lang,
}: {
  faith: FaithOption;
  selected: boolean;
  onSelect: () => void;
  lang: Lang;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`faith-picker-card${selected ? ' is-selected' : ''}`}
    >
      <span className="faith-picker-card-emoji">{faith.emoji}</span>
      <span className="faith-picker-card-text">
        <span className="faith-picker-card-name">{faithPrimaryName(faith, lang)}</span>
        <span className="faith-picker-card-en">{faithSecondaryName(faith, lang)}</span>
      </span>
      {selected ? <span className="faith-picker-card-check">✓</span> : null}
    </button>
  );
}

export function FaithPicker({
  value,
  onChange,
  onSkip,
  countryCode,
  title,
  subtitle,
  confirmLabel,
  customFirst = true,
}: FaithPickerProps) {
  const faithCopy = useFaithCopy();
  const resolvedTitle = title ?? faithCopy.title;
  const resolvedSubtitle = subtitle ?? faithCopy.subtitle;
  const resolvedConfirm = confirmLabel ?? faithCopy.confirm;
  const [showMore, setShowMore] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [pending, setPending] = useState<string | null>(value ?? null);
  const [faiths, setFaiths] = useState<FaithOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!value) return;
    if (isCustomFaithId(value)) {
      setPending(value);
      if (value.startsWith('other:')) setOtherText(value.slice(6));
    }
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const url = countryCode
      ? `/api/faiths?country=${encodeURIComponent(countryCode)}`
      : '/api/faiths';
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: FaithApiResponse | null) => {
        if (cancelled) return;
        if (data?.faiths?.length) {
          setFaiths(data.faiths);
        } else {
          setFaiths([...getTopFaiths(), ...getMoreFaiths()]);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFaiths([...getTopFaiths(), ...getMoreFaiths()]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [countryCode]);

  const { top: topFaiths, more: moreFaiths } = useMemo(() => {
    if (faiths.length === 0) {
      return {
        top: getTopFaiths(),
        more: getMoreFaiths(),
      };
    }
    const split = splitFaithsByRank(faiths);
    return {
      top: split.top.filter((f) => !SPECIAL_FAITH_IDS.has(f.id)),
      more: split.more.filter((f) => !SPECIAL_FAITH_IDS.has(f.id)),
    };
  }, [faiths]);

  const customFaith = useMemo(() => getCustomFaithOption(faiths), [faiths]);

  const selectedFaith = pending ? getFaithById(pending, faiths) : null;
  const isOther = isCustomFaithId(pending);
  const isCollapsed = Boolean(selectedFaith && !isOther);

  function selectFaith(id: string) {
    setPending(id);
    setShowMore(false);
    if (!isCustomFaithId(id)) {
      try {
        localStorage.setItem(FAITH_STORAGE_KEY, JSON.stringify({ id }));
      } catch {
        /* ignore */
      }
    }
  }

  function clearSelection() {
    setPending(null);
    setOtherText('');
    setShowMore(false);
  }

  function confirmSelection() {
    if (!pending || isCustomFaithId(pending)) return;
    onChange(pending);
  }

  function confirmOther() {
    const trimmed = otherText.trim();
    if (!trimmed) return;
    const id = `other:${trimmed}`;
    setPending(id);
    onChange(id);
    try {
      localStorage.setItem(FAITH_STORAGE_KEY, JSON.stringify({ id, custom: trimmed }));
    } catch {
      /* ignore */
    }
  }

  return (
    <div className={`faith-picker${isCollapsed ? ' faith-picker--collapsed' : ''}`}>
      {(resolvedTitle || resolvedSubtitle) && (
        <div className="page-header" style={{ padding: '16px 0' }}>
          <span className="label">{faithCopy.label}</span>
          {resolvedTitle ? <h1>{resolvedTitle}</h1> : null}
          {resolvedSubtitle ? <p>{resolvedSubtitle}</p> : null}
        </div>
      )}

      {value && !pending && (
        <div className="faith-picker-current">
          {faithCopy.current(formatFaithLabel(value, faiths, faithCopy.lang))}
        </div>
      )}

      {loading ? (
        <div className="faith-picker-loading">{faithCopy.loading}</div>
      ) : isCollapsed && selectedFaith ? (
        <div className="faith-picker-confirm-panel">
          <FaithCard faith={selectedFaith} selected onSelect={clearSelection} lang={faithCopy.lang} />
          <p className="faith-picker-confirm-hint">
            {faithCopy.selectedLead(faithPrimaryName(selectedFaith, faithCopy.lang))}
          </p>
          <Button type="button" className="faith-picker-confirm-btn w-full" onClick={confirmSelection}>
            {resolvedConfirm}
          </Button>
          <Button type="button" variant="ghost" className="faith-picker-repick-btn w-full" onClick={clearSelection}>
            {faithCopy.reselect}
          </Button>
        </div>
      ) : (
        <>
          <div className="faith-picker-grid">
            {customFirst ? (
              <FaithCard
                faith={customFaith}
                selected={isOther}
                lang={faithCopy.lang}
                onSelect={() => {
                  selectFaith(CUSTOM_FAITH_ID);
                  setOtherText('');
                }}
              />
            ) : null}
            {topFaiths.map((faith) => (
              <FaithCard
                key={faith.id}
                faith={faith}
                selected={pending === faith.id}
                lang={faithCopy.lang}
                onSelect={() => selectFaith(faith.id)}
              />
            ))}
          </div>

          {!customFirst ? (
            <div className="faith-picker-custom">
              <FaithCard
                faith={customFaith}
                selected={isOther}
                lang={faithCopy.lang}
                onSelect={() => {
                  selectFaith(CUSTOM_FAITH_ID);
                  setOtherText('');
                }}
              />
            </div>
          ) : null}

          {!showMore ? (
            <Button type="button" variant="outline" className="faith-picker-more-btn w-full" onClick={() => setShowMore(true)}>
              {faithCopy.moreFaiths}
            </Button>
          ) : (
            <div className="faith-picker-more-list">
              <div className="section-label">{faithCopy.moreFaithsTitle}</div>
              <div className="faith-picker-more-items">
                {moreFaiths.map((faith) => (
                  <FaithCard
                    key={faith.id}
                    faith={faith}
                    selected={pending === faith.id}
                    lang={faithCopy.lang}
                    onSelect={() => selectFaith(faith.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {isOther && (
        <div className="faith-picker-other">
          <p className="faith-picker-other-lead">{faithCopy.customLead}</p>
          <input
            className="input-field"
            placeholder={faithCopy.customPlaceholder}
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            maxLength={40}
            autoFocus
          />
          <Button
            type="button"
            className="w-full mt-3"
            onClick={confirmOther}
            disabled={!otherText.trim()}
          >
            {resolvedConfirm}
          </Button>
        </div>
      )}

      {onSkip ? (
        <Button type="button" variant="ghost" className="faith-picker-skip-btn w-full" onClick={onSkip}>
          {faithCopy.skip}
        </Button>
      ) : null}
    </div>
  );
}

export function loadStoredFaith(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(FAITH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { id?: string };
    return parsed.id ?? null;
  } catch {
    return null;
  }
}
