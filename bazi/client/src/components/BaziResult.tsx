/*
 * 八字排盘结果组件 v2
 * 墨金风格：命盘表格 + 五行柱状图 + 身强弱 + 喜忌神 + 神煞 + 大运 + 双人合盘
 */
import { useState, useRef, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { GOLD, GOLD_LIGHT, GOLD_FAINT, GOLD_GHOST, HEADING, BODY_CLR, BG_CARD, BG_PAGE, SERIF_F, SANS_F, CARD_BORDER, INK_DEEP } from "@/theme";
import {
  SingleBaziResult, DoubleBaziResult, ScoreDimension,
  DailyFortune,
  WU_XING_COLOR, WU_XING_BG, DI_ZHI_CANG_GAN,
  calcDailyFortune, recommendBracelet,
} from "@/lib/bazi";
import { PlanSelectionModal } from "@/components/PlanSelectionModal";
import { PaywallCard } from "@/components/PaywallCard";
import { useT } from "@/lib/i18n";
import { usePaymentFlow } from "@/_core/hooks/usePaymentFlow";
import type { PlanType } from "@shared/types";
import { extractSectionKeywords } from "@shared/section-keywords";
import { sanitizeReportBrandText } from "@shared/report-brand";
import { BaziConfiguredProductRecommend } from "@/components/BaziConfiguredProductRecommend";
import type { BraceletRecommendation } from "@/lib/bazi";

async function saveAsImage(el: HTMLElement, filename: string) {
  try {
    const html2canvas = (await import('html2canvas')).default;
    const contentCanvas = await html2canvas(el, {
      backgroundColor: INK_DEEP,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    // 创建最终画布（内容 + 底部水印条）
    const WATERMARK_H = 64; // 水印条高度（未缩放）
    const scale = 2;
    const wh = WATERMARK_H * scale;
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = contentCanvas.width;
    finalCanvas.height = contentCanvas.height + wh;

    const ctx = finalCanvas.getContext('2d')!;

    // 绘制内容
    ctx.drawImage(contentCanvas, 0, 0);

    // 水印条背景
    const barY = contentCanvas.height;
    ctx.fillStyle = INK_DEEP;
    ctx.fillRect(0, barY, finalCanvas.width, wh);

    // 分隔线
    ctx.strokeStyle = 'rgba(93,89,115,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barY);
    ctx.lineTo(finalCanvas.width, barY);
    ctx.stroke();

    // 绘制太极 SVG 图标（内联 SVG 转 Image）
    const svgSize = 28 * scale;
    const iconX = 28 * scale;
    const iconY = barY + (wh - svgSize) / 2;
    const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgSize}" height="${svgSize}" viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="46" stroke="rgba(196,160,78,0.35)" stroke-width="2"/>
      <path d="M50 4 A46 46 0 0 1 50 96 A23 23 0 0 1 50 50 A23 23 0 0 0 50 4Z" fill="rgba(196,160,78,0.12)"/>
      <circle cx="50" cy="27" r="11.5" fill="rgba(196,160,78,0.12)" stroke="#6F6880" stroke-width="1.5"/>
      <circle cx="50" cy="73" r="11.5" fill="rgba(196,160,78,0.05)" stroke="#6F6880" stroke-width="1.5"/>
      <circle cx="50" cy="27" r="4" fill="rgba(200,168,75,0.85)"/>
      <circle cx="50" cy="73" r="4" fill="rgba(93,89,115,0.5)"/>
    </svg>`;
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, iconX, iconY, svgSize, svgSize);
        URL.revokeObjectURL(svgUrl);
        resolve();
      };
      img.onerror = () => { URL.revokeObjectURL(svgUrl); resolve(); };
      img.src = svgUrl;
    });

    // 品牌名称 Orasage
    const textX = iconX + svgSize + 16 * scale;
    const centerY = barY + wh / 2;
    ctx.font = `600 ${18 * scale}px 'Georgia', 'Times New Roman', serif`;
    ctx.fillStyle = 'rgba(240,208,128,0.92)';
    ctx.textBaseline = 'middle';
    ctx.fillText('Orasage', textX, centerY - 6 * scale);

    // 副标题
    ctx.font = `400 ${10 * scale}px 'Arial', sans-serif`;
    ctx.fillStyle = '#78718B';
    ctx.fillText('orasage.com  ·  八字命盘 · 合盘分析', textX, centerY + 10 * scale);

    // 右侧真实二维码（qrcode 库生成）
    const qrSize = 44 * scale;
    const qrX = finalCanvas.width - qrSize - 20 * scale;
    const qrY = barY + (wh - qrSize) / 2;
    try {
      const QRCode = (await import('qrcode')).default;
      // 生成二维码到临时 canvas
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, 'https://orasage.com', {
        width: qrSize,
        margin: 1,
        color: {
          dark: GOLD,   // 金色模块
          light: INK_DEEP,
        },
      });
      ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
    } catch {
      // 生成失败时降级为占位框
      ctx.strokeStyle = 'rgba(93,89,115,0.5)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(qrX, qrY, qrSize, qrSize);
    }

    const link = document.createElement('a');
    link.download = filename;
    link.href = finalCanvas.toDataURL('image/png');
    link.click();
    toast.success('命盘图片已保存');
  } catch (e) {
    console.error(e);
    toast.error('保存失败，请截图保存');
  }
}
// ── 类型 ──────────────────────────────────────────────────────────────────────
interface SingleProps {
  result: SingleBaziResult;
  onBack: () => void;
  onStartDouble?: () => void;
}
interface DoubleProps {
  result: DoubleBaziResult;
  onBack: () => void;
}

// ── 常量 ──────────────────────────────────────────────────────────────────────
const PILLAR_LABELS_KEYS = ["pillar.year", "pillar.month", "pillar.day", "pillar.hour"];
// PILLAR_LABELS is now assigned per-component via useT()

// OraSage DS v1.1 — 颜色和字体从 theme.ts 导入，仅保留本地常量
const GOLD_DIM = "rgba(196,160,78,0.8)";
const SANS = "'Noto Sans SC', sans-serif";
const MUTED_CLR = "#6E6858";
const BORDER_CLR = "rgba(196,160,78,0.2)";
const HEADING_CLR = HEADING;
/** DS v1.1 卡片面（与 theme BG_CARD 一致） */
const CARD_SURFACE = BG_CARD;
/** 浅灰 → 白渐变（AI 解读、手串等非四柱区块） */
const CARD_GRADIENT = `linear-gradient(180deg, ${GOLD_GHOST} 0%, ${BG_CARD} 100%)`;
const CARD_GRADIENT_SOFT = `linear-gradient(135deg, ${GOLD_GHOST} 0%, ${BG_CARD} 100%)`;
/** 四柱深色锚点 — DS v1.1 对比区块 */
const PILLAR_SURFACE = INK_DEEP;
const TRACK_BG = "rgba(23,23,23,0.06)";
const DIVIDER_SUBTLE = "rgba(23,23,23,0.08)";

// ── 五行雷达图（SVG五边形） ──────────────────────────────────────────────────────
function WuXingRadar({
  data1, data2, name1, name2,
}: {
  data1: Record<string, number>;
  data2?: Record<string, number>;
  name1: string;
  name2?: string;
}) {
  const { term } = useT();
  const SIZE = 140;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 52;
  const LABELS = ['木', '火', '土', '金', '水'];
  // 五个顶点角度：从顶部(-90°)开始，顺时针
  const angles = LABELS.map((_, i) => (i * 72 - 90) * (Math.PI / 180));

  // 将五行值（0-5）归一化到 0-1
  const maxVal = 5;
  const toXY = (vals: Record<string, number>, idx: number) => {
    const v = Math.min(maxVal, vals[LABELS[idx]] ?? 0) / maxVal;
    return {
      x: CX + R * v * Math.cos(angles[idx]),
      y: CY + R * v * Math.sin(angles[idx]),
    };
  };

  const polyPoints = (vals: Record<string, number>) =>
    LABELS.map((_, i) => {
      const p = toXY(vals, i);
      return `${p.x},${p.y}`;
    }).join(' ');

  // 背景网格（20%, 40%, 60%, 80%, 100%）
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
      {/* 背景网格 */}
      {gridLevels.map((level) => (
        <polygon key={level}
          points={LABELS.map((_, i) => {
            const x = CX + R * level * Math.cos(angles[i]);
            const y = CY + R * level * Math.sin(angles[i]);
            return `${x},${y}`;
          }).join(' ')}
          fill="none"
          stroke="rgba(196,160,78,0.12)"
          strokeWidth="0.8"
        />
      ))}
      {/* 轴线 */}
      {LABELS.map((_, i) => (
        <line key={i}
          x1={CX} y1={CY}
          x2={CX + R * Math.cos(angles[i])}
          y2={CY + R * Math.sin(angles[i])}
          stroke="rgba(196,160,78,0.1)" strokeWidth="0.8"
        />
      ))}
      {/* 第二人数据（若有，先画底层） */}
      {data2 && (
        <polygon
          points={polyPoints(data2)}
          fill="rgba(96,165,250,0.12)"
          stroke="rgba(96,165,250,0.6)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      )}
      {/* 第一人数据 */}
      <polygon
        points={polyPoints(data1)}
        fill="rgba(196,160,78,0.2)"
        stroke="rgba(200,168,75,0.85)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* 标签 */}
      {LABELS.map((label, i) => {
        const lx = CX + (R + 14) * Math.cos(angles[i]);
        const ly = CY + (R + 14) * Math.sin(angles[i]);
        return (
          <text key={label} x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="10" fontWeight="700"
            fill={WU_XING_COLOR[label]}
          >{term(label)}</text>
        );
      })}
      {/* 数据点 */}
      {LABELS.map((_, i) => {
        const p = toXY(data1, i);
        return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgba(200,168,75,0.9)" />;
      })}
      {data2 && LABELS.map((_, i) => {
        const p = toXY(data2!, i);
        return <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="rgba(96,165,250,0.9)" />;
      })}
    </svg>
  );
}

// ── 合盘评分维度明细 ──────────────────────────────────────────────────────────
function ScoreDetailsPanel({ details }: { details: ScoreDimension[] }) {
  return (
    <div className="flex flex-col gap-2">
      {details.map((d) => {
        const pct = d.score;
        const color = pct >= 75 ? '#4ade80' : pct >= 55 ? GOLD : '#f87171';
        return (
          <div key={d.label}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold" style={{ color: BODY_CLR }}>{d.label}</span>
                <span className="text-[10px]" style={{ color: '#6F6880' }}>
                  ×{(d.weight * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px]" style={{ color: '#78718B' }}>{d.detail}</span>
                <span className="text-xs font-bold tabular-nums" style={{ color, minWidth: 28, textAlign: 'right' }}>{pct}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: TRACK_BG }}>
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── 子组件 ────────────────────────────────────────────────────────────────────

/** 通用信息卡片（用于命盘各区块展示） */
function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl px-4 py-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
      <h3 className="text-sm mb-3 flex items-center gap-2" style={{ color: BODY_CLR }}>
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}


function GanZhiCell({ gan, zhi, label, isDay, shiShen, dark }: {
  gan: string; zhi: string; label: string; isDay?: boolean; shiShen: Record<string, string>; dark?: boolean;
}) {
  const { t, term } = useT();
  const cangGan = DI_ZHI_CANG_GAN[zhi] ?? [];
  return (
    <div className={`flex flex-col items-center gap-1.5 flex-1 ${isDay ? "" : ""}`}>
      {isDay ? (
        <span className="text-xs font-bold mb-0.5 tracking-wider"
          style={{ color: dark ? "#DBC47A" : "#C4A04E", letterSpacing: "0.1em" }}>
          {t('pillar.day_master')}
        </span>
      ) : (
        /* 保持日主行高度与其他列对齐 */
        <div style={{ height: "1.25rem" }} />
      )}
      {/* 天干 */}
      <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold ${isDay && !dark ? "ring-2 ring-yellow-400/40" : ""}`}
        style={{ background: isDay ? (dark ? "rgba(196,160,78,0.15)" : "rgba(196,160,78,0.12)") : (dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.05)"), color: dark ? "#D4B86A" : GOLD, fontFamily: SERIF_F }}>
        {gan}
      </div>
      {/* 地支 */}
      <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl font-bold"
        style={{ background: dark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.05)", color: dark ? "#EDE8D8" : GOLD, fontFamily: SERIF_F }}>
        {zhi}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[9px]" style={{ color: dark ? "rgba(255,255,255,0.3)" : "rgba(93,89,115,0.4)" }}>{t('pillar.hidden')}</span>
        {cangGan.map((cg, i) => (
          <span key={i} className="text-[11px] px-1.5 py-0.5 rounded"
            style={{ background: dark ? "rgba(255,255,255,0.06)" : "#EFE9F5", color: dark ? "rgba(255,255,255,0.6)" : "#5D5973" }}>
            {cg}
          </span>
        ))}
      </div>
      <span className="text-xs" style={{ color: dark ? "rgba(255,255,255,0.45)" : "#6F6880" }}>{label}</span>
    </div>
  );
}

function WuXingBar({ label, value, max }: { label: string; value: number; max: number }) {
  const { term } = useT();
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = WU_XING_COLOR[label];
  const bg = WU_XING_BG[label];
  return (
    <div className="flex items-center gap-2">
      <span className="w-4 text-xs font-bold shrink-0" style={{ color }}>{term(label)}</span>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: TRACK_BG }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 5px ${color}40` }} />
      </div>
      <span className="w-8 text-xs text-right shrink-0" style={{ color: BODY_CLR }}>
        {value % 1 === 0 ? value : value.toFixed(1)}
      </span>
    </div>
  );
}

// ── 单人结果预览（计费墙前展示的内容）────────────────────────────────────────
function SingleResultBodyPreview({ result }: { result: SingleBaziResult }) {
  const { t, term } = useT();
  const pillarLabels = PILLAR_LABELS_KEYS.map(k => t(k));
  const pillars = [result.year, result.month, result.day, result.hour];
  const shenshaCnt = Object.keys(result.shensha ?? {}).length;
  const wxEntries = Object.entries(result.wuXing) as [string, number][];
  const totalWx = wxEntries.reduce((s, [, v]) => s + v, 0);
  return (
    <div className="flex flex-col gap-4">
      {/* 命盘头部 */}
      <div className="rounded-xl px-4 py-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>
              {result.name}
            </p>
            <p className="text-xs mt-0.5" style={{ color: BODY_CLR }}>
              {result.gender === "male" ? term('男命') : term('女命')} · {result.birthStr}
            </p>
            {result.birthCity && result.birthLng !== undefined && (
              <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "#78718B", fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {result.birthCity} · 东经{result.birthLng.toFixed(1)}°
                {result.trueSolarOffset !== undefined && result.trueSolarOffset !== 0 && (
                  <span style={{ color: result.trueSolarOffset > 0 ? "rgba(96,165,250,0.7)" : "rgba(251,191,36,0.7)" }}>
                    · 真太阳时{result.trueSolarOffset > 0 ? '+' : ''}{result.trueSolarOffset}分钟
                  </span>
                )}
                {result.trueSolarOffset === 0 && (
                  <span style={{ color: "#6F6880" }}>· 无需修正</span>
                )}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: MUTED_CLR }}>{t('pillar.day_master')}</p>
            <p className="text-2xl font-black" style={{ color: GOLD, fontFamily: SERIF_F }}>
              {result.riZhu}
            </p>
          </div>
        </div>
      </div>
      {/* 八字命盘 */}
      <InfoCard title={t('result.single.bazi')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      }>
        <div className="flex gap-2 justify-around pt-3">
          {pillars.map((p, i) => (
            <GanZhiCell key={i} gan={p.gan} zhi={p.zhi} label={pillarLabels[i]} isDay={i === 2} shiShen={result.shiShen} />
          ))}
        </div>
      </InfoCard>
      {/* 命局分析 */}
      <InfoCard title={t('result.bazi_analysis', '命局分析')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      }>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('pillar.day_master')}</span>
            <span className="text-lg font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.riZhu}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('result.strength', '强弱')}</span>
            <span className="text-base font-bold" style={{ color: result.strength === "身强" ? "#4ade80" : result.strength === "身弱" ? "#f87171" : GOLD }}>
              {result.strength === "身强" ? term('身强') : result.strength === "身弱" ? term('身弱') : result.strength}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('result.shensha', '神煞')}</span>
            <span className="text-base font-bold" style={{ color: GOLD }}>{shenshaCnt > 0 ? `${shenshaCnt}${t('result.items', '项')}` : t('result.none', '无')}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <p className="text-[10px] mb-1" style={{ color: "rgba(74,222,128,0.6)" }}>{t('result.favorable', '喜用神')}</p>
            <p className="text-sm font-bold" style={{ color: "#4ade80" }}>
              {result.favorable.length > 0 ? result.favorable.join(" / ") : t('result.balanced', '均衡')}
            </p>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <p className="text-[10px] mb-1" style={{ color: "rgba(248,113,113,0.6)" }}>{t('result.unfavorable', '忌神')}</p>
            <p className="text-sm font-bold" style={{ color: "#f87171" }}>
              {result.unfavorable.length > 0 ? result.unfavorable.join(" / ") : t('result.balanced', '均衡')}
            </p>
          </div>
        </div>
      </InfoCard>
      {/* 五行分析 */}
      <InfoCard title={t('result.wuxing', '五行分析')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      }>
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <WuXingRadar data1={result.wuXing as unknown as Record<string, number>} name1={result.name} />
          </div>
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {wxEntries.map(([label, value]) => (
              <WuXingBar key={label} label={label} value={value} max={totalWx} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,160,78,0.12)" }}>
          {wxEntries.sort((a, b) => b[1] - a[1]).map(([label, value]) => (
            <span key={label} className="text-xs px-2 py-1 rounded-full"
              style={{ background: WU_XING_BG[label], color: WU_XING_COLOR[label], border: `1px solid ${WU_XING_COLOR[label]}30` }}>
              {label} {value % 1 === 0 ? value : value.toFixed(1)}
            </span>
          ))}
        </div>
      </InfoCard>
    </div>
  );
}
// ── 计费墙组件 ────────────────────────────────────────────────────────────────
function PaywallOverlay({ onUnlock, onStartDouble, result }: { onUnlock: () => void; onStartDouble?: () => void; result: SingleBaziResult }) {
  const { t, term } = useT();
  return (
    <div className="relative overflow-hidden rounded-sm" style={{ marginTop: -8 }}>
      {/* 模糊遮挡层 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 10,
          background: `linear-gradient(to bottom, transparent 0%, rgba(250,250,248,0.75) 22%, rgba(250,250,248,0.98) 52%, ${BG_PAGE} 100%)`,
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-end",
          paddingBottom: 28,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {/* 锁图标 */}
        <div className="mb-3" style={{ opacity: 0.9 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        {/* 标题 */}
        <p className="text-base font-bold mb-1 text-center" style={{ color: GOLD, fontFamily: SERIF_F, letterSpacing: "0.12em" }}>
          {t('paywall.title_overlay', '完整命盘待解锁')}
        </p>
        <p className="text-xs text-center mb-5" style={{ color: "#6F6880", lineHeight: 1.7 }}>
          {t('paywall.subtitle_overlay', '大运排列、神煞分析、命理小结属于深度解读内容')}
          <br />{t('paywall.unlock_hint', '解锁后可查看完整命盘分析')}
        </p>
        {/* 解锁按钮 */}
        <button
          type="button"
          onClick={onUnlock}
          className="w-full py-3 rounded-sm text-sm font-bold tracking-widest transition-all active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`,
            color: "#ffffff",
            fontFamily: SERIF_F,
            letterSpacing: "0.18em",
            boxShadow: "0 0 18px #6F6880",
          }}
        >
          {t('paywall.unlock_trial', '解锁完整命盘 · 免费体验')}
        </button>
        {/* 与TA合盘按钮 */}
        {onStartDouble && (
          <button
            type="button"
            onClick={onStartDouble}
            className="w-full mt-2.5 py-2.5 rounded-sm text-sm font-bold tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            style={{
              background: "transparent",
              color: GOLD,
              border: `1px solid rgba(196,160,78,0.35)`,
              fontFamily: SERIF_F,
              letterSpacing: "0.12em",
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {t('result.double')}
          </button>
        )}
      </div>
      {/* 被遮挡的预览内容（模糊层下方） */}
      <div style={{ filter: "blur(3px)", pointerEvents: "none", userSelect: "none" }}>
        <div className="flex flex-col gap-4">
          {/* 大运预览 */}
          <div className="rounded-xl px-4 py-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
            <h3 className="text-sm mb-3" style={{ color: BODY_CLR }}>{t('result.da_yun', '大运排列')}</h3>
            <div className="grid grid-cols-4 gap-2">
              {["甲子","丙寅","戊辰","庚午"].map((s, i) => (
                <div key={i} className="flex flex-col items-center gap-1 rounded-lg py-2.5"
                  style={{ background: "rgba(196,160,78,0.08)", border: `1px solid rgba(196,160,78,0.2)` }}>
                  <span className="text-[10px]" style={{ color: "#6F6880" }}>{t('result.da_yun_label', '{n}运').replace('{n}', String(i+1))}</span>
                  <span className="text-base font-bold" style={{ color: GOLD }}>{s[0]}</span>
                  <span className="text-base font-bold" style={{ color: GOLD }}>{s[1]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* 命理小结预览 */}
          <div className="rounded-xl px-4 py-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
            <h3 className="text-sm mb-3" style={{ color: BODY_CLR }}>{t('result.summary', '命理小结')}</h3>
            <div className="space-y-2">
              <p className="text-xs" style={{ color: "#78718B", lineHeight: 1.8 }}>{result.mingLiSummary.overview}</p>
              <p className="text-xs" style={{ color: "#6F6880", lineHeight: 1.8 }}>✨ {result.mingLiSummary.personality.slice(0, 40)}……</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
// 单人结果主体（可复用于双人合盘中）
function SingleResultBody({ result, compact }: { result: SingleBaziResult; compact?: boolean }) {
  const { t, term } = useT();
  const pillars = [result.year, result.month, result.day, result.hour];
  const pillarLabels = PILLAR_LABELS_KEYS.map(k => t(k));
  const wxEntries = Object.entries(result.wuXing) as [string, number][];
  const maxWx = Math.max(...wxEntries.map(([, v]) => v), 1);
  const totalWx = wxEntries.reduce((s, [, v]) => s + v, 0);
  const shenshaCnt = Object.keys(result.shensha).length;

  return (
    <div className="flex flex-col gap-3">
      {/* 身份信息 — 仅在 compact 模式显示，否则顶部头部已展示 */}
      {compact && (
        <div className="rounded-xl px-5 py-3.5" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}`, backdropFilter: "blur(4px)" }}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.name}</h2>
              <p className="text-xs mt-0.5" style={{ color: "#6F6880" }}>
                {result.gender === "male" ? term('男命') : term('女命')} · {result.birthStr}
              </p>
              {result.birthCity && result.birthLng !== undefined && (
                <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: MUTED_CLR, fontSize: "0.67rem", letterSpacing: "0.05em" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {result.birthCity} · 东经{result.birthLng.toFixed(1)}°
                  {result.trueSolarOffset !== undefined && result.trueSolarOffset !== 0 && (
                    <span style={{ color: result.trueSolarOffset > 0 ? "rgba(96,165,250,0.7)" : "rgba(251,191,36,0.7)" }}>
                      · 真太阳时{result.trueSolarOffset > 0 ? '+' : ''}{result.trueSolarOffset}分钟
                    </span>
                  )}
                  {result.trueSolarOffset === 0 && (
                    <span style={{ color: "rgba(93,89,115,0.5)" }}>· 无需修正</span>
                  )}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: MUTED_CLR }}>{t('pillar.day_master')}</p>
              <p className="text-2xl font-black" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.riZhu}</p>
            </div>
          </div>
        </div>
      )}

      {/* 八字命盘 */}
      <InfoCard title={t('result.single.bazi')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
        </svg>
      }>
        <div className="flex gap-2 justify-around pt-3">
          {pillars.map((p, i) => (
            <GanZhiCell key={i} gan={p.gan} zhi={p.zhi} label={pillarLabels[i]} isDay={i === 2} shiShen={result.shiShen} />
          ))}
        </div>
      </InfoCard>

      {/* 身强弱 + 喜忌神 */}
      <InfoCard title={t('result.bazi_analysis', '命局分析')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      }>
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('pillar.day_master')}</span>
            <span className="text-lg font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.riZhu}</span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('result.strength', '强弱')}</span>
            <span className="text-base font-bold" style={{ color: result.strength === '身强' ? '#4ade80' : result.strength === '身弱' ? '#f87171' : GOLD }}>
              {result.strength === "身强" ? term('身强') : result.strength === "身弱" ? term('身弱') : result.strength}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 rounded-lg py-2.5"
            style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
            <span className="text-[10px]" style={{ color: "#78718B" }}>{t('result.shensha', '神煞')}</span>
            <span className="text-base font-bold" style={{ color: GOLD }}>{shenshaCnt > 0 ? `${shenshaCnt}${t('result.items', '项')}` : t('result.none', '无')}</span>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)" }}>
            <p className="text-[10px] mb-1" style={{ color: "rgba(74,222,128,0.6)" }}>{t('result.favorable', '喜用神')}</p>
            <p className="text-sm font-bold" style={{ color: "#4ade80" }}>
              {result.favorable.length > 0 ? result.favorable.join(' / ') : t('result.balanced', '均衡')}
            </p>
          </div>
          <div className="rounded-lg px-3 py-2" style={{ background: "rgba(248,113,113,0.06)", border: "1px solid rgba(248,113,113,0.2)" }}>
            <p className="text-[10px] mb-1" style={{ color: "rgba(248,113,113,0.6)" }}>{t('result.unfavorable', '忌神')}</p>
            <p className="text-sm font-bold" style={{ color: "#f87171" }}>
              {result.unfavorable.length > 0 ? result.unfavorable.join(' / ') : t('result.balanced', '均衡')}
            </p>
          </div>
        </div>
      </InfoCard>

      {/* 五行分析 */}
      <InfoCard title={t('result.wuxing', '五行分析')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      }>
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <WuXingRadar data1={result.wuXing as unknown as Record<string, number>} name1={result.name} />
          </div>
          <div className="flex-1 flex flex-col gap-2 min-w-0">
            {wxEntries.map(([label, value]) => (
              <WuXingBar key={label} label={label} value={value} max={totalWx} />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,160,78,0.12)" }}>
          {wxEntries.sort((a, b) => b[1] - a[1]).map(([label, value]) => (
            <span key={label} className="text-xs px-2 py-1 rounded-full"
              style={{ background: WU_XING_BG[label], color: WU_XING_COLOR[label], border: `1px solid ${WU_XING_COLOR[label]}30` }}>
              {label} {value % 1 === 0 ? value : value.toFixed(1)}
            </span>
          ))}
        </div>
      </InfoCard>

      {/* 神煞 */}
      {shenshaCnt > 0 && (
        <InfoCard title={t('result.shensha', '神煞')} icon={
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        }>
          <div className="flex flex-wrap gap-2">
            {Object.entries(result.shensha).map(([name, vals]) => (
              <div key={name} className="rounded-lg px-3 py-2" style={{ background: "rgba(196,160,78,0.08)", border: `1px solid ${GOLD_FAINT}` }}>
                <p className="text-[10px]" style={{ color: BODY_CLR }}>{name}</p>
                <p className="text-sm font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>
                  {vals.join(' ')}
                </p>
              </div>
            ))}
          </div>
        </InfoCard>
      )}

      {/* 大运 */}
      <InfoCard title={t('result.da_yun', '大运排列')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      }>
        <div className="grid grid-cols-4 gap-2">
          {result.daYun.map((dy, i) => (
            <div key={i} className="flex flex-col items-center gap-1 rounded-lg py-2.5"
              style={{ background: i === 0 ? GOLD_GHOST : TRACK_BG, border: `1px solid ${i === 0 ? GOLD_FAINT : DIVIDER_SUBTLE}` }}>
              <span className="text-[10px]" style={{ color: "#6F6880" }}>{dy.label}</span>
              <span className="text-base font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>{dy.gan}</span>
              <span className="text-base font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>{dy.zhi}</span>
            </div>
          ))}
        </div>
      </InfoCard>

      {/* 命理小结 */}
      <InfoCard title={t('result.summary', '命理小结')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      }>
        <div className="space-y-4">
          {/* 命局概述 */}
          <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(196,160,78,0.07)', border: '1px solid rgba(196,160,78,0.2)' }}>
            <p className="text-xs leading-relaxed" style={{ color: BODY_CLR }}>{result.mingLiSummary.overview}</p>
          </div>
          {/* 三维解读 */}
          {([
            { label: t('report.character', '性格特征'), icon: '✨', text: result.mingLiSummary.personality },
            { label: t('report.career', '事业方向'), icon: '⛄', text: result.mingLiSummary.career },
            { label: t('report.relationship', '感情倾向'), icon: '♥', text: result.mingLiSummary.relationship },
          ] as const).map(({ label, icon, text }) => (
            <div key={label}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="text-[10px]">{icon}</span>
                <span className="text-[11px] font-semibold tracking-widest" style={{ color: GOLD }}>{label}</span>
              </div>
              <p className="text-xs leading-relaxed pl-4" style={{ color: GOLD_DIM, borderLeft: '2px solid rgba(196,160,78,0.22)' }}>{text}</p>
            </div>
          ))}
          {/* 运势提示 */}
          <div className="rounded-lg px-4 py-3" style={{ background: 'rgba(196,160,78,0.05)', border: '1px solid rgba(196,160,78,0.12)' }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px]">★</span>
              <span className="text-[11px] font-semibold tracking-widest" style={{ color: 'rgba(196,160,78,0.8)' }}>{t('report.fortune_tip', '运势提示')}</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#78718B' }}>{result.mingLiSummary.fortune}</p>
          </div>
          <p className="text-[10px] pt-0.5" style={{ color: 'rgba(93,89,115,0.45)' }}>
            {t('report.disclaimer', '※ 以上分析仅供参考，命理之道博大精深，如需深度解读请咨询专业命理师。')}
          </p>
        </div>
      </InfoCard>
    </div>
  );
}

// ── 今日运势卡片 ────────────────────────────────────────────────────────────────
function DailyFortuneCard({ fortune }: { fortune: DailyFortune }) {
  const { t, term } = useT();
  const scoreColor = fortune.overallScore >= 85 ? '#4ade80'
    : fortune.overallScore >= 70 ? GOLD
    : fortune.overallScore >= 50 ? GOLD_DIM
    : '#f87171';
  const labelBg: Record<string, string> = {
    '大吉': 'rgba(74,222,128,0.12)', '吉': 'rgba(196,160,78,0.1)',
    '平': 'rgba(196,160,78,0.08)', '小凶': 'rgba(248,113,113,0.08)', '凶': 'rgba(248,113,113,0.14)',
  };
  return (
    <InfoCard title={t('result.daily_fortune', '今日运势')} icon={
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5"/>
        <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
        <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
      </svg>
    }>
      <div className="space-y-4">
        {/* 日期和日柱 */}
        <div className="flex items-center justify-between">
          <span className="text-xs" style={{ color: BODY_CLR }}>{fortune.date}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs" style={{ color: '#6F6880' }}>{t('result.today_pillar', '今日日柱')}</span>
            <span className="text-lg font-bold" style={{ color: GOLD, fontFamily: SERIF_F, letterSpacing: '0.1em' }}>
              {fortune.todayGan}{fortune.todayZhi}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(196,160,78,0.12)', color: GOLD_DIM }}>{fortune.todayWx}行</span>
          </div>
        </div>
        {/* 综合得分 */}
        <div className="flex items-center gap-4 rounded-lg px-4 py-3" style={{ background: labelBg[fortune.overallLabel] ?? 'rgba(196,160,78,0.08)', border: '1px solid rgba(196,160,78,0.2)' }}>
          <div className="text-center" style={{ minWidth: 56 }}>
            <div className="text-3xl font-bold" style={{ color: scoreColor, fontFamily: SERIF_F }}>{fortune.overallScore}</div>
            <div className="text-xs mt-0.5 font-semibold tracking-widest" style={{ color: scoreColor }}>{fortune.overallLabel}</div>
          </div>
          <p className="text-xs leading-relaxed flex-1" style={{ color: BODY_CLR }}>{fortune.overallTip}</p>
        </div>
        {/* 四维度 */}
        <div className="grid grid-cols-2 gap-2">
          {fortune.dimensions.map(dim => {
            const dc = dim.score >= 70 ? '#4ade80' : dim.score >= 50 ? GOLD : '#f87171';
            return (
              <div key={dim.label} className="rounded-lg px-3 py-2.5" style={{ background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(196,160,78,0.12)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold" style={{ color: GOLD }}>{dim.label}</span>
                  <span className="text-[11px] font-bold" style={{ color: dc }}>{dim.score}</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 3, background: 'rgba(196,160,78,0.1)' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${dim.score}%`, background: dc }} />
                </div>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: '#78718B' }}>{dim.tip}</p>
              </div>
            );
          })}
        </div>
        {/* 幸运提示 */}
        <div className="flex items-center gap-4 text-xs" style={{ color: BODY_CLR }}>
          <span>✨ {t('result.lucky_color', '幸运颜色')}：<span style={{ color: GOLD }}>{fortune.luckyColor}</span></span>
          <span>★ {t('result.lucky_direction', '幸运方位')}：<span style={{ color: GOLD }}>{fortune.luckyDirection}</span></span>
        </div>
        {/* 宜忌 */}
        <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(196,160,78,0.35)', borderTop: '1px solid rgba(196,160,78,0.12)', paddingTop: 10 }}>{fortune.avoidTip}</p>
      </div>
    </InfoCard>
  );
}

// ── 打字机动画 Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string | undefined, speed = 18) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      return;
    }
    // Reset to empty immediately when new text arrives
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i += 3; // advance 3 chars per tick for snappy feel
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return displayed;
}

// ── 命理解读面板 ──────────────────────────────────────────────────────────────

/** 八卦装饰符 SVG */
function BaguaDecor({ size = 20, opacity = 0.35 }: { size?: number; opacity?: number }) {
  const degs = [0,45,90,135,180,225,270,315];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ opacity }}>
      <circle cx="50" cy="50" r="44" stroke="rgba(200,168,75,1)" strokeWidth="2"/>
      <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(93,89,115,0.45)"/>
      <circle cx="50" cy="28" r="11" fill="rgba(196,160,78,0.22)" />
      <circle cx="50" cy="72" r="11" fill="rgba(196,160,78,0.08)" />
      <circle cx="50" cy="28" r="4" fill="rgba(200,168,75,0.9)" />
      <circle cx="50" cy="72" r="4" fill="rgba(93,89,115,0.5)" />
      {degs.map((deg, i) => (
        <g key={i} transform={`rotate(${deg} 50 50)`}>
          <line x1="50" y1="2" x2="50" y2="10" stroke="rgba(200,168,75,1)" strokeWidth="2.5" strokeLinecap="round"/>
        </g>
      ))}
    </svg>
  );
}

/** 装饰分隔线 — 杂志风格 */
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-2">
      <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.3))" }} />
      <svg width="16" height="16" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.5 }}>
        <circle cx="50" cy="50" r="46" stroke="rgba(200,168,75,0.6)" strokeWidth="2"/>
        <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(196,160,78,0.15)" />
        <circle cx="50" cy="28" r="4" fill="rgba(200,168,75,0.7)" />
      </svg>
      <div style={{ flex: 1, maxWidth: 80, height: 1, background: "linear-gradient(90deg, rgba(200,168,75,0.3), transparent)" }} />
    </div>
  );
}

// ─── 章节风格配置 ──────────────────────────────────────────────────────────────

const CHAPTER_NUMERALS = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌'];

/** 每个章节的专属配色（颜色更实、更有区分度） */
const SECTION_STYLE_MAP: Record<string, {
  accent: string; bar: string; numeralBg: string; bg: string; border: string; dotColor: string;
}> = {
  total:     { accent: '#C4A04E', bar: '#C4A04E', numeralBg: 'rgba(196,160,78,0.12)', bg: 'linear-gradient(180deg, rgba(196,160,78,0.05) 0%, transparent 100%)', border: 'rgba(196,160,78,0.15)', dotColor: '#C4A04E' },
  character: { accent: '#4AB478', bar: '#4AB478', numeralBg: 'rgba(74,180,120,0.12)', bg: 'linear-gradient(180deg, rgba(74,180,120,0.05) 0%, transparent 100%)', border: 'rgba(74,180,120,0.15)', dotColor: '#4AB478' },
  career:    { accent: '#B48C3C', bar: '#B48C3C', numeralBg: 'rgba(180,140,60,0.12)', bg: 'linear-gradient(180deg, rgba(180,140,60,0.05) 0%, transparent 100%)', border: 'rgba(180,140,60,0.15)', dotColor: '#B48C3C' },
  relation:  { accent: '#C85064', bar: '#C85064', numeralBg: 'rgba(200,80,100,0.12)', bg: 'linear-gradient(180deg, rgba(200,80,100,0.05) 0%, transparent 100%)', border: 'rgba(200,80,100,0.15)', dotColor: '#C85064' },
  health:    { accent: '#3CA0C8', bar: '#3CA0C8', numeralBg: 'rgba(60,160,200,0.12)', bg: 'linear-gradient(180deg, rgba(60,160,200,0.05) 0%, transparent 100%)', border: 'rgba(60,160,200,0.15)', dotColor: '#3CA0C8' },
  fortune:   { accent: '#A064C8', bar: '#A064C8', numeralBg: 'rgba(160,100,200,0.12)', bg: 'linear-gradient(180deg, rgba(160,100,200,0.05) 0%, transparent 100%)', border: 'rgba(160,100,200,0.15)', dotColor: '#A064C8' },
  summary:   { accent: '#C4A04E', bar: '#C4A04E', numeralBg: 'rgba(196,160,78,0.12)', bg: 'linear-gradient(180deg, rgba(196,160,78,0.05) 0%, transparent 100%)', border: 'rgba(196,160,78,0.15)', dotColor: '#C4A04E' },
};

function getSectionStyle(title: string) {
  const t = title;
  if (t.includes("总览") || t.includes("总评") || t.includes("缘分")) return SECTION_STYLE_MAP.total;
  if (t.includes("性格") || t.includes("天赋") || t.includes("互动")) return SECTION_STYLE_MAP.character;
  if (t.includes("事业") || t.includes("财富")) return SECTION_STYLE_MAP.career;
  if (t.includes("感情") || t.includes("关系") || t.includes("婚姻")) return SECTION_STYLE_MAP.relation;
  if (t.includes("健康") || t.includes("能量") || t.includes("五行")) return SECTION_STYLE_MAP.health;
  if (t.includes("大运") || t.includes("指引") || t.includes("建议") || t.includes("功课")) return SECTION_STYLE_MAP.fortune;
  if (t.includes("一句话") || t.includes("总结")) return SECTION_STYLE_MAP.summary;
  return SECTION_STYLE_MAP.total;
}

// ─── 章节图标映射 ────────────────────────────────────────────────────────────────

const SECTION_ICONS: Record<string, React.ReactElement> = {
  default: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
};

function getSectionIcon(title: string): React.ReactElement {
  const t = title;
  if (t.includes("总览") || t.includes("总评") || t.includes("缘分")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    );
  }
  if (t.includes("性格") || t.includes("天赋") || t.includes("互动")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    );
  }
  if (t.includes("事业") || t.includes("财富")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    );
  }
  if (t.includes("感情") || t.includes("关系") || t.includes("婚姻")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    );
  }
  if (t.includes("健康") || t.includes("能量") || t.includes("五行")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    );
  }
  if (t.includes("大运") || t.includes("指引") || t.includes("建议") || t.includes("功课")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    );
  }
  if (t.includes("一句话") || t.includes("总结")) {
    return (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    );
  }
  return SECTION_ICONS.default;
}

/** 从内容中提取关键词标签 — 见 @shared/section-keywords */
function extractKeywords(content: string, sectionTitle?: string): string[] {
  return extractSectionKeywords(content, sectionTitle);
}

/** 从内容中提取引言（第一句话） */
function extractQuote(content: string): string {
  const firstSentence = content.split(/[。！？\n]/)[0];
  if (firstSentence && firstSentence.length >= 8 && firstSentence.length <= 40) {
    return firstSentence.trim();
  }
  return "";
}

/** 五行能量环形图（SVG 圆环）*/
const WX_RING_COLORS: Record<string, string> = { 木: '#4AB478', 火: '#DC6B6B', 土: '#C49B3C', 金: '#A0A8B8', 水: '#5A9BC8' };
const WX_ORDER = ['木', '火', '土', '金', '水'];
function WuXingRing({ values }: { values?: Record<string, number> }) {
  const { t } = useT();
  const data = values && Object.keys(values).length === 5 ? values : { 木: 5, 火: 5, 土: 5, 金: 5, 水: 5 };
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 25;
  let cumulative = 0;
  const segments = WX_ORDER.map((wx) => {
    const pct = (data[wx] || 0) / total;
    const start = cumulative;
    cumulative += pct;
    return { wx, pct, start, color: WX_RING_COLORS[wx], value: data[wx] || 0 };
  });

  const R = 40, CX = 50, CY = 50, STROKE_W = 10;
  const circ = 2 * Math.PI * R;

  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <p className="text-xs font-bold" style={{ color: "#3CA0C8", fontFamily: "'Noto Serif SC', serif", letterSpacing: "0.12em" }}>{t('result.wuxing_energy', '五行能量分布')}</p>
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)" }}>
        {segments.map((s) => (
          <circle key={s.wx} cx={CX} cy={CY} r={R} fill="none"
            stroke={s.color} strokeWidth={STROKE_W} strokeDasharray={`${s.pct * circ} ${circ}`}
            strokeDashoffset={-s.start * circ} strokeLinecap="round" opacity={0.8} />
        ))}
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(196,160,78,0.08)" strokeWidth={STROKE_W} />
      </svg>
      <div className="flex gap-3 flex-wrap justify-center">
        {segments.map((s) => (
          <div key={s.wx} className="flex items-center gap-1">
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: s.color, opacity: 0.8 }} />
            <span style={{ fontSize: "0.6rem", color: "#6F6880", fontFamily: "'Noto Sans SC', sans-serif" }}>
              {s.wx} {s.value.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** 大卡片瀑布章节 — 每章正文拆成段落卡片 + 大字标题 */
function SectionCard({
  index, title, content, isOpen, onToggle,
  G_MID, G_DIM, G_FAINT, G_GHOST, SERIF, isLast, wuXing,
}: {
  index: number;
  title: string;
  content: string;
  isOpen: boolean;
  onToggle: () => void;
  G_MID: string;
  G_DIM: string;
  G_FAINT: string;
  G_GHOST: string;
  SERIF: string;
  isLast: boolean;
  wuXing?: Record<string, number>;
}) {
  const { t } = useT();
  const keywords = extractKeywords(content, title);
  const quote = extractQuote(content);
  const style = getSectionStyle(title);
  const numeral = CHAPTER_NUMERALS[index] || String(index + 1);

  // 按空行拆段落
  const paragraphs = content.split(/\n\s*\n/).filter(Boolean);

  return (
    <div style={{
      borderBottom: isLast ? "none" : `1px solid ${DIVIDER_SUBTLE}`,
      transition: "all 0.3s ease",
    }}>
      {/* 可点击的标题栏 */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-5 py-5 transition-all active:scale-[0.99]"
        style={{ textAlign: "left" }}
      >
        {/* 色点 */}
        <div style={{
          flexShrink: 0, width: 10, height: 10, borderRadius: "50%",
          background: style.accent, opacity: isOpen ? 1 : 0.35,
          transition: "opacity 0.3s",
        }} />
        <span style={{
          flex: 1, fontFamily: SERIF,
          fontSize: "1.125rem", fontWeight: 600,
          letterSpacing: "0.08em",
          color: isOpen ? HEADING : BODY_CLR,
          transition: "color 0.3s",
        }}>
          {title}
        </span>
        <span style={{
          fontSize: "0.875rem", color: "rgba(93,89,115,0.35)",
          fontFamily: SERIF,
          transition: "transform 0.3s",
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
        }}>
          ▼
        </span>
      </button>

      {/* 展开后的段落卡片流 */}
      <div style={{
        maxHeight: isOpen ? 4000 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "max-height 0.5s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease",
      }}>
        <div className="px-5 pb-6 flex flex-col gap-3" style={{ animation: isOpen ? "fade-in-up 0.3s ease-out both" : "none" }}>
          {/* 引言 → 独立浅卡 */}
          {quote && (
            <div style={{
              padding: "0.875rem 1rem",
              background: style.numeralBg,
              borderLeft: `3px solid ${style.accent}`,
              borderRadius: "0 10px 10px 0",
            }}>
              <p style={{
                fontFamily: SERIF, fontSize: "0.9rem", color: style.accent,
                lineHeight: 1.7, fontStyle: "italic",
                margin: 0,
              }}>
                &ldquo;{quote}&rdquo;
              </p>
            </div>
          )}

          {/* 正文拆成段落卡片 */}
          {paragraphs.map((para, pi) => (
            <div key={pi} style={{
              padding: "1rem 1.125rem",
              background: BG_CARD,
              borderRadius: "12px",
              border: `1px solid ${CARD_BORDER}`,
              boxShadow: "0 1px 4px rgba(23,23,23,0.04)",
            }}>
              <div style={{
                color: BODY_CLR,
                fontSize: "1rem",
                lineHeight: 1.95,
                fontFamily: "'Noto Serif SC', serif",
                letterSpacing: "0.04em",
              }}>
                <Streamdown>{sanitizeReportBrandText(para)}</Streamdown>
              </div>
            </div>
          ))}

          {/* 关键词标签 → 轻量圆点 */}
          {keywords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap" style={{ padding: "0.25rem 0" }}>
              {keywords.map((kw, i) => (
                <span key={i} style={{
                  fontSize: "0.6875rem",
                  color: style.accent,
                  fontFamily: SERIF,
                  padding: "0.125rem 0.5rem",
                  borderRadius: 999,
                  background: "rgba(196,160,78,0.08)",
                  border: `1px solid rgba(196,160,78,0.18)`,
                }}>
                  {kw}
                </span>
              ))}
            </div>
          )}

          {/* 五行圆环 */}
          {title.includes("健康") && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${DIVIDER_SUBTLE}` }}>
              <WuXingRing values={wuXing} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



function AIAnalysisPanel({
  resultData,
  type,
  autoTrigger = false,
  onReportReady,
}: {
  resultData: Record<string, unknown>;
  type: "single" | "couple";
  autoTrigger?: boolean;
  /** 报告生成完毕后的回调，传入 reportContent 和 sections */
  onReportReady?: (reportContent: string, sections: Array<{ title: string; content: string }>) => void;
}) {
  const { t, locale } = useT();
  const [open, setOpen] = useState(autoTrigger);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const analyzeMutation = trpc.bazi.analyze.useMutation({
    onSuccess: (data) => {
      setLoadingStep(0);
      // 报告生成完毕 → 通知父组件（用于推送到用户中心）
      if (onReportReady && data?.report) {
        onReportReady(data.report, data.sections ?? []);
      }
    },
    onError: (err) => {
      toast.error(t('report.error_prefix', '解读报告生成失败：') + err.message);
      setLoadingStep(0);
    },
  });

  const sections = analyzeMutation.data?.sections as Array<{ title: string; content: string }> | undefined;
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));
  const toggleSection = (idx: number) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // 自动触发：付费后自动开始解读
  useEffect(() => {
    if (autoTrigger && !hasTriggered && !analyzeMutation.data && !analyzeMutation.isPending) {
      setHasTriggered(true);
      setOpen(true);
      analyzeMutation.mutate({ type, lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR", resultData });
    }
  }, [autoTrigger, hasTriggered, analyzeMutation.data, analyzeMutation.isPending]);

  // 加载步骤动画
  useEffect(() => {
    if (!analyzeMutation.isPending) return;
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [analyzeMutation.isPending]);

  const loadingSteps = [t('report.loading.step.1'), t('report.loading.step.2'), t('report.loading.step.3'), t('report.loading.step.4'), t('report.loading.step.5')];

  const G_MID = GOLD;
  const G_DIM = GOLD_DIM;
  const G_FAINT = GOLD_FAINT;
  const G_GHOST = "rgba(196,160,78,0.08)";
  const SERIF = SERIF_F;

  // 如果非自动触发且未打开，返回 null
  if (!open && !autoTrigger) return null;

  // 自动触发但尚未打开，显示加载
  if (!open && autoTrigger) {
    return (
      <div className="flex flex-col items-center gap-4 py-8"
        style={{ border: `1px solid ${G_FAINT}`, background: BG_CARD, borderRadius: "16px" }}>
        <div className="relative" style={{ width: 48, height: 48 }}>
          <svg width="48" height="48" viewBox="0 0 100 100" fill="none" className="animate-spin" style={{ animationDuration: "3s" }}>
            <circle cx="50" cy="50" r="44" stroke={G_FAINT} strokeWidth="1.5" />
            <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(196,160,78,0.15)" />
            <circle cx="50" cy="28" r="4" fill={G_MID} />
            <circle cx="50" cy="72" r="4" fill={G_FAINT} />
          </svg>
        </div>
        <p style={{ color: G_DIM, fontFamily: SERIF, fontSize: "0.875rem", letterSpacing: "0.2em" }}>
          {t('report.loading.main')}
        </p>
      </div>
    );
  }

  if (!open) return null;

  return (
    <div className="overflow-hidden" style={{
      background: BG_CARD,
      borderRadius: "16px",
      boxShadow: "0 1px 3px rgba(23,23,23,0.04), 0 4px 24px rgba(184,148,63,0.08)",
    }}>
      {/* ── 内容区 ── */}
      <div>
        {/* 杂志风加载动画 */}
        {analyzeMutation.isPending && (
          <div className="flex flex-col items-center justify-center gap-6 py-14 px-6" style={{
            background: CARD_GRADIENT,
            minHeight: 320,
            position: "relative",
            overflow: "hidden",
          }}>
            {/* 中心太极旋转 */}
            <div className="relative" style={{ width: 72, height: 72 }}>
              <svg width="72" height="72" viewBox="0 0 100 100" fill="none"
                className="animate-spin" style={{ animationDuration: "6s", position: "absolute" }}>
                <circle cx="50" cy="50" r="48" stroke="rgba(196,160,78,0.15)" strokeWidth="0.8" strokeDasharray="3 6"/>
              </svg>
              <svg width="72" height="72" viewBox="0 0 100 100" fill="none"
                className="animate-spin" style={{ animationDuration: "3s", position: "absolute" }}>
                <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(196,160,78,0.2)"/>
                <circle cx="50" cy="28" r="10" fill="rgba(196,160,78,0.08)"/>
                <circle cx="50" cy="72" r="10" fill="rgba(196,160,78,0.04)"/>
                <circle cx="50" cy="28" r="3.5" fill={G_MID}/>
                <circle cx="50" cy="72" r="3.5" fill={GOLD_FAINT}/>
              </svg>
            </div>

            {/* 主步骤文字 */}
            <div className="flex flex-col items-center gap-1" style={{ zIndex: 1 }}>
              <p style={{ color: GOLD, fontFamily: SERIF, fontSize: "1rem", letterSpacing: "0.4em", fontWeight: 600 }}>
                {loadingSteps[loadingStep]}
              </p>
              <p style={{ color: MUTED_CLR, fontSize: "0.6rem", letterSpacing: "0.2em", marginTop: "0.25rem" }}>
                {t('report.loading.subtitle')}
              </p>
            </div>

            {/* 进度线轨道 */}
            <div className="flex gap-0 items-center" style={{ zIndex: 1 }}>
              {loadingSteps.map((step, i) => (
                <div key={i} className="flex items-center">
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.4rem",
                    background: i <= loadingStep ? GOLD_GHOST : TRACK_BG,
                    border: `2px solid ${i <= loadingStep ? GOLD : DIVIDER_SUBTLE}`,
                    color: i <= loadingStep ? GOLD : MUTED_CLR,
                    boxShadow: i <= loadingStep ? `0 0 8px ${GOLD_FAINT}` : "none",
                  }}>
                    {i <= loadingStep ? "✓" : ""}
                  </div>
                  {i < loadingSteps.length - 1 && (
                    <div style={{
                      width: 28, height: 2,
                      background: i < loadingStep ? `linear-gradient(90deg, ${GOLD}, ${GOLD_FAINT})` : TRACK_BG,
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 报告内容 — 杂志风 */}
        {analyzeMutation.data && (
          <div>
            {/* 封面区 — 像一本杂志的扉页 */}
            <div style={{
              position: "relative",
              overflow: "hidden",
              padding: "2.5rem 1.5rem 2rem",
              background: `linear-gradient(180deg, rgba(184,148,63,0.06) 0%, rgba(184,148,63,0.02) 40%, ${BG_CARD} 100%)`,
              borderBottom: "none",
            }}>
              {/* 装饰性背景圆 */}
              <div style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: 200, height: 200,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(196,160,78,0.06) 0%, transparent 65%)",
                pointerEvents: "none",
              }} />
              <div style={{
                position: "absolute", top: -40, right: -40,
                width: 120, height: 120,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(196,160,78,0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />

              {/* 顶部装饰 */}
              <div className="flex justify-center mb-4">
                <BaguaDecor size={36} opacity={0.4} />
              </div>

              {/* 杂志头 — 大标题 */}
              <div className="flex flex-col items-center gap-2">
                <p style={{
                  color: "#C4A04E",
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: "1.35rem",
                  fontWeight: 700,
                  letterSpacing: "0.35em",
                  lineHeight: 1.3,
                  textAlign: "center",
                }}>
                  OraSage
                </p>
                <p style={{
                  color: "rgba(93,89,115,0.5)",
                  fontFamily: "'Noto Serif SC', serif",
                  fontSize: "0.55rem",
                  letterSpacing: "0.45em",
                  textAlign: "center",
                }}>
                  {t('report.title')}
                </p>

                <GoldDivider />

                {/* 章节速览标签 — 杂志封面的引文风格 */}
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {(sections || []).slice(0, 4).map((sec, i) => (
                    <span key={i} style={{
                      fontSize: "0.55rem",
                      padding: "3px 10px",
                      borderRadius: "999px",
                      whiteSpace: "nowrap",
                      border: `1px solid rgba(196,160,78,0.15)`,
                      color: "#6F6880",
                      fontFamily: "'Noto Sans SC', sans-serif",
                      letterSpacing: "0.06em",
                      background: "rgba(196,160,78,0.04)",
                    }}>
                      {sec.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* 底部装饰线 */}
              <div style={{
                marginTop: "1.25rem",
                height: 1,
                background: "linear-gradient(90deg, transparent, rgba(196,160,78,0.2) 20%, rgba(196,160,78,0.2) 80%, transparent)",
              }} />
            </div>

            {/* 分节折叠列表 — 杂志内页 */}
            <div>
              {/* 阅读进度条 */}
              {(sections || []).length > 0 && (
                <div style={{ padding: "0 1.25rem", marginTop: "0.5rem" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.5rem", color: "rgba(93,89,115,0.35)", fontFamily: SERIF, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                      {t('report.progress').replace('{open}', String(openSections.size)).replace('{total}', String((sections || []).length))}
                    </span>
                    <div style={{ flex: 1, height: 2, borderRadius: 1, background: "rgba(196,160,78,0.1)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%",
                        width: `${(openSections.size / (sections?.length || 1)) * 100}%`,
                        background: "linear-gradient(90deg, #C4A04E, rgba(196,160,78,0.3))",
                        borderRadius: 1,
                        transition: "width 0.5s cubic-bezier(0.23,1,0.32,1)",
                      }} />
                    </div>
                  </div>
                </div>
              )}
              {(sections || []).map((sec, idx) => (
                <SectionCard key={idx} index={idx} title={sec.title} content={sec.content}
                  isOpen={openSections.has(idx)} onToggle={() => toggleSection(idx)}
                  G_MID={G_MID} G_DIM={G_DIM} G_FAINT={G_FAINT} G_GHOST={G_GHOST} SERIF={SERIF}
                  isLast={idx === (sections || []).length - 1}
                  wuXing={(resultData?.wuXing as Record<string, number>) || undefined} />
              ))}
            </div>

            {/* 底部 — 版权/免责 */}
            <div style={{
              padding: "2rem 1.5rem",
              background: "linear-gradient(0deg, rgba(196,160,78,0.04) 0%, transparent 100%)",
              borderTop: "1px solid rgba(196,160,78,0.08)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}>
              <GoldDivider />
              <svg width="18" height="18" viewBox="0 0 100 100" fill="none" style={{ opacity: 0.2 }}>
                <circle cx="50" cy="50" r="46" stroke="#C4A04E" strokeWidth="1.5"/>
                <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(196,160,78,0.2)"/>
                <circle cx="50" cy="28" r="3.5" fill="#C4A04E"/>
              </svg>
              <p style={{
                color: "rgba(93,89,115,0.3)",
                fontSize: "0.55rem",
                letterSpacing: "0.15em",
                fontFamily: "'Noto Sans SC', sans-serif",
                textAlign: "center",
                lineHeight: 1.8,
                maxWidth: "80%",
              }}>
                {t('report.footer')}
              </p>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {analyzeMutation.isError && (
          <div className="flex flex-col items-center gap-3 py-8">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p style={{ color: "rgba(248,113,113,0.6)", fontSize: "0.78rem", letterSpacing: "0.1em" }}>{t('report.error')}</p>
            <button type="button"
              onClick={() => analyzeMutation.mutate({ type, lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR", resultData })}
              className="px-5 py-1.5 text-xs transition-all active:scale-95"
              style={{ border: `1px solid ${BORDER_CLR}`, color: G_DIM, fontFamily: SERIF, letterSpacing: "0.15em", background: G_GHOST }}>
              {t('report.retry')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  免费命理解读：日主分析 + 职业 + 合作 + 风险
// ════════════════════════════════════════════════════════════════════

/** 从日柱天干提取日主五行 */
function getWxFromRiZhu(riZhu: string): string {
  const WX: Record<string, string> = { 甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水' };
  return WX[riZhu] || riZhu;
}

/** 日主属性分析库（静态兜底，AI 返回后替换为个性化内容） */
const RIZHU_PROFILE: Record<string, {
  title: string; traits: string; career: string; partner: string; risk: string; lucky: string;
}> = {
  '甲木': { title:'参天大树，正直仁德', traits:'甲木日主为人刚正，心胸开阔，具有强大的领导力和组织力，善于从全局视角思考问题，是天生的领袖型人格。', career:'适合军政、公务员、教育、建筑、林业等需要长期积累的事业。', partner:'适合与丙火、己土日主合作，🔥火能照木、🏔土能稳木。避免与辛金过强的命局搭配。', risk:'⚠ 甲木过刚易折，需防因过于强势而树敌。2026年戊戌土旺克水，注意身心调节。', lucky:'幸运色: 深绿、黑色 ｜ 幸运方位: 东南' },
  '乙木': { title:'藤萝柔韧，灵活变通', traits:'乙木日主温柔而坚毅，具有极强的适应力和审美感知力，善于在细节中找到突破点，是天生的艺术家和协调者。', career:'适合艺术设计、教育、咨询、美容、园林等创意性行业。', partner:'适合与丙火、甲木日主合作，🔥丙火为阳光、🌳甲木为支撑。避免与庚金过强的命局搭配。', risk:'⚠ 乙木柔顺易被人操控，需培养主动判断力。2026年财务需考虑项目回款压力。', lucky:'幸运色: 绿色、青色 ｜ 幸运方位: 东南' },
  '丙火': { title:'炎炎太阳，热情奔放', traits:'丙火日主热烈明朗，充满感染力与自信心，是天生的传播者和激励者，走到哪里都是焦点。', career:'适合传媒、主持、自媒体、市场营销、公益事业等需要曝光度的工作。', partner:'适合与壬水、甲木日主合作，💧壬水为浩浩江河、🌳甲木为根基支撑。避免与己土过重的命局过度纠缠。', risk:'⚠ 丙火耀眼但易燃烧过度，需防身心透支。2026年家人健康需关注。', lucky:'幸运色: 红色、紫色 ｜ 幸运方位: 南' },
  '丁火': { title:'灯烛之火，温暖细腻', traits:'丁火日主内心细腻明亮，洞察力惊人，善于捕捉他人的细微情绪变化，是天生的智者和心灵导师。', career:'适合心理咨询、文学创作、灯饰设计、教育辅导、医疗护理等行业。', partner:'适合与甲木、庚金日主合作，🌳甲木为灯油之源、⚔庚金为精雕细琢。避免与癸水过强的命局搭配。', risk:'⚠ 丁火微弱易被外界影响，需注意保护自己的能量场。2026年合同纠纷需谨慎。', lucky:'幸运色: 红色、金色 ｜ 幸运方位: 南' },
  '戊土': { title:'厚重城墙，踏实坚韧', traits:'戊土日主诚实可靠，行动力强，具有天生的责任感和统筹能力，是团队中不可或缺的中流砥柱。', career:'适合金融、房地产、工程管理、审计、企业中层管理等需要稳健执行的工作。', partner:'适合与丙火、壬水日主合作，🔥丙火为阳光照临、💧壬水为滋养之源。避免与乙木过重的命局合作。', risk:'⚠ 戊土厚重需防过于保守，错失良机。2026年投资理财需控制杠杆率。', lucky:'幸运色: 金黄、褐色 ｜ 幸运方位: 中' },
  '己土': { title:'田园沃土，温和包容', traits:'己土日主温润包容，具有天生的养育之力，善于调和人际关系，是天生的调解者和服务者。', career:'适合心理咨询、教育辅导、烹饪料理、社区服务、手工艺等行业。', partner:'适合与丙火、甲木日主合作，🔥丙火为阳光之力、🌳甲木为生发之机。避免与癸水过强的命局搭配。', risk:'⚠ 己土柔和易被人情束缚，需防因过度迁就而失去自我。2026年注意家庭财务理性规划。', lucky:'幸运色: 土黄、浅绿 ｜ 幸运方位: 中' },
  '庚金': { title:'斧钺之金，果断刚强', traits:'庚金日主意志坚定，执行力卓越，具有天生的决断力和组织执行力，做事有魄力、有胆识，是天生的将才。', career:'适合军警、法律、金融投资、工程技术、制造业等需要决断力和专业度的行业。', partner:'适合与丁火、甲木日主合作，🔥丁火为锤炼之炉、🌳甲木为根基支撑。避免与丙火过重的命局正面交锋。', risk:'⚠ 庚金刚锐易得罪人，需注意言行。2026年注意合同条款细节，避免中途变数。', lucky:'幸运色: 白色、银色 ｜ 幸运方位: 西南' },
  '辛金': { title:'珠宝之金，精致优雅', traits:'辛金日主精致细腻，追求完美，具有天生的审美力和专业精神，是天生的匠人和品味家。', career:'适合珠宝设计、银行金融、会计、医疗美容、高端定制等需要精细度的行业。', partner:'适合与壬水、丁火日主合作，💧壬水为淘洗之力、🔥丁火为精炼之温。避免与乙木过重的命局搭配。', risk:'⚠ 辛金追求完美易过度焦虑，需学会放下小节。2026年投资需分散风险。', lucky:'幸运色: 白色、粉色 ｜ 幸运方位: 西' },
  '壬水': { title:'江河之水，智慧通达', traits:'壬水日主聪慧机敏、直觉力惊人，善于沟通和变通，具有天生的商业嗅觉和人际魅力，是天生的变通者。', career:'适合贸易、电商、传媒、影视制作、国际商务等需要快速应变和沟通力的行业。', partner:'适合与丙火、戊土日主合作，🔥丙火为江河映照、🏔戊土为堤坝护持。避免与己土过重的命局纠缠。', risk:'⚠ 壬水活跃容易分心，需聚焦省力。2026年注意行程安排突发变故。', lucky:'幸运色: 蓝色、黑色 ｜ 幸运方位: 北' },
  '癸水': { title:'雨露之水，内秀深远', traits:'癸水日主内敛深沉，具有天生的精神力量和洞察力，善于在宁静中积蓄力量，是天生的思想者和战略家。', career:'适合学术研究、心理学、战略咨询、数据分析、艺术创作等需要深度思考的行业。', partner:'适合与甲木、庚金日主合作，🌳甲木为承载之基、⚔庚金为提炼之力。避免与戊土过重的命局搭配。', risk:'⚠ 癸水之寒需防内心深沉而自我封闭。2026年注意合同细节和财务外借风险。', lucky:'幸运色: 蓝色、白色 ｜ 幸运方位: 北' },
};

function FreeBaziInsight({ result }: { result: SingleBaziResult }) {
  const { t, term, locale } = useT();
  const wx = getWxFromRiZhu(result.riZhu);
  const strengthLabel = result.strength === "身强" ? term('身强') : result.strength === "身弱" ? term('身弱') : term('身中和');

  const [aiProfile, setAiProfile] = useState<null | {
    title: string; matrix?: string; pattern?: string; personality?: string;
    traits?: string; career?: string; partner?: string; risk: string; lucky: string;
  }>(null);
  const [aiLoaded, setAiLoaded] = useState(false);
  const [aiError, setAiError] = useState(false);
  const insightMutation = trpc.bazi.freeInsight.useMutation({
    onSuccess: (data: any) => {
      if (data && data.title) {
        setAiProfile(data);
      }
      setAiLoaded(true);
    },
    onError: () => {
      setAiError(true);
      setAiLoaded(true);
    },
  });

  // 组件挂载后触发 AI 解读
  useEffect(() => {
    if (!aiLoaded && !insightMutation.isPending) {
      const timer = setTimeout(() => {
        insightMutation.mutate({ lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR", resultData: result as unknown as Record<string, unknown> });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, []);

  const hasAi = !!aiProfile;
  const strengthColor = result.strength === "身强" ? "#4ade80" : result.strength === "身弱" ? "#f87171" : GOLD;

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, background: CARD_SURFACE }}>
      {/* 标题栏 */}
      <div className="px-5 py-4" style={{ background: CARD_GRADIENT_SOFT, borderBottom: `1px solid ${GOLD_FAINT}` }}>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: "1.25rem" }}>🔮</span>
          <div>
            <p className="text-base font-bold" style={{ color: HEADING_CLR, fontFamily: SERIF_F }}>
              {t('insight.title').replace('{name}', result.name)}
            </p>
            <p className="text-xs" style={{ color: MUTED_CLR }}>
              {t('insight.day_master').replace('{riZhu}', result.riZhu).replace('{wx}', wx).replace('{strength}', strengthLabel)}
            </p>
          </div>
          <div className="ml-auto text-right">
            <span className="text-sm px-2.5 py-1 rounded-full" style={{ background: "rgba(196,160,78,0.1)", color: GOLD, fontFamily: SANS }}>
              {wx} · {result.riZhu}
            </span>
          </div>
        </div>
      </div>

      {/* 内容区 */}
      <div className="px-5 py-4 flex flex-col gap-4">
        {/* AI 加载中：动画骨架 */}
        {!hasAi && !aiError && insightMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="relative" style={{ width: 44, height: 44 }}>
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none"
                className="animate-spin" style={{ animationDuration: "3s" }}>
                <circle cx="50" cy="50" r="44" stroke="rgba(196,160,78,0.15)" strokeWidth="1.5"/>
                <path d="M50 6 A44 44 0 0 1 50 94 A22 22 0 0 1 50 50 A22 22 0 0 0 50 6Z" fill="rgba(196,160,78,0.15)"/>
                <circle cx="50" cy="28" r="4" fill="#C4A04E" opacity="0.8"/>
                <circle cx="50" cy="72" r="4" fill="rgba(196,160,78,0.2)"/>
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-sm" style={{ color: "rgba(196,160,78,0.7)", fontFamily: SERIF_F, letterSpacing: "0.12em" }}>
                {t('insight.loading')}
              </span>
              <span className="text-xs" style={{ color: "rgba(93,89,115,0.4)", letterSpacing: "0.05em" }}>
                {t('insight.subtitle')}
              </span>
            </div>
          </div>
        )}

        {/* AI 加载失败 + 重试 */}
        {aiError && !hasAi && (
          <div className="flex flex-col items-center gap-3 py-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(248,113,113,0.5)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span className="text-sm" style={{ color: "#6F6880", letterSpacing: "0.04em" }}>
              {t('insight.error')}
            </span>
            <button type="button" onClick={() => {
              setAiError(false);
              setAiLoaded(false);
              insightMutation.mutate({ lang: locale as "zh-CN" | "zh-TW" | "en" | "pt-BR", resultData: result as unknown as Record<string, unknown> });
            }}
              className="text-sm px-5 py-2 rounded-lg transition-colors"
              style={{ background: "rgba(196,160,78,0.1)", color: "#C4A04E", border: "none", cursor: "pointer" }}>
              {t('insight.retry')}
            </button>
          </div>
        )}

        {/* AI 内容 */}
        {hasAi && aiProfile && (
          <>
            <div className="rounded-lg px-4 py-3.5" style={{ background: "rgba(196,160,78,0.06)", border: `1px solid rgba(196,160,78,0.12)` }}>
              <p className="text-sm font-bold mb-1.5" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.riZhu} · {aiProfile.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: BODY_CLR, lineHeight: 1.75 }}>{aiProfile.matrix || aiProfile.traits}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg px-4 py-3.5" style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)" }}>
                <div className="flex items-center gap-1.5 mb-1.5"><span style={{ fontSize: "0.875rem" }}>🏛</span><span className="text-sm font-bold" style={{ color: "#60a5fa" }}>{t('insight.pattern')}</span></div>
                <p className="text-sm leading-relaxed" style={{ color: BODY_CLR, lineHeight: 1.7 }}>{aiProfile.pattern || ''}</p>
              </div>
              <div className="rounded-lg px-4 py-3.5" style={{ background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.15)" }}>
                <div className="flex items-center gap-1.5 mb-1.5"><span style={{ fontSize: "0.875rem" }}>🧬</span><span className="text-sm font-bold" style={{ color: "#4ade80" }}>{t('insight.personality')}</span></div>
                <p className="text-sm leading-relaxed" style={{ color: BODY_CLR, lineHeight: 1.7 }}>{aiProfile.personality || aiProfile.career || ''}</p>
              </div>
            </div>

            <div className="rounded-lg px-4 py-3.5" style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.15)" }}>
              <div className="flex items-center gap-1.5 mb-1.5"><span style={{ fontSize: "0.875rem" }}>🛡</span><span className="text-sm font-bold" style={{ color: "#f87171" }}>{t('insight.risk')}</span></div>
              <p className="text-sm leading-relaxed" style={{ color: BODY_CLR, lineHeight: 1.7 }}>{aiProfile.risk}</p>
            </div>

            <div className="flex items-center justify-between rounded-lg px-4 py-2.5" style={{ background: "rgba(196,160,78,0.04)" }}>
              <p className="text-sm" style={{ color: GOLD, flex: 1 }}>{aiProfile.lucky}</p>
              <span className="text-sm px-2.5 py-1 rounded-full" style={{ background: GOLD, color: "#ffffff", fontFamily: SANS }}>{wx}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  付费后组件：解锁内容
// ════════════════════════════════════════════════════════════════════

function UnlockedContent({ result, purchasedPlan, braceletRec, captureRef, onReportReady }: {
  result: SingleBaziResult;
  purchasedPlan: PlanType | null;
  braceletRec: BraceletRecommendation | null;
  captureRef: React.RefObject<HTMLDivElement | null>;
  onReportReady?: (reportContent: string, sections: Array<{ title: string; content: string }>) => void;
}) {
  return (
    <div ref={captureRef as any} className="flex flex-col gap-3">
      <AIAnalysisPanel resultData={result as unknown as Record<string, unknown>} type="single" autoTrigger onReportReady={onReportReady} />
      {purchasedPlan === "basic" && braceletRec?.deficiencyWx && (
        <BaziConfiguredProductRecommend
          element={braceletRec.deficiencyWx}
          chart={{
            birthStr: result.birthStr,
            gender: result.gender,
            name: result.name,
            wuXing: result.wuXing as unknown as Record<string, number>,
          }}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════
//  单人结果页
// ════════════════════════════════════════════════════════════════════
export function SingleBaziResultView({ result, onBack, onStartDouble }: SingleProps) {
  const { t, term } = useT();
  const pillarLabels = PILLAR_LABELS_KEYS.map(k => t(k));
  const payment = usePaymentFlow();
  const [showPlans, setShowPlans] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const dailyFortune = useMemo(() => calcDailyFortune(result), [result]);
  const braceletRec = useMemo(() => recommendBracelet(result.wuXing as unknown as Record<string, number>), [result]);

  const planNameMap: Record<string, string> = {
    basic: t('plan.basic.name'),
    advanced: t('plan.advanced.name'),
    premium: t('plan.premium.name'),
  };

  // 报告生成完毕 → 推送到用户中心（WC 或 shop 订单）
  const handleReportReady = (reportContent: string, sections: Array<{ title: string; content: string }>) => {
    if (!payment.purchasedPlan) return;
    if (!payment.shopOrderNo && !payment.wooOrderId) return;
    payment.pushReportToWordPress({
      planType: payment.purchasedPlan,
      wooOrderId: payment.wooOrderId || undefined,
      shopOrderNo: payment.shopOrderNo || undefined,
      reportContent,
      name: result.name,
    });
  };

  return (
    <div style={{ minHeight: "auto" }} className="flex flex-col gap-4 animate-fade-in-up">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80 active:scale-95"
        style={{ color: BODY_CLR }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {t('result.back')}
        </button>
        {onStartDouble && (
          <button type="button" onClick={onStartDouble}
            className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80 active:scale-95 px-3 py-1.5 rounded-full"
            style={{ color: GOLD, border: `1px solid ${BORDER_CLR}`, background: "rgba(196,160,78,0.07)" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {t('result.double')}
          </button>
        )}
      </div>

      {/* ── 免费展示：八字命盘 + 命理简析 ── */}
      {/* 姓名 + 日主 */}
      <div className="rounded-xl px-5 py-5" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xl font-bold" style={{ color: GOLD, fontFamily: SERIF_F, letterSpacing: "0.05em" }}>{result.name}</p>
            <p className="text-xs mt-1" style={{ color: BODY_CLR }}>
              {result.gender === "male" ? term('男命') : term('女命')} · {result.birthStr}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px]" style={{ color: MUTED_CLR, letterSpacing: "0.08em" }}>{t('pillar.day_master')}</p>
            <p className="text-3xl font-black" style={{ color: GOLD, fontFamily: SERIF_F }}>{result.riZhu}</p>
          </div>
        </div>
      </div>

      {/* 八字四柱 — 深色视觉锚点 */}
      <div className="rounded-xl px-5 py-5" style={{ background: PILLAR_SURFACE, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-center gap-2 mb-4">
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: "rgba(196,160,78,0.2)" }} />
          <span className="text-[10px] font-bold tracking-widest" style={{ color: "#C4A04E", fontFamily: SERIF_F, letterSpacing: "0.3em", opacity: 0.8 }}>{t('result.pillars')}</span>
          <div style={{ flex: 1, maxWidth: 60, height: 1, background: "rgba(196,160,78,0.2)" }} />
        </div>
        <div className="flex gap-5 justify-around">
          {[result.year, result.month, result.day, result.hour].map((p, i) => (
            <GanZhiCell key={i} gan={p.gan} zhi={p.zhi} label={pillarLabels[i]} isDay={i === 2} shiShen={result.shiShen} dark />
          ))}
        </div>
      </div>

      {/* 免费命理解读：日主分析 + 职业 + 合作 + 风险 */}
      <FreeBaziInsight result={result} />

      {/* 计费墙：未付费时展示 */}
      {!payment.unlocked && (
        <PaywallCard
          selectedPlan={payment.selectedPlan}
          onSelectPlan={payment.setSelectedPlan}
          onPay={payment.handlePaySelected}
          payLoading={payment.payLoading}
        />
      )}

      {/* 已解锁内容 */}
      {payment.unlocked && (
        <UnlockedContent result={result} purchasedPlan={payment.purchasedPlan} braceletRec={braceletRec} captureRef={captureRef} onReportReady={handleReportReady} />
      )}

      {/* 付费后操作区 */}
      {payment.unlocked && (
        <div className="flex flex-col gap-3 pt-2">
          {onStartDouble && (
            <button type="button" onClick={onStartDouble}
              className="w-full py-3 rounded-2xl text-sm font-bold tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 50%, ${GOLD} 100%)`, color: "#ffffff", fontFamily: SERIF_F, letterSpacing: "0.18em", boxShadow: `0 4px 16px rgba(196,160,78,0.35)` }}>
              {t('result.double')}
            </button>
          )}
          <button type="button" onClick={onBack}
            className="w-full py-2.5 rounded-2xl text-sm tracking-widest transition-all active:scale-95"
            style={{ background: "transparent", color: GOLD_DIM, border: `1px solid ${BORDER_CLR}`, fontFamily: SERIF_F, letterSpacing: "0.12em" }}>
            {t('result.back')}
          </button>
        </div>
      )}

      {/* 付费方案选择弹窗：保留供升级按钮复用 */}
      {showPlans && (
        <PlanSelectionModal
          open={showPlans}
          onClose={() => setShowPlans(false)}
          mode="single"
          onSelectPlan={(plan, orderId) => {
            payment.setUnlocked(true);
            payment.setPurchasedPlan(plan);
            if (orderId) payment.setWooOrderId(orderId);
            setShowPlans(false);
          }}
        />
      )}
      <div className="h-4" />
    </div>
  );
}

// ── 双人合盘结果页 ────────────────────────────────────────────────────────────
export function DoubleBaziResultView({ result, onBack }: DoubleProps) {
  const { t, term } = useT();
  const payment = usePaymentFlow("couple");
  const [showPlans, setShowPlans] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const scoreColor = result.score >= 85 ? '#4ade80' : result.score >= 70 ? GOLD : '#f87171';

  const planNameMap: Record<string, string> = {
    basic: t('plan.couple.basic.name'),
    advanced: t('plan.couple.advanced.name'),
    premium: t('plan.couple.premium.name'),
  };

  const handleReportReady = (reportContent: string, sections: Array<{ title: string; content: string }>) => {
    if (!payment.purchasedPlan) return;
    if (!payment.shopOrderNo && !payment.wooOrderId) return;
    payment.pushReportToWordPress({
      planType: payment.purchasedPlan,
      wooOrderId: payment.wooOrderId || undefined,
      shopOrderNo: payment.shopOrderNo || undefined,
      reportContent,
      name: `${result.person1.name} & ${result.person2.name}`,
    });
  };

  return (
    <div style={{ minHeight: "auto" }} className="flex flex-col gap-4 animate-fade-in-up">
      {/* 顶部重新排盘 */}
      <button type="button" onClick={onBack}
        className="flex items-center gap-1.5 text-sm transition-opacity hover:opacity-80 active:scale-95"
        style={{ color: BODY_CLR }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        {t('result.back')}
      </button>
      {/* 合盘综合评分 — 始终展示 */}
      <div className="rounded-xl px-5 py-5 text-center" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
        <p className="text-xs mb-2" style={{ color: BODY_CLR }}>{t('result.couple_score')}</p>
        <div className="text-5xl font-black mb-1" style={{ color: scoreColor, fontFamily: SERIF_F }}>
          {result.score}
        </div>
        <div className="text-lg font-bold" style={{ color: GOLD }}>{result.rating}</div>
        <div className="mt-3 flex justify-center gap-2 text-xs" style={{ color: "#6F6880" }}>
          <span>{result.person1.name} · {result.person1.riZhu}</span>
          <span>×</span>
          <span>{result.person2.name} · {result.person2.riZhu}</span>
        </div>
      </div>
      {/* 评分维度明细 — 始终展示 */}
      <InfoCard title={t('result.couple_dimensions')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>
        </svg>
      }>
        <ScoreDetailsPanel details={result.scoreDetails} />
      </InfoCard>
      {/* 五行互补对比 — 始终展示 */}
      <InfoCard title={t('result.couple_wuxing')} icon={
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      }>
        {/* 双人雷达图叠加 */}
        <div className="flex flex-col items-center gap-2 mb-3">
          <WuXingRadar
            data1={result.person1.wuXing as unknown as Record<string, number>}
            data2={result.person2.wuXing as unknown as Record<string, number>}
            name1={result.person1.name}
            name2={result.person2.name}
          />
          <div className="flex gap-4 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 rounded" style={{ background: 'rgba(200,168,75,0.85)' }} />
              <span style={{ color: BODY_CLR }}>{result.person1.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 rounded" style={{ background: 'rgba(96,165,250,0.7)' }} />
              <span style={{ color: 'rgba(96,165,250,0.7)' }}>{result.person2.name}</span>
            </div>
          </div>
        </div>
        {(['木', '火', '土', '金', '水'] as const).map(wx => {
          const v1 = result.person1.wuXing[wx] ?? 0;
          const v2 = result.person2.wuXing[wx] ?? 0;
          const color = WU_XING_COLOR[wx];
          return (
            <div key={wx} className="flex items-center gap-2 mb-2">
              <span className="w-4 text-xs font-bold shrink-0" style={{ color }}>{wx}</span>
              <div className="flex-1 flex gap-1 items-center">
                <div className="flex-1 h-2 rounded-full overflow-hidden flex justify-end" style={{ background: TRACK_BG }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, v1 * 20)}%`, background: color, opacity: 0.8 }} />
                </div>
                <span className="text-[10px] w-5 text-center shrink-0" style={{ color: BODY_CLR }}>{wx}</span>
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: TRACK_BG }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, v2 * 20)}%`, background: color, opacity: 0.6 }} />
                </div>
              </div>
              <div className="flex gap-1 text-[10px] shrink-0" style={{ color: BODY_CLR }}>
                <span>{v1.toFixed(1)}</span>
                <span>/</span>
                <span>{v2.toFixed(1)}</span>
              </div>
            </div>
          );
        })}
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: MUTED_CLR }}>
          <span>{result.person1.name}</span>
          <span>{result.person2.name}</span>
        </div>
      </InfoCard>

      {/* 免费转化钩子：在评分后、计费墙前插入 */}
      {!payment.unlocked && (
        <div className="rounded-xl px-5 py-5" style={{
          background: CARD_GRADIENT_SOFT,
          border: `1px solid ${GOLD_FAINT}`,
        }}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-lg">💞</span>
            <p className="text-sm font-bold" style={{ color: HEADING_CLR, fontFamily: SERIF_F }}>
              {t('paywall.couple.hook_title', '你们合盘的隐藏密码')}
            </p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: BODY_CLR, lineHeight: 1.75 }}>
            {t('paywall.couple.hook')}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(196,160,78,0.2))" }} />
            <span className="text-[10px]" style={{ color: MUTED_CLR, fontFamily: SANS, letterSpacing: "0.08em" }}>
              {t('paywall.couple.hook_label')}
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(196,160,78,0.2), transparent)" }} />
          </div>
        </div>
      )}
      {/* 两人命盘 — 付费解锁后展示单人命盘 + AI解读 */}
      {payment.unlocked ? (
        <>
          <div ref={captureRef}>
            <div className="rounded-xl px-4 py-3" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
              <SingleResultBody result={result.person1} compact />
            </div>
            <div className="rounded-xl px-4 py-3 mt-4" style={{ background: CARD_SURFACE, border: `1px solid ${CARD_BORDER}` }}>
              <SingleResultBody result={result.person2} compact />
            </div>
          </div>

          {/* AI 合盘解读报告（最后面） */}
          <AIAnalysisPanel
            resultData={result as unknown as Record<string, unknown>}
            type="couple"
            autoTrigger
            onReportReady={handleReportReady}
          />

          {/* 付费后操作区 */}
          {/* 升级按钮 */}
          {payment.purchasedPlan && payment.purchasedPlan !== "premium" && (
            <button type="button" onClick={() => setShowPlans(true)}
              className="w-full py-2.5 rounded-xl text-sm font-bold tracking-widest transition-all active:scale-95"
              style={{
                background: "transparent", color: GOLD, fontFamily: SERIF_F,
                border: `1px solid ${GOLD}`, letterSpacing: "0.12em",
              }}>
              {t('plan.upgrade')}
            </button>
          )}
          <button type="button" onClick={onBack}
            className="w-full py-2.5 rounded-2xl text-sm tracking-widest transition-all active:scale-95"
            style={{ background: "transparent", color: GOLD_DIM, border: `1px solid ${BORDER_CLR}`, fontFamily: SERIF_F, letterSpacing: "0.12em" }}>
            {t('result.back')}
          </button>
        </>
      ) : (
        /* 合盘计费墙 */
        <PaywallCard
          selectedPlan={payment.selectedPlan}
          onSelectPlan={payment.setSelectedPlan}
          onPay={payment.handlePaySelected}
          payLoading={payment.payLoading}
          mode="couple"
        />
      )}
      {/* 付费方案选择弹窗：保留供升级按钮复用 */}
      {showPlans && (
        <PlanSelectionModal
          open={showPlans}
          onClose={() => setShowPlans(false)}
          mode="couple"
          onSelectPlan={(plan, orderId) => {
            payment.setUnlocked(true);
            payment.setPurchasedPlan(plan);
            if (orderId) payment.setWooOrderId(orderId);
            setShowPlans(false);
          }}
        />
      )}
      <div className="h-4" />
    </div>
  );
}
// ── 默认导出（向后兼容） ──────────────────────────────────────────────────────
export default SingleBaziResultView;
