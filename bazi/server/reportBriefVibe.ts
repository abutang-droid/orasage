/**
 * 免费简版静态页 — 对齐 Vibe Camp 卡片稿（日主 / 四柱 / 五行环+条+雷达 / 能量 / 洞察 / CTA）。
 * 不加载 Tailwind、lucide CDN；详版杂志页不走这里。
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
import { strengthKind, strengthShort } from "../shared/vernacular.ts";
import { BRIEF_VIBE_CSS } from "./reportBriefVibeStyles.ts";
import type { ReportChartMeta, ReportPageOptions } from "./reportHtml.ts";

const BRIEF_COPY_MAX = 200;

function condenseBriefCopy(source: string, max = BRIEF_COPY_MAX): string {
  const plain = source
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*?/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
  const chars = [...plain];
  if (chars.length <= max) return plain;
  const head = chars.slice(0, max).join("");
  const marks = ["。", "！", "？", "；", ".", "!", "?"];
  let best = -1;
  for (const mark of marks) {
    const i = head.lastIndexOf(mark);
    if (i > best) best = i;
  }
  if (best >= 24) return head.slice(0, best + 1);
  return `${head.replace(/[，、,\s]+$/u, "")}…`;
}

function parseReportSections(markdown: string): Array<{ title: string; content: string }> {
  const lines = markdown.split("\n");
  const sections: Array<{ title: string; content: string }> = [];
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

const WX_BAR_ORDER = ["金", "火", "土", "水", "木"] as const;
type WxName = (typeof WX_BAR_ORDER)[number];
const WX_CHART_VAR: Record<WxName, string> = {
  金: "var(--chart-1)",
  火: "var(--chart-2)",
  土: "var(--chart-3)",
  水: "var(--chart-4)",
  木: "var(--chart-5)",
};
const GAN_WX: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};
const DEFAULT_UPGRADE = "https://shop.orasage.com/checkout?sku=report-bazi-basic&appSource=bazi&planType=basic";

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

function icon(name: "calendar" | "sparkles" | "grid" | "bars" | "zap" | "lock"): string {
  const common = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const paths: Record<typeof name, string> = {
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>`,
    sparkles: `<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M20 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>`,
    grid: `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>`,
    bars: `<path d="M4 19V9M12 19V5M20 19v-7"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    lock: `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>`,
  };
  return `<svg viewBox="0 0 24 24" ${common} aria-hidden="true">${paths[name]}</svg>`;
}

function genderLabel(raw: string | undefined, zh: boolean): string {
  const g = (raw || "").trim().toLowerCase();
  if (g === "male" || g === "m" || g === "男") return zh ? "男命" : "Male";
  if (g === "female" || g === "f" || g === "女") return zh ? "女命" : "Female";
  return "";
}

function strengthPct(strength: string): number {
  const k = strengthKind(strength);
  if (k === "身强") return 84;
  if (k === "身弱") return 42;
  return 62;
}

function roundPercents(values: number[]): number[] {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floors = raw.map((v) => Math.floor(v + 1e-9));
  let remain = 100 - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v + 1e-9) }))
    .sort((a, b) => b.frac - a.frac || a.i - b.i);
  const out = [...floors];
  for (let k = 0; k < remain; k++) out[order[k].i] += 1;
  return out;
}

type WxSlice = { name: WxName; value: number; percent: number; barPct: number };

function wxSlices(wuXing: Record<string, number>): WxSlice[] {
  const values = WX_BAR_ORDER.map((k) => {
    const n = Number(wuXing[k] ?? 0);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });
  const percents = roundPercents(values);
  const max = Math.max(...values, 0.001);
  return WX_BAR_ORDER.map((name, i) => ({
    name,
    value: values[i],
    percent: percents[i],
    barPct: Math.round((values[i] / max) * 100),
  }));
}

function classifyWx(slices: WxSlice[]): { wang: WxName[]; ruo: WxName[]; balanced: boolean } {
  const wang: WxName[] = [];
  const ruo: WxName[] = [];
  for (const s of slices) {
    if (s.percent >= 22) wang.push(s.name);
    else if (s.percent < 10) ruo.push(s.name);
  }
  wang.sort((a, b) => (slices.find((s) => s.name === b)?.percent || 0) - (slices.find((s) => s.name === a)?.percent || 0));
  const allMid = slices.every((s) => s.percent >= 10 && s.percent < 22);
  return { wang: allMid ? [] : wang, ruo: allMid ? [] : ruo, balanced: allMid };
}

function briefCopyFromOptions(options: ReportPageOptions): string {
  const branded = sanitizeReportBrandText(options.reportContent || "");
  const sections = parseReportSections(branded);
  const fromSections = sections.map((s) => s.content).filter(Boolean).join(" ");
  const body = fromSections || branded;
  return condenseBriefCopy(body);
}

function pillarCells(chart: ReportChartMeta, zh: boolean): string {
  const cols = [
    { key: "year" as const, zh: "年柱", en: "Year", p: chart.year, day: false },
    { key: "month" as const, zh: "月柱", en: "Month", p: chart.month, day: false },
    { key: "day" as const, zh: "日柱 · 日主", en: "Day master", p: chart.day, day: true },
    { key: "hour" as const, zh: "时柱", en: "Hour", p: chart.hour, day: false },
  ];
  const present = cols.filter((c) => c.p?.gan && c.p?.zhi);
  if (present.length === 0) return "";
  const cells = present.map((c) => `
<div class="bv-pillar${c.day ? " is-day" : ""} mp-pillar${c.day ? " is-day-master" : ""}">
  <p class="bv-pillar-label mp-label">${zh ? c.zh : c.en}</p>
  <p class="bv-pillar-gan mp-gan">${escapeHtml(c.p!.gan)}</p>
  <p class="bv-pillar-zhi mp-zhi">${escapeHtml(c.p!.zhi)}</p>
</div>`).join("");
  return `<div class="mingpan-board is-single-row bv-pillars" role="img" aria-label="${zh ? "四柱命盘" : "Four Pillars"}">${cells}</div>`;
}

function donutSvg(slices: WxSlice[]): string {
  const r = 42;
  const C = 2 * Math.PI * r;
  let offset = 0;
  const circles = slices.filter((s) => s.percent > 0).map((s) => {
    const len = (s.percent / 100) * C;
    const dash = `${Math.max(len - 1.5, 0).toFixed(2)} ${(C - Math.max(len - 1.5, 0)).toFixed(2)}`;
    const el = `<circle cx="50" cy="50" r="${r}" fill="none" stroke="${WX_CHART_VAR[s.name]}" stroke-width="10" stroke-dasharray="${dash}" stroke-dashoffset="${(-offset).toFixed(2)}" stroke-linecap="round"/>`;
    offset += len;
    return el;
  }).join("");
  return `<svg class="bv-donut" viewBox="0 0 100 100" aria-hidden="true">${circles}</svg>`;
}

function radarSvg(slices: WxSlice[], zh: boolean): string {
  const CX = 130;
  const CY = 110;
  const R = 75;
  const maxVal = Math.max(...slices.map((s) => s.value), 1);
  const byName = new Map(slices.map((s) => [s.name, s.value]));
  const angles = WX_BAR_ORDER.map((_, i) => ((i * 72 - 90) * Math.PI) / 180);
  const point = (idx: number, ratio: number) => ({
    x: CX + R * ratio * Math.cos(angles[idx]),
    y: CY + R * ratio * Math.sin(angles[idx]),
  });
  const grid = [1, 0.8, 0.6, 0.4, 0.2].map((ratio) => {
    const pts = WX_BAR_ORDER.map((_, i) => {
      const p = point(i, ratio);
      return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
    }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="var(--border)" stroke-width="1"/>`;
  }).join("");
  const axes = angles.map((a, i) =>
    `<line x1="${CX}" y1="${CY}" x2="${(CX + R * Math.cos(a)).toFixed(2)}" y2="${(CY + R * Math.sin(a)).toFixed(2)}" stroke="var(--border)" stroke-width="1"/>`
  ).join("");
  const dataPts = WX_BAR_ORDER.map((name, i) => {
    const p = point(i, (byName.get(name) ?? 0) / maxVal);
    return `${p.x.toFixed(2)},${p.y.toFixed(2)}`;
  }).join(" ");
  const labels = WX_BAR_ORDER.map((name, i) => {
    const p = point(i, 1.18);
    const val = byName.get(name) ?? 0;
    const anchor = i === 1 ? "start" : i === 4 ? "end" : "middle";
    return `<text x="${p.x.toFixed(2)}" y="${p.y.toFixed(2)}" text-anchor="${anchor}" dominant-baseline="middle" font-size="11" font-weight="500" fill="var(--foreground)">${name} ${val.toFixed(1)}</text>`;
  }).join("");
  return `
<div class="bv-radar wx-radar-wrap">
  <svg class="wx-radar" viewBox="0 0 260 220" role="img" aria-label="${zh ? "五行雷达图" : "Five-element radar"}">
    ${grid}${axes}
    <polygon points="${dataPts}" fill="var(--primary)" fill-opacity="0.18" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round"/>
    ${labels}
  </svg>
</div>`;
}

function renderShareScript(payload: { shareUrl: string; shareText: string; shareTitle: string }): string {
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
      if (navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(text);
      else {
        var ta = document.createElement('textarea');
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand('copy'); document.body.removeChild(ta);
      }
      showToast('已复制');
    } catch (e) { showToast('复制失败，请手动选择'); }
  }
  function enc(s){ return encodeURIComponent(s); }
  document.querySelectorAll('[data-share-open]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); openShare(); });
  });
  document.querySelectorAll('[data-share-close]').forEach(function(el){
    el.addEventListener('click', function(e){ e.preventDefault(); closeShare(); });
  });
  if (overlay) overlay.addEventListener('click', function(e){ if (e.target === overlay) closeShare(); });
  var copyLink = document.getElementById('shareCopyLink');
  if (copyLink) copyLink.addEventListener('click', function(){ copyText(DATA.shareUrl); });
  var copyAll = document.getElementById('shareCopyAll');
  if (copyAll) copyAll.addEventListener('click', function(){ copyText(DATA.shareText); });
  var nativeBtn = document.getElementById('shareNative');
  if (nativeBtn) nativeBtn.addEventListener('click', async function(){
    if (navigator.share) {
      try { await navigator.share({ title: DATA.shareTitle, text: DATA.shareText, url: DATA.shareUrl }); }
      catch (e) {}
    } else copyText(DATA.shareText);
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
})();
</script>`;
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
  return { text: `${description}\n${opts.url}`, title, description };
}

export function buildBriefVibePageHtml(options: ReportPageOptions & { radarFallbackHtml?: string }): string {
  const date = options.generatedAt ?? new Date();
  const locale = options.locale || "zh-CN";
  const zh = isChineseLocale(locale);
  const brandPrimary = siteDisplayName(locale);
  const brandSignature = siteSignature(locale);
  const brandLockup = brandLockupHtml(locale);
  const chart = options.chart || {};
  const name = (options.subjectName || chart.name || (zh ? "访客" : "Guest")).trim() || (zh ? "访客" : "Guest");
  const yearP = chart.year?.gan && chart.year?.zhi ? `${chart.year.gan}${chart.year.zhi}` : "";
  const monthP = chart.month?.gan && chart.month?.zhi ? `${chart.month.gan}${chart.month.zhi}` : "";
  const dayP = chart.day?.gan && chart.day?.zhi ? `${chart.day.gan}${chart.day.zhi}` : "";
  const hourP = chart.hour?.gan && chart.hour?.zhi ? `${chart.hour.gan}${chart.hour.zhi}` : "";
  const pillarsLine = [yearP, monthP, dayP, hourP].filter(Boolean).join(" ");
  const riZhu = (chart.riZhu || chart.day?.gan || "").trim();
  const riWx = GAN_WX[riZhu] || "";
  const strengthLabel = chart.strength ? strengthShort(chart.strength, zh ? "zh" : "en") : "";
  const pct = strengthPct(chart.strength || "");
  const circumference = 2 * Math.PI * 42;
  const energyDash = `${((pct / 100) * circumference).toFixed(1)} ${circumference.toFixed(1)}`;
  const dayMasterLine = chart.dayMasterLine
    || (riZhu
      ? (zh
        ? `代表你的字：${riZhu}${chart.strength ? `　·　${chart.strength}` : ""}`
        : `Day master ${riZhu}${chart.strength ? ` · ${chart.strength}` : ""}`)
      : "");
  const briefCopy = briefCopyFromOptions(options);
  const keywords = extractSectionKeywords(briefCopy).slice(0, 4);
  const chips = (keywords.length >= 2
    ? keywords
    : [strengthLabel, riWx, ...(chart.favorable || []).slice(0, 2)].filter(Boolean)
  ).slice(0, 4);
  const gender = genderLabel(chart.gender, zh);
  const metaBits = [gender, chart.birthStr, chart.birthplace].filter(Boolean).join(" · ");
  const heroBadge = zh
    ? `${riZhu}${riWx ? riWx : ""}${riZhu ? "日主" : "命盘"}${strengthLabel ? ` · ${strengthLabel}` : ""}`
    : `${riZhu}${riWx ? ` ${riWx}` : ""} day master${strengthLabel ? ` · ${strengthLabel}` : ""}`;
  const heroTitle = zh ? `${name}的命盘速读` : `${name}'s chart brief`;
  const heroHeadline = zh ? "你的结构速览" : "Your chart brief";
  const heroLead = zh
    ? "快速了解你的命盘结构、五行能量与核心建议"
    : "A quick look at your pillars, five-element energy, and core notes";
  const upgradeUrl = options.upgradeUrl || DEFAULT_UPGRADE;
  const shareUrl = options.shareUrl || "https://bazi.orasage.com";
  const share = buildShareCopy({
    name,
    dayMaster: dayMasterLine || heroHeadline,
    planLabel: options.planLabel,
    url: shareUrl,
    locale,
  });
  const pageTitle = `${brandPrimary} · ${options.planLabel} · ${name}`;
  const ogImage = "https://bazi.orasage.com/brand/og.png";
  const issue = yearP ? `ISSUE · ${yearP}` : "ISSUE";

  const pillarsHtml = pillarCells(chart, zh);
  const wuXing = chart.wuXing && Object.keys(chart.wuXing).length > 0 ? chart.wuXing : null;
  const slices = wuXing ? wxSlices(wuXing) : [];
  const top = slices.slice().sort((a, b) => b.percent - a.percent)[0];
  const balance = slices.length ? classifyWx(slices) : null;
  const bars = slices.map((s) => `
<div>
  <div class="bv-bar-head"><span>${s.name}</span><span class="bv-bar-val">${s.value.toFixed(1)}</span></div>
  <div class="bv-bar-track"><div class="bv-bar-fill" style="width:${s.barPct}%;background-color:${WX_CHART_VAR[s.name]}"></div></div>
</div>`).join("");

  const wangNames = (balance?.wang.length ? balance.wang : slices.slice(0, 2).map((s) => s.name)).join("、");
  const wangLine = balance?.balanced
    ? (zh ? "五行大致均衡" : "Elements are roughly even")
    : (zh
      ? `<span class="bv-wx-hot">${wangNames}</span>${balance?.ruo.length ? ` · ${balance.ruo.join("、")}弱` : ""}`
      : `Strongest: ${(balance?.wang.length ? balance.wang : slices.slice(0, 2).map((s) => s.name)).join(", ")}${balance?.ruo.length ? ` · weak ${balance.ruo.join(", ")}` : ""}`);

  const energyText = (chart.dayMasterLine || chart.gridCaption || briefCopy.split(/[。！？]/)[0] || "")
    .replace(/\s+/g, " ")
    .trim();

  const insightChips = chips.map((c) => `<span class="bv-chip insight">${escapeHtml(c)}</span>`).join("");

  return `<!doctype html>
<html lang="${escapeAttr(locale)}" class="report-longform brief-vibe" data-report-tier="free" data-brief-layout="v4" data-brief-skin="ochre">
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
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,18..72,400;0,18..72,500;1,18..72,400&family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Poppins:wght@400;500;600&family=Noto+Serif+SC:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>${BRIEF_VIBE_CSS}</style>
</head>
<body>
<main class="bv-main">
  <header class="bv-header" data-dom-id="simple-header">
    <div class="bv-header-row">
      <div class="bv-brand">
        <span class="bv-mark">${icon("calendar")}</span>
        <span class="bv-eyebrow">Bazi Report</span>
      </div>
      <div class="bv-header-actions">
        <button type="button" class="bv-share-btn" data-share-open>${zh ? "分享" : "Share"}</button>
        <span class="bv-badge">${zh ? "简版" : "Brief"}</span>
      </div>
    </div>
    <h1 class="bv-h1">${escapeHtml(heroHeadline)}</h1>
    <p class="bv-lead">${escapeHtml(heroLead)}</p>
  </header>

  <article class="bv-card" data-dom-id="simple-hero">
    <div class="bv-hero">
      <div class="bv-day-seal">
        <span class="bv-day-char">${escapeHtml(riZhu || name.slice(0, 1))}</span>
        <span class="bv-day-tag">${zh ? "日主" : "DM"}</span>
      </div>
      <div class="bv-hero-body">
        <div class="bv-chip primary">${icon("sparkles")}<span>${escapeHtml(heroBadge.trim())}</span></div>
        <h2 class="bv-h2">${escapeHtml(heroTitle)}</h2>
        ${metaBits ? `<p class="bv-meta">${escapeHtml(metaBits)}</p>` : ""}
        <div class="bv-chip-row">
          ${(chart.favorable && chart.favorable.length)
            ? `<span class="bv-chip fav">${zh ? "喜用：" : "Useful: "}${escapeHtml(chart.favorable.join(zh ? "、" : ", "))}</span>`
            : ""}
          ${(chart.unfavorable && chart.unfavorable.length)
            ? `<span class="bv-chip unfav">${zh ? "忌神：" : "Watch: "}${escapeHtml(chart.unfavorable.join(zh ? "、" : ", "))}</span>`
            : ""}
        </div>
      </div>
    </div>
  </article>

  ${pillarsHtml ? `<article class="bv-card" data-dom-id="simple-pillars">
    <div class="bv-card-head">
      <p class="bv-eyebrow">${zh ? "四柱命盘" : "Four Pillars"}</p>
      <span class="bv-icon">${icon("grid")}</span>
    </div>
    ${pillarsHtml}
  </article>` : ""}

  ${slices.length || options.radarFallbackHtml ? `<article class="bv-card" data-dom-id="simple-elements">
    <div class="bv-card-head">
      <p class="bv-eyebrow">${zh ? "五行分析" : "Five Elements"}</p>
      <span class="bv-icon">${icon("bars")}</span>
    </div>
    ${slices.length ? `<div class="bv-wx-row">
      <div class="bv-donut-wrap">
        ${donutSvg(slices)}
        <div class="bv-donut-center">
          <span class="bv-donut-kicker">${zh ? "最旺" : "Peak"}</span>
          <span class="bv-donut-name">${top ? escapeHtml(top.name) : "—"}</span>
          <span class="bv-donut-pct">${top ? `${top.percent}%` : ""}</span>
        </div>
      </div>
      <div class="bv-bars">${bars}</div>
    </div>
    <div class="bv-wx-note">
      <p><span class="bv-wx-strong">${zh ? "五行旺相：" : "Balance: "}</span>${wangLine}</p>
      ${chart.luckyLine ? `<p class="sub">${escapeHtml(chart.luckyLine)}</p>` : ""}
    </div>
    ${radarSvg(slices, zh)}` : options.radarFallbackHtml || ""}
  </article>` : ""}

  <article class="bv-card" data-dom-id="simple-energy">
    <div class="bv-card-head left">
      <span class="bv-icon accent">${icon("zap")}</span>
      <p class="bv-eyebrow">${zh ? "日主能量层" : "Day-master energy"}</p>
    </div>
    <div class="bv-energy">
      <div class="bv-gauge">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--muted)" stroke-width="8"/>
          <circle cx="50" cy="50" r="42" fill="none" stroke="var(--primary)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${energyDash}" stroke-dashoffset="0"/>
        </svg>
        <div class="bv-gauge-center">
          <span class="bv-gauge-pct">${pct}%</span>
          <span class="bv-gauge-lbl">${escapeHtml(strengthLabel || (zh ? "均衡" : "Balanced"))}</span>
        </div>
      </div>
      <p>${escapeHtml(energyText || (zh ? "日主能量由四柱结构给出轮廓。" : "Day-master energy follows the pillar structure."))}</p>
    </div>
  </article>

  <article class="bv-card" data-dom-id="simple-insight">
    <div class="bv-card-head left">
      <span class="bv-icon accent">${icon("sparkles")}</span>
      <p class="bv-eyebrow">${zh ? "核心洞察" : "Core insight"}</p>
    </div>
    <p>${escapeHtml(briefCopy || (zh ? "这套四柱给出了你眼下的结构轮廓。" : "These four pillars sketch the structure of this chart."))}</p>
    ${insightChips ? `<div class="bv-chip-row">${insightChips}</div>` : ""}
  </article>

  <article class="bv-cta" data-dom-id="simple-cta">
    <div class="bv-cta-lock">${icon("lock")}</div>
    <h3>${zh ? "查看完整命理报告" : "Unlock the full reading"}</h3>
    <p class="sub">${zh ? "七大章节 · 深度解读 · 大运流年推演" : "Seven chapters · timing · decade luck"}</p>
    <a class="paywall-cta" href="${escapeAttr(upgradeUrl)}">${zh ? "付费解锁详细解读" : "Unlock the full reading"}</a>
    <p class="hint">${zh ? "安全支付 · 永久保存" : "Secure checkout · kept with this chart"}</p>
    <button type="button" class="share-link" data-share-open>${zh ? "分享给朋友" : "Share with a friend"}</button>
  </article>

  <footer class="bv-footer" data-dom-id="simple-footer">
    <p>${brandLockup}</p>
    <p class="tiny">${escapeHtml(copyrightLine(locale, date.getFullYear()))}</p>
    <p class="tiny">${zh
      ? `本报告由 ${brandSignature} 生成，仅作文化娱乐参考，不作为人生决策依据。`
      : `Generated by ${brandSignature} for cultural exploration only.`}</p>
    <p class="tiny"><a href="${zh ? "https://orasage.com/zh-CN" : "https://orasage.com/en"}">orasage.com</a>
      · <a href="${zh ? "https://bazi.orasage.com/?lang=zh-CN" : "https://bazi.orasage.com/?lang=en"}">${zh ? "八字排盘" : "Bazi"}</a></p>
  </footer>
</main>

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
      <p class="share-card-line">${escapeHtml(dayMasterLine || heroHeadline)}</p>
      <p class="share-card-meta">${escapeHtml(options.planLabel)}${pillarsLine ? ` · ${escapeHtml(pillarsLine)}` : ""}</p>
    </div>
    <div class="share-copy-box" id="shareCopyPreview">${escapeHtml(share.text)}</div>
    <div class="share-actions">
      <button type="button" class="share-btn primary" id="shareCopyAll">${zh ? "复制分享文案" : "Copy caption"}</button>
      <button type="button" class="share-btn" id="shareCopyLink">${zh ? "复制链接" : "Copy link"}</button>
      <button type="button" class="share-btn" id="shareNative">${zh ? "系统分享" : "Native share"}</button>
      <button type="button" class="share-btn" id="shareWechat">${zh ? "微信 / 朋友圈" : "WeChat"}</button>
    </div>
    <div class="share-platforms">
      <button type="button" class="share-platform" id="shareWeibo">微博</button>
      <button type="button" class="share-platform" id="shareX">X</button>
      <button type="button" class="share-platform" id="shareFacebook">Facebook</button>
      <button type="button" class="share-platform" id="shareLinkedIn">LinkedIn</button>
      <button type="button" class="share-platform" id="shareTelegram">Telegram</button>
      <button type="button" class="share-platform" id="shareEmail">Email</button>
    </div>
  </div>
</div>
<div class="share-toast" id="shareToast" role="status"></div>
${renderShareScript({ shareUrl, shareText: share.text, shareTitle: share.title })}
</body>
</html>`;
}

function decodeEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function extractLeftoverCopy(mainHtml: string): string {
  const leftover = mainHtml
    .replace(/<section class="section section-mingpan"[\s\S]*?<\/section>/g, " ")
    .replace(/<section class="section section-elements[^"]*"[\s\S]*?<\/section>/g, " ")
    .replace(/<article class="bv-card" data-dom-id="simple-pillars"[\s\S]*?<\/article>/g, " ")
    .replace(/<article class="bv-card" data-dom-id="simple-elements"[\s\S]*?<\/article>/g, " ")
    .replace(/<article class="bv-cta"[\s\S]*?<\/article>/g, " ")
    .replace(/<section class="product-rec"[\s\S]*?<\/section>/g, " ")
    .replace(/<section class="paywall-section"[\s\S]*?<\/section>/g, " ");
  const insight = leftover.match(/data-dom-id="simple-insight"[\s\S]*?<p>([\s\S]*?)<\/p>/);
  if (insight?.[1]) return condenseBriefCopy(decodeEntities(insight[1].replace(/<[^>]+>/g, " ")));
  const note = leftover.match(/section-brief-note[\s\S]*?<p>([\s\S]*?)<\/p>/);
  if (note?.[1]) return condenseBriefCopy(decodeEntities(note[1].replace(/<[^>]+>/g, " ")));
  const bodies = [...leftover.matchAll(/<div class="section-body">([\s\S]*?)<\/div>/g)]
    .map((m) => m[1])
    .join(" ");
  if (bodies.trim()) return condenseBriefCopy(bodies.replace(/<[^>]+>/g, " "));
  const stripped = leftover
    .replace(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/g, " ")
    .replace(/<p class="section-subtitle">[\s\S]*?<\/p>/g, " ")
    .replace(/<div class="section-number">[\s\S]*?<\/div>/g, " ");
  return condenseBriefCopy(stripped.replace(/<[^>]+>/g, " "));
}

function extractPillarMap(html: string): Pick<ReportChartMeta, "year" | "month" | "day" | "hour"> {
  const gans = [...html.matchAll(/class="[^"]*mp-gan[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
  const zhis = [...html.matchAll(/class="[^"]*mp-zhi[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1].trim());
  const labels = [...html.matchAll(/class="[^"]*mp-label[^"]*"[^>]*>([^<]+)</g)].map((m) => m[1]);
  const out: Pick<ReportChartMeta, "year" | "month" | "day" | "hour"> = {};
  const keys = ["year", "month", "day", "hour"] as const;
  for (let i = 0; i < Math.min(gans.length, zhis.length, 4); i++) {
    const label = labels[i] || "";
    const mapped = /年/.test(label) ? "year"
      : /月/.test(label) ? "month"
      : /日/.test(label) ? "day"
      : /时|時|Hour/.test(label) ? "hour"
      : keys[i];
    out[mapped] = { gan: gans[i], zhi: zhis[i] };
  }
  return out;
}

function extractWuXing(html: string): Record<string, number> | undefined {
  const fromBars: Record<string, number> = {};
  for (const m of html.matchAll(/bv-bar-head[\s\S]*?<span>([木火土金水])<\/span>[\s\S]*?bv-bar-val">([\d.]+)/g)) {
    fromBars[m[1]] = Number(m[2]);
  }
  if (Object.keys(fromBars).length >= 3) return fromBars;
  const fromItems: Record<string, number> = {};
  for (const m of html.matchAll(/element-symbol[^>]*>([木火土金水])[\s\S]*?element-percent[^>]*>(\d+)\s*%/g)) {
    fromItems[m[1]] = Number(m[2]);
  }
  if (Object.keys(fromItems).length >= 3) return fromItems;
  const fromRadar: Record<string, number> = {};
  for (const m of html.matchAll(/>([木火土金水])\s+([\d.]+)</g)) {
    fromRadar[m[1]] = Number(m[2]);
  }
  if (Object.keys(fromRadar).length >= 3) return fromRadar;
  return undefined;
}

function extractList(html: string, re: RegExp): string[] {
  const m = html.match(re);
  if (!m?.[1]) return [];
  return m[1].split(/[、,，/\s]+/).map((s) => s.trim()).filter((s) => /[木火土金水]/.test(s));
}

/**
 * 从旧免费杂志 / v2 / 橙卡 v3 页抽出数据，重排成 v4 赭石卡片页。
 * 已是 v4 + ochre 才跳过，避免 CSS 更新后旧 v3 永久卡在橙 token。
 */
export function relayoutFreeBriefToVibe(html: string): string {
  const head = html.slice(0, 1800);
  if (!/data-report-tier=["']free["']/.test(head)) return html;
  if (
    /data-brief-layout=["']v4["']/.test(head)
    && /data-brief-skin=["']ochre["']/.test(head)
    && /brief-vibe/.test(html.slice(0, 4000))
  ) {
    return html;
  }
  if (!/<main[\s\S]*<\/main>/i.test(html) && !/<section class="section/.test(html)) return html;

  const locale = (html.match(/<html[^>]*\slang="([^"]+)"/) || [])[1] || "zh-CN";
  const shareUrl = (html.match(/property="og:url"\s+content="([^"]+)"/) || [])[1]
    || (html.match(/https:\/\/bazi\.orasage\.com\/reports\/reading_[^"'\s<]+/) || [])[0]
    || "https://bazi.orasage.com";
  const upgradeUrl = (html.match(/class="paywall-cta" href="([^"]+)"/) || [])[1]
    || DEFAULT_UPGRADE;
  const name = decodeEntities(
    (html.match(/class="hero-person-name"[^>]*>([^<]+)/) || [])[1]
    || (html.match(/class="bv-h2"[^>]*>([^<]+)的命盘速读/) || [])[1]
    || (html.match(/class="share-card-headline"[^>]*>([^<]+)/) || [])[1]
    || "",
  );
  const birthStr = decodeEntities((html.match(/hero-person-row[\s\S]{0,400}?<span>([^<]*\d[^<]*)<\/span>/) || [])[1] || "");
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  const copy = extractLeftoverCopy(mainMatch?.[1] || html);
  const pillars = extractPillarMap(html);
  const wuXing = extractWuXing(html);
  const radarFallback = wuXing
    ? undefined
    : html.match(/<div class="wx-radar-wrap">[\s\S]*?<\/svg>\s*(?:<p class="wx-radar-caption">[\s\S]*?<\/p>\s*)?<\/div>/)?.[0];
  const riZhu = (html.match(/代表你的字：([甲乙丙丁戊己庚辛壬癸])/) || [])[1]
    || pillars.day?.gan
    || "";
  const strength = (html.match(/身强|身弱|偏补|偏耗|身中和|Support-heavy|Drain-heavy/) || [])[0] || "";
  const favorable = extractList(html, /喜用[：:]?\s*([木火土金水、,，\s]+)/);
  const unfavorable = extractList(html, /忌神[：:]?\s*([木火土金水、,，\s]+)/);
  const luckyLine = decodeEntities((html.match(/方向提示[\s\S]*?<p>([^<]+)/) || [])[1] || "");
  const gender = (html.match(/男命|女命/) || [])[0] || "";

  return buildBriefVibePageHtml({
    planLabel: locale.startsWith("zh") ? "结构速览" : "Structure Brief",
    reportContent: copy,
    subjectName: name || undefined,
    shareUrl,
    showUpgrade: true,
    upgradeUrl: decodeEntities(upgradeUrl),
    locale,
    tier: "free",
    chart: {
      name: name || undefined,
      birthStr: birthStr || undefined,
      gender: gender === "男命" ? "male" : gender === "女命" ? "female" : undefined,
      riZhu: riZhu || undefined,
      strength: strength || undefined,
      year: pillars.year,
      month: pillars.month,
      day: pillars.day,
      hour: pillars.hour,
      wuXing,
      luckyLine: luckyLine || undefined,
      favorable: favorable.length ? favorable : undefined,
      unfavorable: unfavorable.length ? unfavorable : undefined,
    },
    radarFallbackHtml: radarFallback,
  });
}
