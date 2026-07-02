import fs from 'fs';
import path from 'path';
import { renderMarkdown } from './reportHtml.ts';
import { generateBaziReportContent } from './reportGenerator.ts';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';
const BAZI_PUBLIC_URL = process.env.BAZI_PUBLIC_URL ?? 'https://bazi.orasage.com';

type ReportJobInput = {
  orderNo: string;
  userId: number;
  readingId: string;
  planType?: string;
};

function isLocalIp(ip: string | undefined): boolean {
  if (!ip) return process.env.NODE_ENV !== 'production';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

async function fetchReading(readingId: string) {
  const res = await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(readingId)}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.reading as {
    userId: number;
    readingId: string;
    title: string;
    reportUrl: string | null;
    payloadJson: string | null;
  };
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

function writeReportHtml(planType: string, reportContent: string): string {
  const reportId = `report_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const fileName = `${reportId}.html`;
  const reportsDir = process.env.NODE_ENV === 'development'
    ? path.resolve(import.meta.dirname, '..', 'dist', 'public', 'reports')
    : path.resolve(import.meta.dirname, 'public', 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });

  const planLabelMap: Record<string, string> = {
    basic: '深度解读',
    advanced: '能量手串',
    premium: '终极能量礼盒',
  };
  const planLabel = planLabelMap[planType] || planType || '深度解读';
  const dateStr = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
  const reportHtml = renderMarkdown(reportContent);

  const staticHtml = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${planLabel} - OraSage</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700;900&display=swap" rel="stylesheet">
<style>
body{font-family:"Noto Serif SC",serif;background:#F7F4FA;color:#3D3852;line-height:1.8;margin:0}
.container{max-width:720px;margin:2rem auto;padding:0 1rem}
.card{background:#FFF;border-radius:16px;padding:2rem;box-shadow:0 4px 24px rgba(46,41,91,0.06)}
</style>
</head>
<body>
<div class="container"><div class="card"><h1>${planLabel}</h1><p style="color:#7B7488;font-size:0.85rem">生成于 ${dateStr}</p><div>${reportHtml}</div></div></div>
</body>
</html>`;

  fs.writeFileSync(path.join(reportsDir, fileName), staticHtml, 'utf-8');
  return `${BAZI_PUBLIC_URL}/reports/${fileName}`;
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
    lang?: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';
    resultData?: Record<string, unknown>;
  };
  if (!payload.resultData || !payload.type) throw new Error('invalid reading payload');

  const planType = input.planType || 'advanced';
  const { report } = await generateBaziReportContent(payload.type, payload.resultData, payload.lang ?? 'zh-CN');
  const reportUrl = writeReportHtml(planType, report);

  await patchReading(input.readingId, { reportUrl, title: `${reading.title} · 报告` });
  await patchOrderStatus(input.orderNo, 'completed');

  return { success: true, reportUrl };
}

export function registerReportJobRoute(app: import('express').Express) {
  app.post('/internal/report-job', async (req, res) => {
    const ip = (req.headers['x-real-ip'] as string) || req.ip;
    if (!isLocalIp(ip)) {
      res.status(403).json({ error: 'forbidden' });
      return;
    }
    try {
      const body = req.body as ReportJobInput;
      if (!body.orderNo || !body.userId || !body.readingId) {
        res.status(400).json({ error: 'missing fields' });
        return;
      }
      const result = await runReportJob(body);
      res.json(result);
    } catch (err) {
      console.error('[report-job]', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'report job failed' });
    }
  });
}
