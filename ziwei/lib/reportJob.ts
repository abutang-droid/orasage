import fs from 'fs';
import path from 'path';
import { renderMarkdown } from '@/lib/reportHtml';
import { generateZiweiReportContent } from '@/lib/reportGenerator';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
const ZIWEI_PUBLIC_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ziwei.orasage.com';

export type ReportJobInput = {
  orderNo: string;
  userId: number;
  readingId: string;
  planType?: string;
};

type ReadingRecord = {
  userId: number;
  readingId: string;
  title: string;
  reportUrl: string | null;
  payloadJson: string | null;
};

async function fetchReading(readingId: string): Promise<ReadingRecord | null> {
  const res = await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(readingId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.reading as ReadingRecord;
}

async function patchReading(readingId: string, body: { reportUrl: string; title?: string }) {
  await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(readingId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function patchOrderStatus(orderNo: string, status: string) {
  await fetch(`${AUTH_INTERNAL}/internal/orders/${encodeURIComponent(orderNo)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

function writeReportHtmlForLocale(
  planType: string,
  reportContent: string,
  locale: import('../../shared/ai-locale/index').AiLocale,
): string {
  const reportsDir = path.join(process.cwd(), 'public', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const fileName = `ziwei-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.html`;

  const planLabelMapEn: Record<string, string> = {
    basic: 'Deep reading',
    advanced: 'Energy bracelet',
    premium: 'Ultimate energy gift set',
  };
  const planLabelMapPt: Record<string, string> = {
    basic: 'Leitura profunda',
    advanced: 'Pulseira de energia',
    premium: 'Kit de energia ultimate',
  };
  const planLabelMapZh: Record<string, string> = {
    basic: '深度解读',
    advanced: '能量手串',
    premium: '终极能量礼盒',
  };
  const planLabel =
    (locale === 'en' ? planLabelMapEn : locale === 'pt-BR' ? planLabelMapPt : planLabelMapZh)[planType]
    || planType
    || (locale === 'en' ? 'Reading' : locale === 'pt-BR' ? 'Leitura' : '深度解读');
  const dateLocale = locale === 'en' ? 'en-US' : locale === 'pt-BR' ? 'pt-BR' : 'zh-CN';
  const dateStr = new Date().toLocaleDateString(dateLocale, { year: 'numeric', month: 'long', day: 'numeric' });
  const reportHtml = renderMarkdown(reportContent);
  const htmlLang = locale === 'pt-BR' ? 'pt-BR' : locale === 'en' ? 'en' : locale === 'zh-TW' ? 'zh-Hant' : 'zh-CN';
  const title =
    locale === 'en'
      ? `${planLabel} - OraSage Zi Wei`
      : locale === 'pt-BR'
        ? `${planLabel} - OraSage Zi Wei`
        : `${planLabel} - OraSage 紫微`;
  const heading =
    locale === 'en'
      ? `Zi Wei · ${planLabel}`
      : locale === 'pt-BR'
        ? `Zi Wei · ${planLabel}`
        : `紫微${planLabel}`;
  const generated =
    locale === 'en'
      ? `Generated ${dateStr}`
      : locale === 'pt-BR'
        ? `Gerado em ${dateStr}`
        : `生成于 ${dateStr}`;

  const staticHtml = `<!doctype html>
<html lang="${htmlLang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
body{font-family:"Noto Serif SC",serif;background:#FAFAF8;color:#3D3852;line-height:1.8;margin:0}
.container{max-width:720px;margin:2rem auto;padding:0 1rem}
.card{background:#FFF;border-radius:16px;padding:2rem;box-shadow:0 4px 24px rgba(46,41,91,0.06)}
h1,h2,h3{color:#171717}
</style>
</head>
<body>
<div class="container"><div class="card"><h1>${heading}</h1><p style="color:#7B7488;font-size:0.85rem">${generated}</p><div>${reportHtml}</div></div></div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, fileName), staticHtml, 'utf-8');
  return `${ZIWEI_PUBLIC_URL}/reports/${fileName}`;
}

export async function runReportJob(input: ReportJobInput) {
  const reading = await fetchReading(input.readingId);
  if (!reading) throw new Error('reading not found');
  if (reading.userId !== input.userId) throw new Error('reading user mismatch');
  if (reading.reportUrl) {
    return { success: true, duplicate: true, reportUrl: reading.reportUrl };
  }
  if (!reading.payloadJson) throw new Error('reading payload missing');

  const payload = JSON.parse(reading.payloadJson) as {
    type?: 'single' | 'couple';
    lang?: string;
    chart?: unknown;
    chartA?: unknown;
    chartB?: unknown;
  };
  if (!payload.type) throw new Error('invalid reading payload');

  const planType = input.planType || 'advanced';
  const locale = (payload.lang ?? 'zh-CN') as import('../../shared/ai-locale/index').AiLocale;
  const report = await generateZiweiReportContent(payload.type, payload as never, planType, locale);
  const reportUrl = writeReportHtmlForLocale(planType, report, locale);
  const reportSuffix =
    locale === 'en' ? 'Report' : locale === 'pt-BR' ? 'Relatório' : '报告';

  await patchReading(input.readingId, { reportUrl, title: `${reading.title} · ${reportSuffix}` });
  await patchOrderStatus(input.orderNo, 'completed');

  return { success: true, reportUrl };
}

export function isLocalIp(ip: string | undefined): boolean {
  if (!ip) return process.env.NODE_ENV !== 'production';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}
