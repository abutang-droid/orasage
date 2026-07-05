import fs from 'fs';
import path from 'path';
import { buildReportPageHtml } from './reportHtml.ts';
import { generateBaziReportContent } from './reportGenerator.ts';
import { fetchReportProductRecommend } from './reportRecommend.ts';

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

async function writeReportHtml(
  planType: string,
  reportContent: string,
  resultData?: Record<string, unknown>,
): Promise<string> {
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

  const wuXing = resultData?.wuXing as Record<string, number> | undefined;
  const productRecommend = planType === 'basic'
    ? await fetchReportProductRecommend(wuXing)
    : null;

  const staticHtml = buildReportPageHtml({
    planLabel,
    reportContent,
    generatedAt: new Date(),
    productRecommend,
  });

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
  const reportUrl = await writeReportHtml(planType, report, payload.resultData);

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
