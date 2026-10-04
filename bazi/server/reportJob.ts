import { generateBaziReportContent } from './reportGenerator.ts';
import { fetchReportProductRecommend } from './reportRecommend.ts';
import { writePaidReadingReport } from './staticFreeReport.ts';
import { readReportTier, resolveReadingReportPaths } from './readingReport.ts';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';

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

export async function runReportJob(input: ReportJobInput) {
  const reading = await fetchReading(input.readingId);
  if (!reading) throw new Error('reading not found');
  if (reading.userId !== input.userId) throw new Error('reading user mismatch');
  if (!reading.payloadJson) throw new Error('reading payload missing');

  // 已有免费固定页时仍需升级为付费全文；仅 paid 才视为完成
  const paths = resolveReadingReportPaths(input.readingId);
  const existingTier = readReportTier(paths.absolutePath);
  if (existingTier === 'paid') {
    return { success: true, duplicate: true, reportUrl: paths.reportUrl };
  }

  const payload = JSON.parse(reading.payloadJson) as {
    type?: 'single' | 'couple';
    lang?: 'zh-CN' | 'zh-TW' | 'en' | 'pt-BR';
    resultData?: Record<string, unknown>;
  };
  if (!payload.resultData || !payload.type) throw new Error('invalid reading payload');

  const planType = input.planType || 'advanced';
  const planLabelMap: Record<string, string> = {
    basic: '深度解读',
    advanced: '水晶手串',
    premium: '终极能量礼盒',
  };
  const planLabel = planLabelMap[planType] || planType || '深度解读';

  const { report } = await generateBaziReportContent(payload.type, payload.resultData, payload.lang ?? 'zh-CN');
  const wuXing = payload.resultData.wuXing as Record<string, number> | undefined;
  const productRecommend = planType === 'basic'
    ? await fetchReportProductRecommend(wuXing, {
        chart: {
          birthStr: String(payload.resultData.birthStr ?? ''),
          gender: String(payload.resultData.gender ?? 'male'),
          name: typeof payload.resultData.name === 'string' ? payload.resultData.name : undefined,
        },
      })
    : null;

  const written = writePaidReadingReport({
    readingId: input.readingId,
    reportContent: report,
    planLabel,
    subjectName: typeof payload.resultData.name === 'string' ? payload.resultData.name : undefined,
    locale: payload.lang ?? 'zh-CN',
    resultData: payload.resultData,
    productRecommend,
  });

  await patchReading(input.readingId, {
    reportUrl: written.reportUrl,
    title: `${reading.title} · 报告`,
  });
  await patchOrderStatus(input.orderNo, 'completed');

  return { success: true, reportUrl: written.reportUrl };
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
