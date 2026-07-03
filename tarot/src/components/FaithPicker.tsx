'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  FAITH_STORAGE_KEY,
  formatFaithLabel,
  getFaithById,
  getMoreFaiths,
  getTopFaiths,
  type FaithOption,
} from '@/lib/faiths/religions';
import { splitFaithsByRank } from '@/lib/cms/faiths';

type FaithPickerProps = {
  value?: string | null;
  onChange: (faithId: string) => void;
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
      style={{
        padding: '14px 12px',
        background: selected ? 'var(--bg-card-hover)' : 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--border-focus)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        transition: 'all 0.15s ease',
        width: '100%',
      }}
    >
      <span style={{ fontSize: 22, lineHeight: 1 }}>{faith.emoji}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: selected ? 600 : 500,
            fontFamily: 'var(--font-serif)',
          }}
        >
          {faith.nameZh}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 10,
            color: 'var(--text-muted)',
            marginTop: 2,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {faith.nameEn}
        </span>
      </span>
      {selected && (
        <span style={{ fontSize: 12, color: 'var(--gold-light)' }}>✓</span>
      )}
    </button>
  );
}

export function FaithPicker({
  value,
  onChange,
  title = '你的信仰是什么？',
  subtitle = '选择最贴近你内心的传统，我们会据此推荐圣地与祈福方式',
  confirmLabel = '确认',
}: FaithPickerProps) {
  const [showMore, setShowMore] = useState(false);
  const [otherText, setOtherText] = useState('');
  const [pending, setPending] = useState<string | null>(value ?? null);
  const [faiths, setFaiths] = useState<FaithOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/faiths')
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
  }, []);

  const { top: topFaiths, more: moreFaiths } = useMemo(() => {
    if (faiths.length === 0) {
      return { top: getTopFaiths(), more: getMoreFaiths() };
    }
    return splitFaithsByRank(faiths);
  }, [faiths]);

  const selectedFaith = pending ? getFaithById(pending, faiths) : null;
  const isOther = pending === 'other' || pending?.startsWith('other:');

  function selectFaith(id: string) {
    setPending(id);
    if (id !== 'other' && !id.startsWith('other:')) {
      try {
        localStorage.setItem(FAITH_STORAGE_KEY, JSON.stringify({ id }));
      } catch {
        /* ignore */
      }
    }
  }

  function confirmSelection() {
    if (!pending || pending === 'other') return;
    onChange(pending);
  }

  function confirmOther() {
    const trimmed = otherText.trim();
    const id = trimmed ? `other:${trimmed}` : 'other';
    setPending(id);
    onChange(id);
    try {
      localStorage.setItem(FAITH_STORAGE_KEY, JSON.stringify({ id, custom: trimmed }));
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div className="page-header" style={{ padding: '16px 0' }}>
        <span className="label">信仰</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {value && !pending && (
        <div
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: 'rgba(201,149,74,0.08)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            color: 'var(--text-secondary)',
          }}
        >
          当前：{formatFaithLabel(value, faiths)}
        </div>
      )}

      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0',
            color: 'var(--text-muted)',
            fontSize: 13,
          }}
        >
          正在从 CMS 加载信仰列表…
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 10,
              marginBottom: 16,
            }}
          >
            {topFaiths.map((faith) => (
              <FaithCard
                key={faith.id}
                faith={faith}
                selected={pending === faith.id}
                onSelect={() => selectFaith(faith.id)}
              />
            ))}
          </div>

          {!showMore ? (
            <button
              type="button"
              className="btn-outline"
              style={{ width: '100%', marginBottom: 24 }}
              onClick={() => setShowMore(true)}
            >
              更多信仰 →
            </button>
          ) : (
            <div style={{ marginBottom: 24 }}>
              <div className="section-label" style={{ marginBottom: 12 }}>
                更多信仰
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
        <div style={{ marginBottom: 20 }}>
          <input
            className="input-field"
            placeholder="请写下你的信仰名称…"
            value={otherText}
            onChange={(e) => setOtherText(e.target.value)}
            maxLength={40}
          />
          <button
            type="button"
            className="btn-primary"
            style={{ width: '100%', marginTop: 12 }}
            onClick={confirmOther}
          >
            {confirmLabel}
          </button>
        </div>
      )}

      {selectedFaith && !isOther && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', marginTop: 16 }}
          onClick={confirmSelection}
        >
          {confirmLabel}
        </button>
      )}

      {selectedFaith && !isOther && pending && pending !== 'other' && (
        <p
          style={{
            marginTop: 12,
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-sans)',
          }}
        >
          已选择 {selectedFaith.nameZh}
        </p>
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
