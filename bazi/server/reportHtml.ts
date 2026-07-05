/**
 * 轻量 Markdown → HTML 渲染 + 用户中心报告页模板
 */

import { extractSectionKeywords } from "../shared/section-keywords.ts";
import { sanitizeReportBrandText } from "../shared/report-brand.ts";

const CHAPTER_NUMERALS = ["零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖", "拾"];

export type ReportProductRecommend = {
  name: string;
  desc: string;
  priceDisplay: string;
  shopUrl: string;
  element?: string;
};

export type ReportSection = { title: string; content: string };

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

function renderSectionBlock(section: ReportSection, index: number): string {
  const numeral = CHAPTER_NUMERALS[index + 1] ?? String(index + 1);
  const keywords = extractSectionKeywords(section.content, section.title);
  const bodyHtml = renderMarkdown(section.content);
  const keywordHtml = keywords.length > 0
    ? `<div class="kw-row">${keywords.map((kw) => `<span class="kw">${escapeHtml(kw)}</span>`).join("")}</div>`
    : "";

  return `
<article class="section">
  <header class="section-head">
    <span class="chapter">${numeral}</span>
    <h2 class="section-title">${escapeHtml(section.title)}</h2>
  </header>
  ${keywordHtml}
  <div class="section-body">${bodyHtml}</div>
</article>`;
}

function renderProductRecommendBlock(product: ReportProductRecommend): string {
  return `
<section class="product-rec">
  <p class="product-rec-label">能量好物推荐</p>
  <h3 class="product-rec-name">${escapeHtml(product.name)}</h3>
  <p class="product-rec-desc">${escapeHtml(product.desc)}</p>
  <p class="product-rec-price">${escapeHtml(product.priceDisplay)}</p>
  <a class="product-rec-btn" href="${escapeHtml(product.shopUrl)}" target="_blank" rel="noopener noreferrer">前往购买</a>
</section>`;
}

export type ReportPageOptions = {
  planLabel: string;
  reportContent: string;
  subjectName?: string;
  generatedAt?: Date;
  productRecommend?: ReportProductRecommend | null;
};

/** 生成完整静态报告 HTML 页面（用户中心 / 邮件链接） */
export function buildReportPageHtml(options: ReportPageOptions): string {
  const date = options.generatedAt ?? new Date();
  const dateStr = date.toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric" });
  const brandedContent = sanitizeReportBrandText(options.reportContent);
  const sections = parseReportSections(brandedContent);
  const sectionHtml = sections.length > 0
    ? sections.map((s, i) => renderSectionBlock(s, i)).join("\n")
    : `<div class="section"><div class="section-body">${renderMarkdown(brandedContent)}</div></div>`;
  const productHtml = options.productRecommend
    ? renderProductRecommendBlock(options.productRecommend)
    : "";
  const subjectLine = options.subjectName
    ? `<p class="subject">${escapeHtml(options.subjectName)} 的命理报告</p>`
    : "";

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(options.planLabel)} - OraSage 命理报告</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&family=Noto+Sans+SC:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
:root{--gold:#C4A04E;--gold-light:#D9B86A;--ink:#2E295B;--body:#4A4560;--muted:#7B7488;--bg:#F3F0F7;--card:#FFFFFF;--border:rgba(196,160,78,0.18)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Noto Serif SC",serif;background:linear-gradient(180deg,#F8F5FC 0%,var(--bg) 40%,#EDE8F4 100%);color:var(--body);line-height:1.85;min-height:100vh}
.wrap{max-width:760px;margin:0 auto;padding:1.5rem 1rem 3rem}
.hero{text-align:center;padding:2.5rem 1rem 1.75rem;background:radial-gradient(ellipse at 50% 0%,rgba(196,160,78,0.12) 0%,transparent 70%)}
.badge{display:inline-block;background:rgba(196,160,78,0.12);color:var(--gold);padding:0.25rem 0.9rem;border-radius:999px;font-size:0.75rem;font-weight:600;letter-spacing:0.12em;margin-bottom:0.75rem;border:1px solid var(--border)}
.hero h1{font-size:1.75rem;color:var(--ink);font-weight:900;letter-spacing:0.06em}
.subject{margin-top:0.35rem;font-size:0.95rem;color:var(--gold)}
.meta{margin-top:0.5rem;font-size:0.8rem;color:var(--muted);font-family:"Noto Sans SC",sans-serif}
.report-card{background:var(--card);border-radius:20px;border:1px solid var(--border);box-shadow:0 8px 40px rgba(46,41,91,0.07);overflow:hidden}
.section{padding:1.75rem 1.75rem 1.5rem;border-bottom:1px solid rgba(196,160,78,0.1)}
.section:last-child{border-bottom:none}
.section-head{display:flex;align-items:baseline;gap:0.75rem;margin-bottom:0.75rem}
.chapter{font-size:0.7rem;color:var(--gold);letter-spacing:0.2em;font-weight:700;flex-shrink:0}
.section-title{font-size:1.15rem;color:var(--ink);font-weight:700;letter-spacing:0.04em}
.kw-row{display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1rem}
.kw{font-size:0.65rem;color:var(--gold);padding:0.15rem 0.55rem;border-radius:999px;background:rgba(196,160,78,0.08);border:1px solid var(--border);font-family:"Noto Sans SC",sans-serif}
.section-body{font-size:0.95rem;color:var(--body)}
.section-body h2,.section-body h3{font-size:1rem;color:var(--ink);margin:1rem 0 0.5rem}
.section-body p{margin-bottom:0.75rem}
.section-body ul{padding-left:1.25rem;margin:0.5rem 0 0.75rem}
.section-body li{margin-bottom:0.35rem}
.section-body strong{color:var(--ink)}
.product-rec{margin:0 1.75rem 1.75rem;padding:1.25rem 1.5rem;border-radius:16px;border:1px solid var(--border);background:linear-gradient(135deg,rgba(196,160,78,0.08),rgba(196,160,78,0.02))}
.product-rec-label{font-size:0.65rem;color:var(--gold);letter-spacing:0.2em;font-weight:700;margin-bottom:0.5rem;font-family:"Noto Sans SC",sans-serif}
.product-rec-name{font-size:1.05rem;color:var(--ink);font-weight:700;margin-bottom:0.35rem}
.product-rec-desc{font-size:0.85rem;color:var(--muted);margin-bottom:0.75rem;line-height:1.6}
.product-rec-price{font-size:1.1rem;color:var(--gold);font-weight:700;margin-bottom:1rem}
.product-rec-btn{display:inline-block;padding:0.55rem 1.25rem;border-radius:999px;background:var(--gold);color:#1a1528;text-decoration:none;font-size:0.85rem;font-weight:600;font-family:"Noto Sans SC",sans-serif}
.footer{text-align:center;padding:2rem 1rem 0;font-size:0.7rem;color:var(--muted);font-family:"Noto Sans SC",sans-serif;line-height:1.8}
.footer a{color:var(--gold);text-decoration:none}
@media(max-width:640px){.wrap{padding:1rem 0.75rem 2rem}.section{padding:1.25rem 1rem}.hero h1{font-size:1.4rem}}
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <div class="badge">${escapeHtml(options.planLabel)}</div>
    <h1>OraSage 命理报告</h1>
    ${subjectLine}
    <p class="meta">生成于 ${escapeHtml(dateStr)}</p>
  </header>
  <main class="report-card">${sectionHtml}${productHtml}</main>
  <footer class="footer">
    <p>本报告由 OraSage 八字命理系统生成，内容仅供文化娱乐与自我探索参考。</p>
    <p><a href="https://orasage.com">orasage.com</a> · <a href="https://bazi.orasage.com">八字排盘</a></p>
  </footer>
</div>
</body>
</html>`;
}
