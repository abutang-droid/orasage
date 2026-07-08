'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { DiyBead, DiyConfig } from '@/lib/diy';
import { ELEMENT_TO_FEED_MATERIAL, ELEMENT_TO_MAIN_MATERIAL } from '@/lib/diy';
import { formatShopPrice, resolvePriceCents, type ShopCurrency } from '@/lib/currency';

const DRAFT_KEY = 'orasage_diy_draft_v1';
const RULER_MIN = 10;
const RULER_MAX = 25;
const PX_HALF = 14;
const PX_CM = 28;

const EL_TABS = ['全部', '金', '木', '水', '火', '土', '配件'] as const;
const SIZE_TABS = [0, 4, 6, 8, 10] as const;
const TYPE_LABEL: Record<string, string> = { spacer: '隔珠', disc: '隔片' };

/** 与主五行同属性的隔珠/隔片（八字推荐选配） */
const ELEMENT_SPACER: Record<string, string> = {
  金: 'silver-4', 木: 'sandal-4', 水: 'silver-4', 火: 'cinnabar-4', 土: 'gold-4',
};
const ELEMENT_DISC: Record<string, string> = {
  金: 'tibet-6', 木: 'ebony-6', 水: 'shell-6', 火: 'agated-6', 土: 'tibet-6',
};

type DiyDesignerProps = {
  beads: DiyBead[];
  config: DiyConfig;
  currency: ShopCurrency;
  initialMaterial?: string;
  initialElement?: string;
};

function beadColors(bead: DiyBead): { g0: string; g1: string; g2: string; line: string } {
  const parts = (bead.colors ?? '').split(',').map((s) => s.trim());
  return {
    g0: parts[0] || '#e5e7eb',
    g1: parts[1] || '#9ca3af',
    g2: parts[2] || '#6b7280',
    line: parts[3] || '#9ca3af',
  };
}

function sizeLabel(bead: DiyBead): string {
  return bead.type === 'disc' && bead.thicknessMm
    ? `${bead.diameterMm}×${bead.thicknessMm}mm`
    : `${bead.diameterMm}mm`;
}

function wristText(v: number): string {
  const s = Math.round(v * 2) / 2;
  return Number.isInteger(s) ? String(s) : s.toFixed(1);
}

export function DiyDesigner({ beads, config, currency, initialMaterial, initialElement }: DiyDesignerProps) {
  const beadByCode = useMemo(() => new Map(beads.map((b) => [b.code, b])), [beads]);

  const [design, setDesign] = useState<string[]>([]);
  const [wrist, setWrist] = useState(16);
  const [selIdx, setSelIdx] = useState(-1);
  const [elFilter, setElFilter] = useState<(typeof EL_TABS)[number]>('全部');
  const [sizeFilter, setSizeFilter] = useState<number>(0);
  const [baziOpen, setBaziOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2200);
  }, []);

  /* ── 派生数据 ─────────────────────────── */
  const totalMm = useMemo(
    () => design.reduce((sum, code) => sum + (beadByCode.get(code)?.lengthMm ?? 0), 0),
    [design, beadByCode],
  );
  const totalCents = useMemo(
    () => design.reduce((sum, code) => sum + (beadByCode.get(code)?.priceCents ?? 0), 0),
    [design, beadByCode],
  );
  const totalDisplayCents = useMemo(
    () => design.reduce((sum, code) => {
      const bead = beadByCode.get(code);
      if (!bead) return sum;
      return sum + resolvePriceCents({ priceCents: bead.priceCents, priceCentsUsd: bead.priceCentsUsd }, currency);
    }, 0),
    [design, beadByCode, currency],
  );
  const crystalKinds = useMemo(() => {
    const set = new Set<string>();
    for (const code of design) {
      const bead = beadByCode.get(code);
      if (bead?.type === 'crystal') set.add(bead.material);
    }
    return set.size;
  }, [design, beadByCode]);

  const effectiveMm = totalMm + config.lengthCorrectionMm;
  const targetMm = wrist * 10 + config.wristEaseMm;
  const fit: '' | '偏小' | '合适' | '偏大' = design.length === 0
    ? ''
    : effectiveMm < targetMm - config.fitToleranceMm
      ? '偏小'
      : effectiveMm > targetMm + config.fitToleranceMm
        ? '偏大'
        : '合适';
  const belowMin = totalCents < config.minOrderCents;
  const canCheckout = design.length > 0 && fit === '合适' && !belowMin;

  /* ── 草稿：读 / 存 ────────────────────── */
  useEffect(() => {
    let restored = false;
    if (!initialMaterial && !initialElement) {
      try {
        const raw = localStorage.getItem(DRAFT_KEY);
        if (raw) {
          const draft = JSON.parse(raw) as { design?: string[]; wrist?: number };
          const valid = (draft.design ?? []).filter((code) => beadByCode.has(code));
          if (valid.length) {
            setDesign(valid);
            restored = true;
          }
          if (typeof draft.wrist === 'number' && draft.wrist >= RULER_MIN && draft.wrist <= RULER_MAX) {
            setWrist(draft.wrist);
          }
        }
      } catch { /* 忽略损坏草稿 */ }
    }
    if (!restored && initialMaterial) {
      prefillMaterial(initialMaterial, 16);
    } else if (!restored && initialElement) {
      applyElementRecommend(initialElement, 16);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ design, wrist }));
    } catch { /* 存储不可用时忽略 */ }
  }, [design, wrist, hydrated]);

  /* ── 组串生成 ─────────────────────────── */
  function fillLoop(push: (i: number) => string | null, wristCm: number): string[] {
    const target = wristCm * 10 + config.wristEaseMm - config.lengthCorrectionMm;
    const next: string[] = [];
    let len = 0;
    let i = 0;
    while (len < target - 6 && i < 120) {
      const code = push(i);
      i += 1;
      if (!code) continue;
      const bead = beadByCode.get(code);
      if (!bead) continue;
      next.push(code);
      len += bead.lengthMm;
    }
    return next;
  }

  function prefillMaterial(material: string, wristCm: number) {
    const main = `${material}-8`;
    if (!beadByCode.has(main)) return;
    setDesign(fillLoop(() => main, wristCm));
    setSelIdx(-1);
  }

  function applyElementRecommend(element: string, wristCm: number) {
    const main = `${ELEMENT_TO_MAIN_MATERIAL[element] ?? 'clear'}-8`;
    const feed = `${ELEMENT_TO_FEED_MATERIAL[element] ?? 'citrine'}-6`;
    const spacer = ELEMENT_SPACER[element] ?? 'silver-4';
    const disc = ELEMENT_DISC[element] ?? 'tibet-6';
    if (!beadByCode.has(main)) return;
    setDesign(fillLoop((i) => {
      if (i % 7 === 5 && beadByCode.has(disc)) return disc;
      if (i % 5 === 4 && beadByCode.has(spacer)) return spacer;
      if (i % 4 === 3 && beadByCode.has(feed)) return feed;
      return main;
    }, wristCm));
    setSelIdx(-1);
    showToast(`已按「五行补${element}」生成推荐，可继续微调`);
  }

  function shuffleInspiration() {
    const crystals = [...new Set(beads.filter((b) => b.type === 'crystal').map((b) => b.material))];
    if (!crystals.length) return;
    const pick = crystals.sort(() => Math.random() - 0.5).slice(0, 3);
    const spacers = beads.filter((b) => b.type === 'spacer');
    const discs = beads.filter((b) => b.type === 'disc');
    const sp = spacers[Math.floor(Math.random() * spacers.length)]?.code;
    const dc = discs[Math.floor(Math.random() * discs.length)]?.code;
    setDesign(fillLoop((i) => {
      if (i % 6 === 2 && dc) return dc;
      if (i % 4 === 3 && sp) return sp;
      return `${pick[i % pick.length]}-8`;
    }, wrist));
    setSelIdx(-1);
    showToast('已生成随机灵感，可继续微调');
  }

  /* ── 操作 ─────────────────────────────── */
  function addBead(code: string) {
    if (effectiveMm >= targetMm + config.fitToleranceMm) {
      showToast('已达此手围上限，请先移除部分珠子');
      return;
    }
    setDesign((d) => [...d, code]);
    setSelIdx(-1);
  }

  function removeSelected() {
    if (selIdx < 0) return;
    setDesign((d) => d.filter((_, i) => i !== selIdx));
    setSelIdx(-1);
  }

  function moveSelected(dir: -1 | 1) {
    setDesign((d) => {
      const j = selIdx + dir;
      if (selIdx < 0 || j < 0 || j >= d.length) return d;
      const next = [...d];
      [next[selIdx], next[j]] = [next[j], next[selIdx]];
      return next;
    });
    setSelIdx((i) => {
      const j = i + dir;
      return j >= 0 && j < design.length ? j : i;
    });
  }

  function clearAll() {
    if (!design.length) return;
    if (window.confirm('清空当前设计？')) {
      setDesign([]);
      setSelIdx(-1);
    }
  }

  async function handleCheckout() {
    if (!canCheckout || checkingOut) return;
    setCheckingOut(true);
    try {
      const res = await fetch('/api/diy/checkout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ beads: design, wristCm: Math.round(wrist * 2) / 2 }),
      });
      const data = await res.json();
      if (res.status === 401 && data.loginUrl) {
        window.location.href = data.loginUrl;
        return;
      }
      if (!res.ok) throw new Error(data.error || '下单失败');
      if (data.checkoutUrl) {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* noop */ }
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : '下单失败');
    } finally {
      setCheckingOut(false);
    }
  }

  /* ── 手围标尺 ─────────────────────────── */
  const rulerScrollRef = useRef<HTMLDivElement>(null);
  const rulerTrackRef = useRef<HTMLDivElement>(null);
  const rulerSyncing = useRef(false);
  const wristRef = useRef(wrist);
  wristRef.current = wrist;

  useEffect(() => {
    const scroll = rulerScrollRef.current;
    const track = rulerTrackRef.current;
    if (!scroll || !track) return;

    const setTo = (v: number, smooth: boolean) => {
      rulerSyncing.current = true;
      scroll.scrollTo({ left: (v - RULER_MIN) * PX_CM, behavior: smooth ? 'smooth' : 'auto' });
      setTimeout(() => { rulerSyncing.current = false; }, smooth ? 280 : 40);
    };

    const applyPad = () => {
      const pad = Math.max(0, scroll.clientWidth / 2 - PX_HALF / 2);
      track.style.paddingLeft = `${pad}px`;
      track.style.paddingRight = `${pad}px`;
      setTo(wristRef.current, false);
    };
    applyPad();
    window.addEventListener('resize', applyPad);

    let raf = 0;
    let snapT: ReturnType<typeof setTimeout> | null = null;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const v = RULER_MIN + scroll.scrollLeft / PX_CM;
        const clamped = Math.min(RULER_MAX, Math.max(RULER_MIN, Math.round(v * 10) / 10));
        setWrist(clamped);
        if (rulerSyncing.current) return;
        if (snapT) clearTimeout(snapT);
        snapT = setTimeout(() => {
          const snapped = Math.round(clamped * 2) / 2;
          setWrist(snapped);
          if (Math.abs(snapped - clamped) > 0.001) setTo(snapped, true);
        }, 180);
      });
    };
    scroll.addEventListener('scroll', onScroll);

    let dragging = false;
    let startX = 0;
    let startL = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      dragging = true;
      startX = e.clientX;
      startL = scroll.scrollLeft;
      scroll.setPointerCapture(e.pointerId);
      scroll.style.cursor = 'grabbing';
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      scroll.scrollLeft = startL - (e.clientX - startX);
    };
    const onUp = () => {
      dragging = false;
      scroll.style.cursor = 'grab';
    };
    scroll.addEventListener('pointerdown', onDown);
    scroll.addEventListener('pointermove', onMove);
    scroll.addEventListener('pointerup', onUp);
    scroll.addEventListener('pointercancel', onUp);

    return () => {
      window.removeEventListener('resize', applyPad);
      scroll.removeEventListener('scroll', onScroll);
      scroll.removeEventListener('pointerdown', onDown);
      scroll.removeEventListener('pointermove', onMove);
      scroll.removeEventListener('pointerup', onUp);
      scroll.removeEventListener('pointercancel', onUp);
      if (snapT) clearTimeout(snapT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rulerTicks = useMemo(() => {
    const ticks: Array<{ v: number; major: boolean }> = [];
    for (let v = RULER_MIN; v <= RULER_MAX + 0.001; v += 0.5) {
      ticks.push({ v, major: Math.abs(v - Math.round(v)) < 0.001 });
    }
    return ticks;
  }, []);

  /* ── 画布（SVG 圆环） ─────────────────── */
  const C = 170;
  const R = 118;
  const canvasScale = (2 * Math.PI * R) / Math.max(targetMm, totalMm + config.lengthCorrectionMm);

  const canvasNodes = useMemo(() => {
    const nodes: Array<{
      i: number;
      bead: DiyBead;
      x: number;
      y: number;
      arc: number;
      thetaDeg: number;
    }> = [];
    let acc = 0;
    design.forEach((code, i) => {
      const bead = beadByCode.get(code);
      if (!bead) return;
      const arc = bead.lengthMm * canvasScale;
      const midLen = acc + arc / 2;
      const theta = midLen / R - Math.PI / 2;
      nodes.push({
        i,
        bead,
        x: C + R * Math.cos(theta),
        y: C + R * Math.sin(theta),
        arc,
        thetaDeg: (theta * 180) / Math.PI + 90,
      });
      acc += arc;
    });
    return nodes;
  }, [design, beadByCode, canvasScale]);

  const usedMaterials = useMemo(() => {
    const map = new Map<string, DiyBead>();
    for (const code of design) {
      const bead = beadByCode.get(code);
      if (bead && !map.has(bead.material)) map.set(bead.material, bead);
    }
    return [...map.values()];
  }, [design, beadByCode]);

  /* ── 目录 ─────────────────────────────── */
  const catalogList = useMemo(() => beads.filter((b) => {
    const elOk = elFilter === '全部'
      ? true
      : elFilter === '配件'
        ? b.type !== 'crystal'
        : b.element === elFilter;
    return elOk && (sizeFilter === 0 || b.diameterMm === sizeFilter);
  }), [beads, elFilter, sizeFilter]);

  const selBead = selIdx >= 0 ? beadByCode.get(design[selIdx]) : undefined;

  if (!beads.length) {
    return (
      <div className="shop-diy-empty">
        <p>珠子目录暂时不可用，请稍后再试。</p>
      </div>
    );
  }

  return (
    <div className="shop-diy">
      <div className="shop-diy-layout">
        {/* ═══ 设计台 ═══ */}
        <section className="shop-diy-studio">
          <div className="shop-diy-wrist-head">
            <span className="shop-diy-wrist-label">手围尺寸 · 左右滑动标尺</span>
            <span className="shop-diy-wrist-value"><b>{wristText(wrist)}</b><small>cm</small></span>
          </div>
          <div className="shop-diy-ruler">
            <div className="shop-diy-ruler-scroll" ref={rulerScrollRef}>
              <div className="shop-diy-ruler-track" ref={rulerTrackRef}>
                {rulerTicks.map((t) => (
                  <div key={t.v} className={`shop-diy-tick${t.major ? ' is-major' : ''}`}>
                    <i />
                    {t.major ? <span>{Math.round(t.v)}</span> : null}
                  </div>
                ))}
              </div>
            </div>
            <div className="shop-diy-ruler-pointer" />
            <div className="shop-diy-ruler-fade is-l" />
            <div className="shop-diy-ruler-fade is-r" />
          </div>

          <div className="shop-diy-canvas-wrap">
            <svg className="shop-diy-canvas" viewBox="0 0 340 340" aria-label="手串预览">
              <defs>
                {usedMaterials.map((bead) => {
                  const c = beadColors(bead);
                  return (
                    <radialGradient key={bead.material} id={`diy-g-${bead.material}`} cx="35%" cy="30%" r="75%">
                      <stop offset="0%" stopColor={c.g0} />
                      <stop offset="55%" stopColor={c.g1} />
                      <stop offset="100%" stopColor={c.g2} />
                    </radialGradient>
                  );
                })}
              </defs>
              <circle cx={C} cy={C} r={R} fill="none" stroke="#e5e7eb" strokeWidth="1.5" strokeDasharray="4 6" />
              {canvasNodes.map((node) => {
                const { bead, i, x, y } = node;
                const c = beadColors(bead);
                const sel = i === selIdx;
                if (bead.type === 'disc') {
                  const w = Math.max((bead.thicknessMm ?? 2) * canvasScale, 3);
                  const h = bead.diameterMm * canvasScale * 0.94;
                  return (
                    <g key={i} transform={`rotate(${node.thetaDeg.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`}>
                      <rect
                        x={(x - w / 2).toFixed(1)}
                        y={(y - h / 2).toFixed(1)}
                        width={w.toFixed(1)}
                        height={h.toFixed(1)}
                        rx={(w / 2).toFixed(1)}
                        fill={`url(#diy-g-${bead.material})`}
                        stroke={sel ? '#171717' : c.line}
                        strokeWidth={sel ? 2.5 : 1}
                      />
                    </g>
                  );
                }
                const r = (bead.diameterMm * canvasScale) / 2 * 0.94;
                return (
                  <g key={i}>
                    <circle
                      cx={x.toFixed(1)}
                      cy={y.toFixed(1)}
                      r={r.toFixed(1)}
                      fill={`url(#diy-g-${bead.material})`}
                      stroke={sel ? '#171717' : c.line}
                      strokeWidth={sel ? 2.5 : 1}
                    />
                    <ellipse
                      cx={(x - r * 0.3).toFixed(1)}
                      cy={(y - r * 0.35).toFixed(1)}
                      rx={(r * 0.28).toFixed(1)}
                      ry={(r * 0.18).toFixed(1)}
                      fill="rgba(255,255,255,0.55)"
                      style={{ pointerEvents: 'none' }}
                    />
                  </g>
                );
              })}
              {/* 透明扩大点击区（隔珠/隔片太细不好点） */}
              {canvasNodes.map((node) => (
                <circle
                  key={`hit-${node.i}`}
                  cx={node.x.toFixed(1)}
                  cy={node.y.toFixed(1)}
                  r="12"
                  fill="transparent"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelIdx((cur) => (cur === node.i ? -1 : node.i))}
                />
              ))}
            </svg>
            {design.length === 0 ? (
              <div className="shop-diy-canvas-hint">
                <p>从下方选择珠子<br />开始你的设计</p>
              </div>
            ) : null}
          </div>

          <div className="shop-diy-stats">
            <div>
              <div className="shop-diy-stat-v">{design.length}<small> 颗</small></div>
              <div className="shop-diy-stat-k">珠子</div>
            </div>
            <div>
              <div className="shop-diy-stat-v">{crystalKinds}<small> 种</small></div>
              <div className="shop-diy-stat-k">水晶</div>
            </div>
            <div>
              <div className="shop-diy-stat-v">{design.length ? `${(effectiveMm / 10).toFixed(1)}cm` : '—'}</div>
              <div className="shop-diy-stat-k">预估手围</div>
            </div>
            <div>
              <div className={`shop-diy-stat-v${fit && fit !== '合适' ? ' is-warn' : ''}`}>{fit || '—'}</div>
              <div className="shop-diy-stat-k">合适度</div>
            </div>
          </div>
          <div className="shop-diy-fitbar">
            <i style={{ width: `${Math.min(100, (effectiveMm / targetMm) * 100)}%` }} />
          </div>

          {selBead ? (
            <div className="shop-diy-bead-actions">
              <span className="shop-diy-bead-actions-name">{selBead.name} · {sizeLabel(selBead)}</span>
              <button type="button" className="shop-diy-abtn" onClick={() => moveSelected(-1)}>← 左移</button>
              <button type="button" className="shop-diy-abtn" onClick={() => moveSelected(1)}>右移 →</button>
              <button type="button" className="shop-diy-abtn is-del" onClick={removeSelected}>删除</button>
            </div>
          ) : null}

          <div className="shop-diy-tools">
            <button type="button" className="shop-diy-tool is-primary" onClick={() => setBaziOpen(true)}>✦ 按八字推荐</button>
            <button type="button" className="shop-diy-tool" onClick={shuffleInspiration}>随机灵感</button>
            <button type="button" className="shop-diy-tool" onClick={clearAll}>清空</button>
          </div>
        </section>

        {/* ═══ 珠子目录 ═══ */}
        <section className="shop-diy-catalog">
          <div className="shop-diy-cat-head">
            <h2 className="shop-diy-cat-title">选择珠子</h2>
            <span className="shop-diy-cat-count">{catalogList.length} 款</span>
          </div>
          <div className="shop-diy-tabs">
            {EL_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                className={`shop-diy-tab${elFilter === tab ? ' is-on' : ''}`}
                onClick={() => setElFilter(tab)}
              >
                {tab === '全部' || tab === '配件' ? tab : `五行·${tab}`}
              </button>
            ))}
          </div>
          <div className="shop-diy-sizes">
            {SIZE_TABS.map((s) => (
              <button
                key={s}
                type="button"
                className={`shop-diy-chip${sizeFilter === s ? ' is-on' : ''}`}
                onClick={() => setSizeFilter(s)}
              >
                {s === 0 ? '全部尺寸' : `${s}mm`}
              </button>
            ))}
          </div>
          <div className="shop-diy-grid">
            {catalogList.map((bead) => {
              const c = beadColors(bead);
              const gradient = `radial-gradient(circle at 35% 30%, ${c.g0} 0%, ${c.g1} 55%, ${c.g2} 100%)`;
              const displayCents = resolvePriceCents(
                { priceCents: bead.priceCents, priceCentsUsd: bead.priceCentsUsd },
                currency,
              );
              return (
                <button type="button" key={bead.code} className="shop-diy-card" onClick={() => addBead(bead.code)}>
                  {bead.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bead.imageUrl} alt={bead.name} className="shop-diy-bead-img" />
                  ) : (
                    <div
                      className={`shop-diy-bead-vis${bead.type === 'disc' ? ' is-disc' : bead.type === 'spacer' ? ' is-small' : ''}`}
                      style={{ background: gradient }}
                    />
                  )}
                  <div className="shop-diy-card-nm">{bead.name}</div>
                  <div className="shop-diy-card-meta">{sizeLabel(bead)} · {formatShopPrice(displayCents, currency)}/颗</div>
                  <div className="shop-diy-card-tags">
                    {bead.type !== 'crystal' ? <span className="shop-diy-card-type">{TYPE_LABEL[bead.type]}</span> : null}
                    {bead.element ? <span className="shop-diy-card-el">五行·{bead.element}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ═══ 底部结算条 ═══ */}
      <div className="shop-diy-bar">
        <div className="shop-diy-bar-in">
          <div className="shop-diy-bar-price">
            <div className="shop-diy-bar-amount">{formatShopPrice(totalDisplayCents, currency)}</div>
            <div className="shop-diy-bar-note">
              {design.length === 0
                ? '开始设计你的手串'
                : belowMin
                  ? `最低金额 ${formatShopPrice(config.minOrderCents, 'cny')}`
                  : fit !== '合适'
                    ? `串长${fit || '不足'} · 请调整珠子或手围`
                    : '后端将按现价重新验算'}
            </div>
          </div>
          <button
            type="button"
            className="shop-diy-bar-cta"
            disabled={!canCheckout || checkingOut}
            onClick={() => void handleCheckout()}
          >
            {checkingOut ? '处理中…' : '立即下单'}
          </button>
        </div>
      </div>

      {/* ═══ 八字推荐弹层 ═══ */}
      {baziOpen ? (
        <div className="shop-diy-modal-mask" onClick={(e) => { if (e.target === e.currentTarget) setBaziOpen(false); }}>
          <div className="shop-diy-modal">
            <p className="shop-diy-modal-eyebrow">OraSage · Oracle + Sage</p>
            <h3 className="shop-diy-modal-title">看见，然后携带</h3>
            <p className="shop-diy-modal-sub">
              选择想调和的五行，为你生成一条基础配珠<br />（读取八字报告自动判断将在下一版本上线）
            </p>
            <div className="shop-diy-el-grid">
              {(['金', '木', '水', '火', '土'] as const).map((el) => (
                <button
                  key={el}
                  type="button"
                  className="shop-diy-el-btn"
                  onClick={() => { applyElementRecommend(el, wrist); setBaziOpen(false); }}
                >
                  <div className="shop-diy-el-zi">{el}</div>
                  <div className="shop-diy-el-nm">补{el}</div>
                </button>
              ))}
            </div>
            <button type="button" className="shop-diy-modal-close" onClick={() => setBaziOpen(false)}>暂不需要</button>
          </div>
        </div>
      ) : null}

      {toast ? <div className="shop-diy-toast">{toast}</div> : null}
    </div>
  );
}
