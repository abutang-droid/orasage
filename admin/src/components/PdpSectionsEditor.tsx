'use client';

import { useState } from 'react';

export type EditorSection = {
  type: 'richText' | 'specList' | 'guide' | 'quote' | 'faq' | 'relatedSkus';
  title?: string;
  body?: string;
  quote?: string;
  attribution?: string;
  specItems?: Array<{ label: string; value: string }>;
  faqItems?: Array<{ question: string; answer: string }>;
  relatedSkus?: string[];
};

const TYPE_LABELS: Record<EditorSection['type'], string> = {
  richText: '正文',
  specList: '规格参数',
  guide: '佩戴/使用指南',
  quote: '推荐语/显化引文',
  faq: '常见问题',
  relatedSkus: '相关商品',
};

function emptySection(type: EditorSection['type']): EditorSection {
  switch (type) {
    case 'specList':
      return { type, title: '商品规格', specItems: [{ label: '', value: '' }] };
    case 'faq':
      return { type, title: '常见问题', faqItems: [{ question: '', answer: '' }] };
    case 'relatedSkus':
      return { type, relatedSkus: [''] };
    case 'quote':
      return { type, quote: '', attribution: '' };
    default:
      return { type, title: '', body: '' };
  }
}

/** PDP 区块编辑器：状态序列化到 hidden input，随外层表单提交（Q2-b） */
export function PdpSectionsEditor({ initial }: { initial: EditorSection[] }) {
  const [sections, setSections] = useState<EditorSection[]>(initial);

  const update = (index: number, patch: Partial<EditorSection>) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };
  const move = (index: number, delta: number) => {
    setSections((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };
  const remove = (index: number) => {
    setSections((prev) => prev.filter((_, i) => i !== index));
  };
  const add = (type: EditorSection['type']) => {
    setSections((prev) => [...prev, emptySection(type)]);
  };

  return (
    <div className="pdp-sections-editor">
      <input type="hidden" name="sections_json" value={JSON.stringify(sections)} />

      {sections.map((section, i) => (
        <div key={i} className="pdp-section-card">
          <div className="pdp-section-head">
            <span className="badge">{TYPE_LABELS[section.type]}</span>
            <span className="pdp-section-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === sections.length - 1}>↓</button>
              <button type="button" className="pdp-section-remove" onClick={() => remove(i)}>删除</button>
            </span>
          </div>

          {['richText', 'specList', 'guide', 'faq'].includes(section.type) ? (
            <label>
              标题
              <input
                value={section.title ?? ''}
                onChange={(e) => update(i, { title: e.target.value })}
                placeholder={section.type === 'richText' ? '可留空' : ''}
              />
            </label>
          ) : null}

          {['richText', 'guide'].includes(section.type) ? (
            <label>
              正文
              <textarea
                rows={6}
                value={section.body ?? ''}
                onChange={(e) => update(i, { body: e.target.value })}
              />
            </label>
          ) : null}

          {section.type === 'quote' ? (
            <>
              <label>
                引文
                <textarea
                  rows={3}
                  value={section.quote ?? ''}
                  onChange={(e) => update(i, { quote: e.target.value })}
                />
              </label>
              <label>
                署名（含「Manifest」时作为显化引文展示）
                <input
                  value={section.attribution ?? ''}
                  onChange={(e) => update(i, { attribution: e.target.value })}
                />
              </label>
            </>
          ) : null}

          {section.type === 'specList' ? (
            <div className="pdp-kv-list">
              {(section.specItems ?? []).map((item, j) => (
                <div key={j} className="pdp-kv-row">
                  <input
                    value={item.label}
                    placeholder="名称"
                    onChange={(e) => {
                      const items = [...(section.specItems ?? [])];
                      items[j] = { ...items[j], label: e.target.value };
                      update(i, { specItems: items });
                    }}
                  />
                  <input
                    value={item.value}
                    placeholder="值"
                    onChange={(e) => {
                      const items = [...(section.specItems ?? [])];
                      items[j] = { ...items[j], value: e.target.value };
                      update(i, { specItems: items });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => update(i, { specItems: (section.specItems ?? []).filter((_, k) => k !== j) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="pdp-add-row"
                onClick={() => update(i, { specItems: [...(section.specItems ?? []), { label: '', value: '' }] })}
              >
                ＋ 规格项
              </button>
            </div>
          ) : null}

          {section.type === 'faq' ? (
            <div className="pdp-kv-list">
              {(section.faqItems ?? []).map((item, j) => (
                <div key={j} className="pdp-faq-row">
                  <input
                    value={item.question}
                    placeholder="问题"
                    onChange={(e) => {
                      const items = [...(section.faqItems ?? [])];
                      items[j] = { ...items[j], question: e.target.value };
                      update(i, { faqItems: items });
                    }}
                  />
                  <textarea
                    rows={2}
                    value={item.answer}
                    placeholder="回答"
                    onChange={(e) => {
                      const items = [...(section.faqItems ?? [])];
                      items[j] = { ...items[j], answer: e.target.value };
                      update(i, { faqItems: items });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => update(i, { faqItems: (section.faqItems ?? []).filter((_, k) => k !== j) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="pdp-add-row"
                onClick={() => update(i, { faqItems: [...(section.faqItems ?? []), { question: '', answer: '' }] })}
              >
                ＋ 问答
              </button>
            </div>
          ) : null}

          {section.type === 'relatedSkus' ? (
            <div className="pdp-kv-list">
              {(section.relatedSkus ?? []).map((sku, j) => (
                <div key={j} className="pdp-kv-row">
                  <input
                    value={sku}
                    placeholder="crystal-wood"
                    onChange={(e) => {
                      const items = [...(section.relatedSkus ?? [])];
                      items[j] = e.target.value;
                      update(i, { relatedSkus: items });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => update(i, { relatedSkus: (section.relatedSkus ?? []).filter((_, k) => k !== j) })}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="pdp-add-row"
                onClick={() => update(i, { relatedSkus: [...(section.relatedSkus ?? []), ''] })}
              >
                ＋ SKU
              </button>
            </div>
          ) : null}
        </div>
      ))}

      <div className="pdp-section-add-bar">
        {(Object.keys(TYPE_LABELS) as Array<EditorSection['type']>).map((type) => (
          <button key={type} type="button" onClick={() => add(type)}>
            ＋ {TYPE_LABELS[type]}
          </button>
        ))}
      </div>
    </div>
  );
}
