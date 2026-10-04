/**
 * 八字报告静态 HTML — magazine detail layout（对齐 report-detail.html）
 * + 设计规范分享卡 / 社交媒体分享
 */

import { extractSectionKeywords } from "../shared/section-keywords.ts";
import { sanitizeReportBrandText } from "../shared/report-brand.ts";
import {
  brandLockupHtml,
  copyrightLine,
  isChineseLocale,
  siteDisplayName,
  siteSignature,
} from "../shared/site-brand.ts";
import { REPORT_PAGE_CSS } from "./reportHtmlStyles.ts";

const WX_ORDER = ["木", "火", "土", "金", "水"] as const;
const WX_EN: Record<string, string> = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
const WX_CLASS: Record<string, string> = { 木: "wood", 火: "fire", 土: "earth", 金: "metal", 水: "water" };
const WX_DESC_ZH: Record<string, string> = {
  木: "生长与仁爱的一面",
  火: "表达与创造力的一面",
  土: "务实与稳定的一面",
  金: "规则与收束的一面",
  水: "智慧与滋养的一面",
};

export type ReportProductRecommend = {
  name: string;
  desc: string;
  priceDisplay: string;
  shopUrl: string;
  element?: string;
  sku?: string;
  priceCents?: number;
  priceCentsUsd?: number | null;
  recommendPriceOverride?: boolean;
};

export type ReportSection = { title: string; content: string };

export type ReportChartMeta = {
  name?: string;
  birthStr?: string;
  birthplace?: string;
  gender?: string;
  riZhu?: string;
  strength?: string;
  year?: { gan: string; zhi: string };
  month?: { gan: string; zhi: string };
  day?: { gan: string; zhi: string };
  hour?: { gan: string; zhi: string };
  wuXing?: Record<string, number>;
  dayMasterLine?: string;
  gridCaption?: string;
  luckyLine?: string;
  favorable?: string[];
};

export type ReportPageOptions = {
  planLabel: string;
  reportContent: string;
  subjectName?: string;
  generatedAt?: Date;
  productRecommend?: ReportProductRecommend | null;
  chart?: ReportChartMeta | null;
  /** 绝对报告 URL，用于分享 / OG */
  shareUrl?: string;
  /** 免费速览页展示升级区 */
  showUpgrade?: boolean;
  upgradeUrl?: string;
  locale?: string;
  /** free = 排盘速览；paid = 付费全文。详情页与固定页共用同一文件，用此标记防降级覆盖 */
  tier?: "free" | "paid";
};

/** 将一段 Markdown 文本转为安全的 HTML 片段 */
export function renderMarkdown(md: string): string {
  let html = sanitizeReportBrandText(md)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>");

  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  const lines = html.split("\n");
  const result: string[] = [];
  let pendingLi: string[] = [];

  function flushLi() {
    if (pendingLi.length > 0) {
      result.push("<ul>" + pendingLi.join("") + "</ul>");
      pendingLi = [];
    }
  }

  for (const line of lines) {
    const liConverted = line.replace(/^- (.+)$/, "<li>$1</li>");
    if (liConverted.startsWith("<li>")) {
      pendingLi.push(liConverted);
    } else {
      flushLi();
      result.push(line.trim() === "" ? "" : line);
    }
  }
  flushLi();

  html = result.join("\n");

  const blocks = html.split(/\n{2,}/);
  const wrapped: string[] = [];
  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;
    if (/^<(h[1-3]|ul|ol|table|blockquote|pre|div)/.test(trimmed)) {
      wrapped.push(trimmed);
    } else {
      wrapped.push("<p>" + trimmed.replace(/\n/g, "<br>") + "</p>");
    }
  }

  return wrapped.join("\n");
}

/** 按 ### 标题拆分章节（与 prompts.parseSections 一致） */
export function parseReportSections(markdown: string): ReportSection[] {
  const lines = markdown.split("\n");
  const sections: ReportSection[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^###\s+(.+)$/);
    if (headingMatch) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
      }
      currentTitle = headingMatch[1].trim().replace(/[*#]/g, "");
      currentLines = [];
    } else if (line.trim() === "---" || line.trim().startsWith("*注：")) {
      continue;
    } else {
      currentLines.push(line.replace(/\*/g, ""));
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
  }
  return sections;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(text: string): string {
  return escapeHtml(text).replace(/'/g, "&#39;");
}

function pillarStr(p?: { gan: string; zhi: string } | null): string {
  if (!p?.gan || !p?.zhi) return "";
  return `${p.gan}${p.zhi}`;
}

function issueLabel(date: Date, yearPillar?: string): string {
  const n = String((date.getMonth() + 1)).padStart(2, "0");
  return yearPillar ? `ISSUE №${n} · ${yearPillar}年` : `ISSUE №${n}`;
}

function buildShareCopy(opts: {
  name: string;
  dayMaster: string;
  planLabel: string;
  url: string;
  locale: string;
}): { text: string; title: string; description: string } {
  const zh = isChineseLocale(opts.locale);
  const brand = siteDisplayName(opts.locale);
  const title = `${brand} · ${opts.planLabel} · ${opts.name}`;
  if (zh) {
    const description = opts.dayMaster
      ? `${opts.dayMaster}。在${brand}查看我的八字结构速览。`
      : `我在${brand}完成了八字${opts.planLabel}，打开看看命局能量。`;
    const text = opts.dayMaster
      ? `我在${brand}测了八字「${opts.planLabel}」：${opts.dayMaster}\n打开看看你的命局能量 → ${opts.url}`
      : `我在${brand}完成了八字「${opts.planLabel}」\n打开看看你的命局能量 → ${opts.url}`;
    return { text, title, description };
  }
  const description = opts.dayMaster
    ? `${opts.dayMaster}. Explore my Bazi brief on ${brand}.`
    : `I just ran a Bazi ${opts.planLabel} on ${brand}.`;
  const text = `${description}\n${opts.url}`;
  return { text, title, description };
}

const WX_DONUT_COLOR: Record<string, string> = {
  木: "#5B8C5A",
  火: "#C96442",
  土: "#CD7F32",
  金: "#8A8A8A",
  水: "#4A90B8",
};

const GAN_WX: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

const ZHI_WX: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

const GAN_YANG = new Set(["甲", "丙", "戊", "庚", "壬"]);

function wxClassOf(wx: string): string {
  return WX_CLASS[wx] || "";
}

type MingPanCol = {
  key: "year" | "month" | "day" | "hour";
  labelZh: string;
  labelEn: string;
  pillar?: { gan: string; zhi: string };
  dayMaster?: boolean;
};

function renderMingPanBlock(chart: ReportChartMeta, locale: string, sectionNum: string): string {
  const zh = locale.startsWith("zh");
  const cols: MingPanCol[] = [
    { key: "year", labelZh: "年柱", labelEn: "Year", pillar: chart.year },
    { key: "month", labelZh: "月柱", labelEn: "Month", pillar: chart.month },
    { key: "day", labelZh: "日柱", labelEn: "Day", pillar: chart.day, dayMaster: true },
    { key: "hour", labelZh: "时柱", labelEn: "Hour", pillar: chart.hour },
  ];
  const present = cols.filter((c) => c.pillar?.gan && c.pillar?.zhi);
  if (present.length === 0) return "";

  const cells = present.map((c) => {
    const gan = c.pillar!.gan;
    const zhi = c.pillar!.zhi;
    const ganWx = GAN_WX[gan] || "";
    const zhiWx = ZHI_WX[zhi] || "";
    const polar = GAN_WX[gan]
      ? (GAN_YANG.has(gan) ? (zh ? "阳" : "Yang") : (zh ? "阴" : "Yin"))
      : "";
    const dmClass = c.dayMaster ? " is-day-master" : "";
    const dmBadge = c.dayMaster
      ? `<span class="mp-dm">${zh ? "日主" : "Day Master"}</span>`
      : "";
    return `
<div class="mp-pillar${dmClass}">
  <div class="mp-label">${zh ? c.labelZh : c.labelEn}</div>
  ${dmBadge}
  <div class="mp-gan ${wxClassOf(ganWx)}">${escapeHtml(gan)}</div>
  <div class="mp-zhi ${wxClassOf(zhiWx)}">${escapeHtml(zhi)}</div>
  <div class="mp-meta">
    ${ganWx ? `<span class="mp-wx ${wxClassOf(ganWx)}">${escapeHtml(ganWx)}</span>` : ""}
    ${polar ? `<span class="mp-polar">${escapeHtml(polar)}</span>` : ""}
    ${zhiWx ? `<span class="mp-wx ${wxClassOf(zhiWx)}">${escapeHtml(zhiWx)}</span>` : ""}
  </div>
</div>`;
  }).join("\n");

  return `
<section class="section section-mingpan" id="section-${sectionNum}" data-toc="${zh ? "四柱命盘" : "Four Pillars"}">
  <div class="section-header">
    <div class="section-number">${sectionNum}</div>
    <h2 class="section-title">${zh ? "四柱命盘" : "Four Pillars"}</h2>
    <p class="section-subtitle">${zh ? "年、月、日、时四柱干支与五行归属" : "Year, month, day and hour stems & branches"}</p>
  </div>
  <div class="mingpan-board" role="img" aria-label="${zh ? "四柱命盘" : "Four Pillars chart"}">${cells}
  </div>
</section>`;
}

function renderRadarSvg(wuXing: Record<string, number>, locale: string): string {
  const zh = locale.startsWith("zh");
  const CX = 130;
  const CY = 118;
  const R = 78;
  const maxVal = Math.max(...WX_ORDER.map((k) => Number(wuXing[k]) || 0), 1);
  const angles = WX_ORDER.map((_, i) => ((i * 72 - 90) * Math.PI) / 180);
  const pt = (idx: number, ratio: number) => ({
    x: CX + R * ratio * Math.cos(angles[idx]),
    y: CY + R * ratio * Math.sin(angles[idx]),
  });
  const gridPolys = [1, 0.75, 0.5, 0.25].map((ratio) => {
    const pts = WX_ORDER.map((_, i) => {
      const p = pt(i, ratio);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="${ratio === 1 ? "#DAD9D4" : "#E3E0D4"}" stroke-width="1"/>`;
  }).join("");
  const axes = angles.map((a) => {
    const x2 = (CX + R * Math.cos(a)).toFixed(1);
    const y2 = (CY + R * Math.sin(a)).toFixed(1);
    return `<line x1="${CX}" y1="${CY}" x2="${x2}" y2="${y2}" stroke="#E3E0D4" stroke-width="1"/>`;
  }).join("");
  const dataPts = WX_ORDER.map((wx, i) => {
    const p = pt(i, (Number(wuXing[wx]) || 0) / maxVal);
    return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
  }).join(" ");
  const dots = WX_ORDER.map((wx, i) => {
    const p = pt(i, (Number(wuXing[wx]) || 0) / maxVal);
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${WX_DONUT_COLOR[wx]}" stroke="#F0EEE8" stroke-width="1.5"/>`;
  }).join("");
  const labels = WX_ORDER.map((wx, i) => {
    const p = pt(i, 1.24);
    return `<text x="${p.x.toFixed(1)}" y="${p.y.toFixed(1)}" text-anchor="middle" dominant-baseline="middle" font-size="14" font-weight="600" fill="${WX_DONUT_COLOR[wx]}" font-family="Noto Serif SC, Newsreader, serif">${wx}</text>`;
  }).join("");

  return `
<div class="wx-radar-wrap">
  <svg class="wx-radar" viewBox="0 0 260 240" role="img" aria-label="${zh ? "五行雷达图" : "Five-element radar"}">
    ${gridPolys}
    ${axes}
    <polygon points="${dataPts}" fill="rgba(201,100,66,0.16)" stroke="#C96442" stroke-width="2" stroke-linejoin="round"/>
    ${dots}
    ${labels}
  </svg>
  <p class="wx-radar-caption">${zh ? "五行雷达 · 相对强弱" : "Element radar · relative strength"}</p>
</div>`;
}

type SectionKind = "insight" | "personality" | "talent" | "caution" | "action" | "default";

function classifySection(title: string): SectionKind {
  const t = title.toLowerCase();
  if (/注意|风险|薄弱|caution|risk|weak/.test(t)) return "caution";
  if (/天赋|优势|talent|strength|适合/.test(t)) return "talent";
  if (/性格|日主|personality|character/.test(t)) return "personality";
  if (/行动|建议|本周|action|week/.test(t)) return "action";
  if (/需要|洞察|格局|矩阵|输出|补|insight|matrix|pattern/.test(t)) return "insight";
  return "default";
}

function splitParagraphs(content: string): string[] {
  return content
    .split(/\n{2,}/)
    .map((p) => p.replace(/\n/g, " ").trim())
    .filter(Boolean);
}

function renderWuXingBlock(wuXing: Record<string, number>, locale: string, sectionNum: string): string {
  const total = WX_ORDER.reduce((s, k) => s + (Number(wuXing[k]) || 0), 0) || 1;
  const zh = locale.startsWith("zh");
  const pcts = WX_ORDER.map((wx) => Math.round(((Number(wuXing[wx]) || 0) / total) * 100));
  // conic-gradient stops
  let deg = 0;
  const stops: string[] = [];
  WX_ORDER.forEach((wx, i) => {
    const next = deg + (pcts[i] / 100) * 360;
    stops.push(`${WX_DONUT_COLOR[wx]} ${deg}deg ${next}deg`);
    deg = next;
  });
  const conic = `conic-gradient(${stops.join(",")})`;

  // balance: 100 - mean absolute deviation from 20%
  const mad = pcts.reduce((s, p) => s + Math.abs(p - 20), 0) / 5;
  const balance = Math.max(0, Math.min(100, Math.round(100 - mad * 2.2)));
  const topWx = WX_ORDER.slice().sort((a, b) => (wuXing[b] || 0) - (wuXing[a] || 0)).slice(0, 2);

  const items = WX_ORDER.map((wx, i) => {
    const pct = pcts[i];
    const cls = WX_CLASS[wx];
    const name = zh ? `${wx} · ${WX_EN[wx]}` : `${WX_EN[wx]} · ${wx}`;
    return `
<div class="element-item">
  <div class="element-symbol ${cls}">${escapeHtml(wx)}</div>
  <div class="element-info">
    <div class="element-name">${escapeHtml(name)}</div>
    <div class="element-bar"><div class="element-bar-fill ${cls}" style="width:${pct}%"></div></div>
  </div>
  <div class="element-percent">${pct}%</div>
  <div class="element-desc">${escapeHtml(zh ? WX_DESC_ZH[wx] : WX_EN[wx])}</div>
</div>`;
  }).join("\n");

  const insight = zh
    ? `你的五行平衡度为 ${balance} 分，能量偏重于<strong>${topWx.join("、")}</strong>。这决定了你行动与表达的主调；补足偏弱的一面，能让节奏更稳。`
    : `Balance score ${balance}/100, led by <strong>${topWx.map((w) => WX_EN[w]).join(" & ")}</strong>. Reinforcing weaker elements steadies the chart.`;

  return `
<section class="section section-elements" id="section-${sectionNum}" data-toc="${zh ? "五行分布" : "Elements"}">
  <div class="section-header">
    <div class="section-number">${sectionNum}</div>
    <h2 class="section-title">${zh ? "五行分布" : "Five Elements"}</h2>
    <p class="section-subtitle">${zh ? "金木水火土在你命局中的能量占比与平衡度" : "Elemental weight and balance in this chart"}</p>
  </div>
  <div class="elements-grid">
    <div class="elements-chart-wrapper">
      <div class="elements-donut">
        <div class="donut-ring" style="background:${conic}">
          <div class="donut-inner">
            <div class="donut-center-label">${zh ? "五行总量" : "Elements"}</div>
            <div class="donut-center-value">100%</div>
            <div class="donut-center-unit">Balance</div>
          </div>
        </div>
      </div>
      ${renderRadarSvg(wuXing, locale)}
    </div>
    <div class="elements-list">${items}</div>
  </div>
  <div class="balance-section">
    <div class="balance-gauge">
      <div class="gauge-circle">
        <div class="gauge-bg">
          <div class="gauge-value">${balance}</div>
          <div class="gauge-label">${zh ? "平衡度 / 100" : "Balance / 100"}</div>
        </div>
      </div>
    </div>
    <div class="balance-insight">
      <h4>${zh ? "五行平衡解读" : "Balance reading"}</h4>
      <p>${insight}</p>
    </div>
  </div>
</section>`;
}

function renderTraitCards(keywords: string[]): string {
  if (keywords.length === 0) return "";
  const cards = keywords.slice(0, 6).map((kw, i) => `
<div class="trait-card">
  <div class="trait-card-num">${String(i + 1).padStart(2, "0")}</div>
  <div class="trait-card-word">${escapeHtml(kw)}</div>
  <div class="trait-card-desc"></div>
</div>`).join("\n");
  return `<div class="trait-cards-grid">${cards}</div>`;
}

function renderPersonalityBlock(section: ReportSection, num: string, keywords: string[]): string {
  const paras = splitParagraphs(section.content);
  const textHtml = paras.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n");
  const badges = ["木", "火", "↑", "◇"];
  const traits = keywords.slice(0, 4).map((kw, i) => `
<div class="trait-item">
  <div class="trait-badge">${badges[i] || "◇"}</div>
  <div class="trait-content">
    <h5>${escapeHtml(kw)}</h5>
    <p>${escapeHtml(paras[i + 1] || paras[0] || "").slice(0, 80)}</p>
  </div>
</div>`).join("\n");

  return `
<section class="section" id="section-${num}" data-toc="${escapeAttr(section.title)}">
  <div class="section-header">
    <div class="section-number">${num}</div>
    <h2 class="section-title">${escapeHtml(section.title)}</h2>
    <p class="section-subtitle">日主性格特质与行为模式</p>
  </div>
  <div class="personality-grid">
    <div class="personality-text">${textHtml}</div>
    <div class="personality-traits-list">${traits || `<div class="trait-item"><div class="trait-badge">◇</div><div class="trait-content"><h5>日主</h5><p>${escapeHtml(paras[0] || "").slice(0, 100)}</p></div></div>`}</div>
  </div>
  ${renderTraitCards(keywords)}
</section>`;
}

function renderTalentBlock(section: ReportSection, num: string, keywords: string[]): string {
  const paras = splitParagraphs(section.content);
  const icons = ["木", "火", "土"];
  const cards = (paras.length ? paras : [section.content]).slice(0, 3).map((p, i) => {
    const title = keywords[i] || `优势 ${i + 1}`;
    const tags = keywords.slice(i * 2, i * 2 + 3);
    return `
<div class="talent-card">
  <div class="talent-icon">${icons[i] || "◇"}</div>
  <h4>${escapeHtml(title)}</h4>
  <p>${escapeHtml(p)}</p>
  ${tags.length ? `<div class="talent-tag-label">关键词</div><div class="talent-tags">${tags.map((t) => `<span class="talent-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
</div>`;
  }).join("\n");

  return `
<section class="section" id="section-${num}" data-toc="${escapeAttr(section.title)}">
  <div class="section-header">
    <div class="section-number">${num}</div>
    <h2 class="section-title">${escapeHtml(section.title)}</h2>
    <p class="section-subtitle">与生俱来的才华与容易取得成就的领域</p>
  </div>
  <div class="talent-cards">${cards}</div>
</section>`;
}

function renderCautionBlock(section: ReportSection, num: string): string {
  const paras = splitParagraphs(section.content);
  const head = paras[0] || section.title;
  const rest = paras.slice(1);
  const items = (rest.length ? rest : paras).slice(0, 3).map((p, i) => `
<div class="caution-item">
  <div class="caution-num">${i + 1}</div>
  <div class="caution-content">
    <h5>${escapeHtml(p.slice(0, 24))}${p.length > 24 ? "…" : ""}</h5>
    <p>${escapeHtml(p)}</p>
  </div>
</div>`).join("\n");

  return `
<section class="section" id="section-${num}" data-toc="${escapeAttr(section.title)}">
  <div class="section-header">
    <div class="section-number">${num}</div>
    <h2 class="section-title">${escapeHtml(section.title)}</h2>
    <p class="section-subtitle">命局中的薄弱环节与需要警惕的倾向</p>
  </div>
  <div class="caution-callout">
    <div class="caution-box">
      <h3 class="caution-box-title">${escapeHtml(head.slice(0, 40))}</h3>
      <p class="caution-box-desc">${escapeHtml(head)}</p>
    </div>
  </div>
  <div class="caution-items">${items}</div>
</section>`;
}

function renderWeeklyBlock(locale: string, favorable: string[] | undefined, sectionNum: string): string {
  const zh = locale.startsWith("zh");
  const cycle = (favorable && favorable.length ? favorable : ["木", "火", "土", "金", "水"]);
  const tipsZh: Record<string, string> = {
    木: "宜规划布局，开启新项目",
    火: "宜创意表达，社交拓展",
    土: "宜务实推进，财务整理",
    金: "宜复盘总结，优化流程",
    水: "宜学习充电，深度思考",
  };
  const tipsEn: Record<string, string> = {
    木: "Plan & start",
    火: "Create & connect",
    土: "Execute & organize",
    金: "Review & refine",
    水: "Study & reflect",
  };
  const dayNames = zh
    ? ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();
  const cards = dayNames.map((name, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const wx = cycle[i % cycle.length];
    const active = i === 0 ? " active" : "";
    return `
<div class="day-card${active}">
  <div class="day-name">${name}</div>
  <div class="day-date">${String(d.getDate()).padStart(2, "0")}</div>
  <div class="day-icon">${escapeHtml(wx)}</div>
  <div class="day-suggestion">${escapeHtml(zh ? (tipsZh[wx] || "宜顺应节奏") : (tipsEn[wx] || "Follow the flow"))}</div>
</div>`;
  }).join("\n");

  return `
<section class="section section-weekly" id="section-${sectionNum}" data-toc="${zh ? "行动建议" : "Actions"}">
  <div class="section-header">
    <div class="section-number">${sectionNum}</div>
    <h2 class="section-title">${zh ? "本周行动建议" : "This week"}</h2>
    <p class="section-subtitle">${zh ? "根据五行流转为你定制的每日能量指南" : "Daily cues from your elemental tilt"}</p>
  </div>
  <div class="weekly-timeline">${cards}</div>
</section>`;
}

function renderSectionBlock(
  section: ReportSection,
  index: number,
  opts?: { classic?: string; isFirst?: boolean },
): string {
  const num = String(index + 1).padStart(2, "0");
  const keywords = extractSectionKeywords(section.content, section.title);
  const kind = opts?.isFirst ? "insight" : classifySection(section.title);

  if (kind === "personality") return renderPersonalityBlock(section, num, keywords);
  if (kind === "talent") return renderTalentBlock(section, num, keywords);
  if (kind === "caution") return renderCautionBlock(section, num);

  const bodyHtml = renderMarkdown(section.content);
  const classicHtml = opts?.classic
    ? `<div class="pull-quote"><p class="pull-quote-text">${escapeHtml(opts.classic)}</p></div>`
    : "";
  const takeaway = keywords.length > 0
    ? `<div class="key-takeaway"><div class="key-takeaway-box">
        <div class="key-takeaway-label">${opts?.isFirst ? "你的核心能量" : "Key Signals"}</div>
        <ul class="key-takeaway-list">${keywords.slice(0, 5).map((kw) => `<li><strong>${escapeHtml(kw)}</strong></li>`).join("")}</ul>
      </div></div>`
    : "";

  const bodyWrap = kind === "insight" || opts?.isFirst
    ? `<div class="core-insight-body">${bodyHtml}</div>`
    : `<div class="section-body">${bodyHtml}</div>`;

  return `
<section class="section" id="section-${num}" data-toc="${escapeAttr(section.title)}">
  <div class="section-header">
    <div class="section-number">${num}</div>
    <h2 class="section-title">${escapeHtml(section.title)}</h2>
    ${opts?.isFirst ? `<p class="section-subtitle">你命局中最本质的能量特质与人生基调</p>` : ""}
  </div>
  ${classicHtml}
  ${bodyWrap}
  ${takeaway}
</section>`;
}

function renderProductRecommendBlock(product: ReportProductRecommend): string {
  return `
<section class="product-rec">
  <p class="product-rec-label">能量好物推荐</p>
  <h3 class="product-rec-name">${escapeHtml(product.name)}</h3>
  <p class="product-rec-desc">${escapeHtml(product.desc)}</p>
  <p class="product-rec-price">${escapeHtml(product.priceDisplay)}</p>
  <a class="product-rec-btn" href="${escapeAttr(product.shopUrl)}" target="_blank" rel="noopener noreferrer">前往购买</a>
</section>`;
}

function renderShareScript(payload: {
  shareUrl: string;
  shareText: string;
  shareTitle: string;
}): string {
  const data = JSON.stringify(payload);
  return `
<script>
(function(){
  var DATA = ${data};
  var overlay = document.getElementById('shareOverlay');
  var toast = document.getElementById('shareToast');
  function openShare(){ if(overlay){ overlay.classList.add('open'); document.body.style.overflow='hidden'; } }
  function closeShare(){ if(overlay){ overlay.classList.remove('open'); document.body.style.overflow=''; } }
  function showToast(msg){
    if(!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function(){ toast.classList.remove('show'); }, 1800);
  }
  async function copyText(text){
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      showToast('已复制');
      return true;
    } catch (e) {
      showToast('复制失败，请手动选择');
      return false;
    }
  }
  function enc(s){ return encodeURIComponent(s); }
  document.querySelectorAll('[data-share-open]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); openShare(); });
  });
  document.querySelectorAll('[data-share-close]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); closeShare(); });
  });
  if (overlay) {
    overlay.addEventListener('click', function(e){ if (e.target === overlay) closeShare(); });
  }
  var copyLink = document.getElementById('shareCopyLink');
  if (copyLink) copyLink.addEventListener('click', function(){ copyText(DATA.shareUrl); });
  var copyAll = document.getElementById('shareCopyAll');
  if (copyAll) copyAll.addEventListener('click', function(){ copyText(DATA.shareText); });
  var nativeBtn = document.getElementById('shareNative');
  if (nativeBtn) nativeBtn.addEventListener('click', async function(){
    if (navigator.share) {
      try { await navigator.share({ title: DATA.shareTitle, text: DATA.shareText, url: DATA.shareUrl }); }
      catch (e) { /* cancelled */ }
    } else {
      copyText(DATA.shareText);
    }
  });
  function bindPlatform(id, url){
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('click', function(e){
      e.preventDefault();
      window.open(url, '_blank', 'noopener,noreferrer,width=640,height=560');
    });
  }
  bindPlatform('shareWeibo', 'https://service.weibo.com/share/share.php?url=' + enc(DATA.shareUrl) + '&title=' + enc(DATA.shareText));
  bindPlatform('shareX', 'https://twitter.com/intent/tweet?text=' + enc(DATA.shareText));
  bindPlatform('shareFacebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(DATA.shareUrl));
  bindPlatform('shareLinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(DATA.shareUrl));
  bindPlatform('shareTelegram', 'https://t.me/share/url?url=' + enc(DATA.shareUrl) + '&text=' + enc(DATA.shareTitle));
  var emailBtn = document.getElementById('shareEmail');
  if (emailBtn) emailBtn.addEventListener('click', function(e){
    e.preventDefault();
    window.location.href = 'mailto:?subject=' + enc(DATA.shareTitle) + '&body=' + enc(DATA.shareText);
  });
  var wechatBtn = document.getElementById('shareWechat');
  if (wechatBtn) wechatBtn.addEventListener('click', async function(){
    await copyText(DATA.shareText);
    showToast('文案已复制，打开微信粘贴分享');
  });

  var topNav = document.getElementById('topNav');
  var tocItems = document.querySelectorAll('.toc-item');
  var sections = Array.prototype.slice.call(document.querySelectorAll('section.section[id]'));
  function onScroll(){
    if (topNav) {
      if (window.scrollY > 72) topNav.classList.add('scrolled');
      else topNav.classList.remove('scrolled');
    }
    var current = null;
    var y = window.scrollY + 140;
    for (var i = sections.length - 1; i >= 0; i--) {
      if (sections[i].offsetTop <= y) { current = sections[i].id; break; }
    }
    tocItems.forEach(function(item){
      item.classList.toggle('active', item.getAttribute('data-section') === current);
    });
  }
  tocItems.forEach(function(item){
    var a = item.querySelector('a');
    if (!a) return;
    a.addEventListener('click', function(e){
      e.preventDefault();
      var id = a.getAttribute('href').slice(1);
      var target = document.getElementById(id);
      if (target) window.scrollTo({ top: target.offsetTop - 96, behavior: 'smooth' });
    });
  });
  var ticking = false;
  window.addEventListener('scroll', function(){
    if (!ticking) {
      requestAnimationFrame(function(){ onScroll(); ticking = false; });
      ticking = true;
    }
  });
  onScroll();
  document.querySelectorAll('.day-card').forEach(function(card){
    card.addEventListener('click', function(){
      document.querySelectorAll('.day-card').forEach(function(c){ c.classList.remove('active'); });
      card.classList.add('active');
    });
  });
})();
</script>`;
}

/** 生成完整静态报告 HTML 页面（用户中心 / 邮件 / 分享） */
export function buildReportPageHtml(options: ReportPageOptions): string {
  const date = options.generatedAt ?? new Date();
  const locale = options.locale || "zh-CN";
  const zh = isChineseLocale(locale);
  const brandPrimary = siteDisplayName(locale);
  const brandSignature = siteSignature(locale);
  const brandLockup = brandLockupHtml(locale);
  const brandedContent = sanitizeReportBrandText(options.reportContent);
  const sections = parseReportSections(brandedContent);
  const chart = options.chart || {};
  const name = (options.subjectName || chart.name || (zh ? "访客" : "Guest")).trim() || (zh ? "访客" : "Guest");
  const yearP = pillarStr(chart.year);
  const monthP = pillarStr(chart.month);
  const dayP = pillarStr(chart.day);
  const hourP = pillarStr(chart.hour);
  const pillars = [yearP, monthP, dayP, hourP].filter(Boolean).join(" ");
  const issue = issueLabel(date, yearP);
  const dayMasterLine = chart.dayMasterLine
    || (chart.riZhu
      ? (zh
        ? `代表你的字：${chart.riZhu}${chart.strength ? `　·　${chart.strength}` : ""}`
        : `Day master ${chart.riZhu}${chart.strength ? ` · ${chart.strength}` : ""}`)
      : "");
  const subhead = dayMasterLine
    || chart.gridCaption
    || (zh ? `${options.planLabel} · 命局结构速览` : `${options.planLabel} · Structure brief`);

  const shareUrl = options.shareUrl || "https://bazi.orasage.com";
  const share = buildShareCopy({
    name,
    dayMaster: dayMasterLine || subhead,
    planLabel: options.planLabel,
    url: shareUrl,
    locale,
  });

  const classicFromFirst = (() => {
    if (!sections[0]) return "";
    const m = sections[0].content.match(/(?:经典|术语|原文)[：:]\s*(.+)$/m)
      || sections[0].content.match(/[「"](.+?)[」"]/);
    return m?.[1]?.trim() || chart.gridCaption || "";
  })();

  let sectionIdx = 0;
  const contentSections: string[] = [];
  if (sections.length > 0) {
    contentSections.push(renderSectionBlock(sections[0], sectionIdx++, {
      isFirst: true,
      classic: classicFromFirst,
    }));
  }
  {
    const n = String(sectionIdx + 1).padStart(2, "0");
    const mingpan = renderMingPanBlock(chart, locale, n);
    if (mingpan) {
      sectionIdx++;
      contentSections.push(mingpan);
    }
  }
  if (chart.wuXing && Object.keys(chart.wuXing).length > 0) {
    const n = String(sectionIdx + 1).padStart(2, "0");
    sectionIdx++;
    contentSections.push(renderWuXingBlock(chart.wuXing, locale, n));
  }
  for (let i = 1; i < sections.length; i++) {
    contentSections.push(renderSectionBlock(sections[i], sectionIdx++));
  }
  if (sections.length === 0) {
    contentSections.push(`
<section class="section" id="section-01" data-toc="${zh ? "报告正文" : "Report"}">
  <div class="section-header">
    <div class="section-number">01</div>
    <h2 class="section-title">${zh ? "命局解读" : "Reading"}</h2>
  </div>
  <div class="section-body">${renderMarkdown(brandedContent)}</div>
</section>`);
    sectionIdx = Math.max(sectionIdx, 1);
  }
  if (chart.luckyLine) {
    const n = String(sectionIdx + 1).padStart(2, "0");
    sectionIdx++;
    contentSections.push(`
<section class="section" id="section-${n}" data-toc="${zh ? "方向提示" : "Direction"}">
  <div class="section-header">
    <div class="section-number">${n}</div>
    <h2 class="section-title">${zh ? "方向提示" : "Direction"}</h2>
    <p class="section-subtitle">${zh ? "顺着喜用走，比硬扛更省力" : "Lean into what supports this chart"}</p>
  </div>
  <div class="section-body"><p>${escapeHtml(chart.luckyLine)}</p></div>
</section>`);
  }
  {
    const n = String(sectionIdx + 1).padStart(2, "0");
    contentSections.push(renderWeeklyBlock(locale, chart.favorable, n));
  }

  const tocItems = contentSections
    .map((html, i) => {
      const idMatch = html.match(/id="(section-[^"]+)"/);
      const tocMatch = html.match(/data-toc="([^"]+)"/);
      if (!idMatch || !tocMatch) return "";
      const num = String(i + 1).padStart(2, "0");
      return `<li class="toc-item${i === 0 ? " active" : ""}" data-section="${idMatch[1]}"><a href="#${idMatch[1]}"><span class="toc-num">${num}</span>${escapeHtml(tocMatch[1])}</a></li>`;
    })
    .filter(Boolean)
    .join("\n");

  const productHtml = options.productRecommend
    ? renderProductRecommendBlock(options.productRecommend)
    : "";

  const upgradeUrl = options.upgradeUrl || "https://bazi.orasage.com/";
  const paywallHtml = options.showUpgrade
    ? `
<section class="paywall-section">
  <div class="paywall-pattern"></div>
  <div class="paywall-content">
    <div class="paywall-label">Premium Edition</div>
    <h2 class="paywall-headline">${zh ? "解锁完整命局报告" : "Unlock the full reading"}</h2>
    <p class="paywall-subhead">${zh ? "深入探索你的人生轨迹，获取专属指导与建议" : "Go deeper into timing, career, and relationship guidance."}</p>
    <ul class="paywall-features">
      <li>${zh ? "十年大运详细解读" : "Decade luck cycles"}</li>
      <li>${zh ? "流年运势逐月分析" : "Year-by-year outlook"}</li>
      <li>${zh ? "事业财运深度报告" : "Career & wealth depth"}</li>
      <li>${zh ? "感情婚姻匹配指南" : "Relationship guidance"}</li>
      <li>${zh ? "方位颜色数字提示" : "Timing & direction cues"}</li>
    </ul>
    <a class="paywall-cta" href="${escapeAttr(upgradeUrl)}">${zh ? "升级专业版" : "Upgrade"} <span>→</span></a>
    <a class="paywall-secondary" href="#" data-share-open>${zh ? "分享给朋友" : "Share with a friend"}</a>
  </div>
</section>`
    : "";

  const personBits = [
    `<span class="hero-person-name">${escapeHtml(name)}</span>`,
    chart.birthStr ? `<span class="diamond-divider"></span><span>${escapeHtml(chart.birthStr)}</span>` : "",
    chart.birthplace ? `<span class="diamond-divider"></span><span>${escapeHtml(chart.birthplace)}</span>` : "",
    pillars ? `<span class="diamond-divider"></span><span>${escapeHtml(pillars)}</span>` : "",
  ].filter(Boolean).join("\n");

  const avatarChar = name.slice(0, 1);
  const pageTitle = `${brandPrimary} · ${options.planLabel} · ${name}`;
  const ogImage = "https://bazi.orasage.com/brand/og.png";

  const tier = options.tier ?? (options.showUpgrade ? "free" : "paid");

  return `<!doctype html>
<html lang="${escapeAttr(locale)}" data-report-tier="${tier}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(pageTitle)}</title>
<meta name="description" content="${escapeAttr(share.description)}">
<meta property="og:site_name" content="${escapeAttr(brandSignature)}">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeAttr(share.title)}">
<meta property="og:description" content="${escapeAttr(share.description)}">
<meta property="og:url" content="${escapeAttr(shareUrl)}">
<meta property="og:image" content="${escapeAttr(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(share.title)}">
<meta name="twitter:description" content="${escapeAttr(share.description)}">
<meta name="twitter:image" content="${escapeAttr(ogImage)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,18..72,300;0,18..72,400;0,18..72,500;1,18..72,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>${REPORT_PAGE_CSS}</style>
</head>
<body>
<nav class="top-nav" id="topNav">
  <div class="top-nav-inner">
    <a class="nav-logo" href="https://orasage.com" rel="noopener">
      <div class="nav-logo-mark"><div class="diamond-shape"></div><div class="diamond-inner"></div></div>
      ${brandLockup}
    </a>
    <span class="nav-section-label">${zh ? "八字报告" : "Bazi Report"} · ${escapeHtml(options.planLabel)}</span>
    <div class="nav-actions">
      <button type="button" class="nav-share-btn" data-share-open>${zh ? "分享" : "Share"}</button>
      <div class="nav-avatar" aria-hidden="true">${escapeHtml(avatarChar)}</div>
    </div>
  </div>
</nav>

<section class="hero" id="hero">
  <div class="hero-issue">${escapeHtml(issue)}</div>
  <div class="hero-content">
    <h1 class="hero-headline">${zh ? "你的命局解读" : "Your Bazi Reading"}</h1>
    <p class="hero-subhead">${escapeHtml(subhead)}</p>
    <div class="hero-person-row">${personBits}</div>
  </div>
  <div class="hero-decoration" aria-hidden="true">
    <div class="star-compass">
      <span class="compass-n">☰</span><span class="compass-s">☷</span>
      <span class="compass-e">☲</span><span class="compass-w">☵</span>
      <div class="compass-center"><div class="compass-center-inner"></div></div>
    </div>
  </div>
  <div class="scroll-indicator"><span>Scroll</span><div class="scroll-indicator-line"></div></div>
</section>

${tocItems ? `<div class="toc" id="toc"><ul class="toc-list">${tocItems}</ul></div>` : ""}

<main>
${contentSections.join("\n")}
${productHtml}
</main>

${paywallHtml}

<footer class="footer">
  <div class="footer-brand">${brandLockup}</div>
  <p class="footer-tagline">${zh ? "命理与能量" : "The Art of Timing"}</p>
  <div class="footer-links">
    <a class="footer-link" href="https://orasage.com" target="_blank" rel="noopener">orasage.com</a>
    <a class="footer-link" href="https://bazi.orasage.com" target="_blank" rel="noopener">${zh ? "八字排盘" : "Bazi"}</a>
    <a class="footer-link" href="#" data-share-open>${zh ? "分享报告" : "Share"}</a>
  </div>
  <p class="footer-copyright">${escapeHtml(copyrightLine(locale, date.getFullYear()))}</p>
  <p class="footer-note">${zh
    ? `本报告由 ${brandSignature} 八字命理系统生成，内容仅供文化娱乐与自我探索参考。`
    : `Generated by ${brandSignature} for cultural exploration and entertainment only.`}</p>
</footer>

<button type="button" class="fab-share" data-share-open aria-label="Share">${zh ? "分享" : "Share"}</button>

<div class="share-overlay" id="shareOverlay" role="dialog" aria-modal="true" aria-labelledby="shareSheetTitle">
  <div class="share-sheet">
    <div class="share-sheet-head">
      <div>
        <h2 class="share-sheet-title" id="shareSheetTitle">${zh ? "分享我的八字速览" : "Share this reading"}</h2>
        <p class="share-sheet-sub">${zh ? "按设计规范生成的分享卡与文案" : "Designed share card & caption"}</p>
      </div>
      <button type="button" class="share-close" data-share-close aria-label="Close">×</button>
    </div>
    <div class="share-card">
      <div class="share-card-brand">${brandLockup}</div>
      <div class="share-card-issue">${escapeHtml(issue)}</div>
      <div class="share-card-headline">${escapeHtml(name)}</div>
      <p class="share-card-line">${escapeHtml(dayMasterLine || subhead)}</p>
      <p class="share-card-meta">${escapeHtml(options.planLabel)}${pillars ? ` · ${escapeHtml(pillars)}` : ""}</p>
    </div>
    <div class="share-copy-box" id="shareCopyPreview">${escapeHtml(share.text)}</div>
    <div class="share-actions">
      <button type="button" class="share-btn primary" id="shareCopyAll">${zh ? "复制分享文案" : "Copy caption"}</button>
      <button type="button" class="share-btn" id="shareCopyLink">${zh ? "复制链接" : "Copy link"}</button>
      <button type="button" class="share-btn" id="shareNative">${zh ? "系统分享" : "Native share"}</button>
      <button type="button" class="share-btn" id="shareWechat">${zh ? "微信 / 朋友圈" : "WeChat"}</button>
    </div>
    <div class="share-platforms">
      <button type="button" class="share-platform" id="shareWeibo"><span class="share-platform-icon"><span>微</span></span>微博</button>
      <button type="button" class="share-platform" id="shareX"><span class="share-platform-icon"><span>X</span></span>X</button>
      <button type="button" class="share-platform" id="shareFacebook"><span class="share-platform-icon"><span>f</span></span>Facebook</button>
      <button type="button" class="share-platform" id="shareLinkedIn"><span class="share-platform-icon"><span>in</span></span>LinkedIn</button>
      <button type="button" class="share-platform" id="shareTelegram"><span class="share-platform-icon"><span>Tg</span></span>Telegram</button>
      <button type="button" class="share-platform" id="shareEmail"><span class="share-platform-icon"><span>@</span></span>Email</button>
    </div>
  </div>
</div>
<div class="share-toast" id="shareToast" role="status"></div>

${renderShareScript({ shareUrl, shareText: share.text, shareTitle: share.title })}
</body>
</html>`;
}
