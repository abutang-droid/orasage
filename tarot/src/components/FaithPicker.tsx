'use client';

import { useEffect, useMemo, useState } from 'react';
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
  countryCode?: string | null;
  title?: string;
  subtitle?: string;
  confirmLabel?: string;
};

type FaithApiResponse = {
  faiths?: FaithOption[];
  top?: FaithOption[];
  more?: FaithOption[];
  source?: 'cms' | 'fallback';
};

function FaithCard({
  faith,
  selected,
  onSelect,
}: {
  faith: FaithOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`faith-picker-card${selected ? ' is-selected' : ''}`}
    >
      <span className="faith-picker-card-emoji">{faith.emoji}</span>
      <span className="faith-picker-card-text">
        <span className="faith-picker-card-name">{faith.nameZh}</span>
        <span className="faith-picker-card-en">{faith.nameEn}</span>
      </span>
      {selected ? <span className="faith-picker-card-check">✓</span> : null}
    </button>
  );
}

export function FaithPicker({
  value,
  onChange,
  countryCode,
  title = '你的信仰是什么？',
  subtitle = '选择最贴近你内心的传统，我们会据此推荐守护神与祈福方式',
  confirmLabel = '确认',
}: FaithPickerProps) {
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
      {(title || subtitle) && (
        <div className="page-header" style={{ padding: '16px 0' }}>
          <span className="label">信仰</span>
          {title ? <h1>{title}</h1> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      )}

      {value && !pending && (
        <div className="faith-picker-current">
          当前：{formatFaithLabel(value, faiths)}
        </div>
      )}

      {loading ? (
        <div className="faith-picker-loading">正在加载信仰列表…</div>
      ) : isCollapsed && selectedFaith ? (
        <div className="faith-picker-confirm-panel">
          <FaithCard faith={selectedFaith} selected onSelect={clearSelection} />
          <p className="faith-picker-confirm-hint">
            已选择 <strong>{selectedFaith.nameZh}</strong>，确认后将进入下一步
          </p>
          <button type="button" className="btn-primary faith-picker-confirm-btn" onClick={confirmSelection}>
            {confirmLabel}
          </button>
          <button type="button" className="btn-ghost faith-picker-repick-btn" onClick={clearSelection}>
            重新选择
          </button>
        </div>
      ) : (
        <>
          <div className="faith-picker-grid">
            {topFaiths.map((faith) => (
              <FaithCard
                key={faith.id}
                faith={faith}
                selected={pending === faith.id}
                onSelect={() => selectFaith(faith.id)}
              />
            ))}
          </div>

          <div className="faith-picker-custom">
            <FaithCard
              faith={customFaith}
              selected={isOther}
              onSelect={() => {
                selectFaith(CUSTOM_FAITH_ID);
                setOtherText('');
              }}
            />
          </div>

          {!showMore ? (
            <button type="button" className="btn-outline faith-picker-more-btn" onClick={() => setShowMore(true)}>
              更多信仰 →
            </button>
          ) : (
            <div className="faith-picker-more-list">
              <div className="section-label">更多信仰</div>
              <div className="faith-picker-more-items">
                {moreFaiths.map((faith) => (
                  <FaithCard
                    key={faith.id}
                    faith={faith}
                    selected={pending === faith.id}
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
          <p className="faith-picker-other-lead">写下你的信仰或精神归属名称</p>
          <input
            className="input-field"
            placeholder="例如：妈祖、象头神、个人灵性修行…"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            maxLength={40}
            autoFocus
          />
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={confirmOther}
            disabled={!otherText.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      )}
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
