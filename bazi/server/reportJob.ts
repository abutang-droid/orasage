import { generateBaziReportContent } from './reportGenerator.ts';
import { fetchReportProductRecommend } from './reportRecommend.ts';
import { writePaidReadingReport } from './staticFreeReport.ts';
import { readReportTier, resolveReadingReportPaths, readReadingPayloadSidecar } from './readingReport.ts';
import { assertPayerMayUnlock } from './reportUnlock.ts';
import { applyCalibratedChart } from './chartCalibrate.ts';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101';

type ReportJobInput = {
  orderNo: string;
  userId: number;
  readingId: string;
  planType?: string;
};

const inflightJobs = new Map<string, Promise<{ success: true; duplicate?: boolean; reportUrl: string }>>();

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

async function patchReading(readingId: string, body: { reportUrl?: string; title?: string; userId?: number }) {
  await fetch(`${AUTH_INTERNAL}/internal/readings/${encodeURIComponent(readingId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function claimGuestReading(reading: { readingId: string; title: string; userId: number }, payerUserId: number) {
  if (reading.userId !== 0 || payerUserId <= 0) return;
  const res = await fetch(`${AUTH_INTERNAL}/internal/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: payerUserId,
      appSource: 'bazi',
      readingId: reading.readingId,
      title: reading.title,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`claim guest reading failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

async function patchOrderStatus(orderNo: string, status: string) {
  await fetch(`${AUTH_INTERNAL}/internal/orders/${encodeURIComponent(orderNo)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
}

async function ensureReadingRow(input: ReportJobInput) {
  let reading = await fetchReading(input.readingId);
  if (reading) return reading;

  // auth upsert 曾失败（如旧 dist 拒 userId=0）时：从旁路 payload 补建记录
  const sidecar = readReadingPayloadSidecar(input.readingId);
  if (!sidecar) throw new Error('reading not found');
  const title = `八字结构速览 · ${String((sidecar.resultData as { name?: string }).name || '访客')}`;
  const paths = resolveReadingReportPaths(input.readingId);
  const createRes = await fetch(`${AUTH_INTERNAL}/internal/readings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: input.userId,
      appSource: 'bazi',
      readingId: input.readingId,
      title,
      reportUrl: paths.reportUrl,
      payloadJson: JSON.stringify({
        type: sidecar.type,
        lang: sidecar.lang ?? 'zh-CN',
        resultData: sidecar.resultData,
      }),
    }),
  });
  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`reading recreate failed (${createRes.status}): ${text.slice(0, 200)}`);
  }
  reading = await fetchReading(input.readingId);
  if (!reading) throw new Error('reading not found after recreate');
  return reading;
}

async function runReportJobInner(input: ReportJobInput) {
  const reading = await ensureReadingRow(input);
  assertPayerMayUnlock(reading.userId, input.userId);
  await claimGuestReading(reading, input.userId);
  if (!reading.payloadJson) {
    const sidecar = readReadingPayloadSidecar(input.readingId);
    if (!sidecar) throw new Error('reading payload missing');
    reading.payloadJson = JSON.stringify({
      type: sidecar.type,
      lang: sidecar.lang ?? 'zh-CN',
      resultData: sidecar.resultData,
    });
  }

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
    calibratedChart?: {
      year: { gan: string; zhi: string };
      month: { gan: string; zhi: string };
      day: { gan: string; zhi: string };
      hour: { gan: string; zhi: string };
      wuXing: Record<string, number>;
      riZhu: string;
    } | null;
  };
  if (!payload.resultData || !payload.type) throw new Error('invalid reading payload');

  const planType = input.planType || 'advanced';
  const planLabelMap: Record<string, string> = {
    basic: '深度解读',
    advanced: '水晶手串',
    premium: '终极能量礼盒',
  };
  const planLabel = planLabelMap[planType] || planType || '深度解读';
  const resultData = applyCalibratedChart(payload.resultData, payload.calibratedChart);

  const { report } = await generateBaziReportContent(
    payload.type,
    resultData,
    payload.lang ?? 'zh-CN',
    'full',
  );
  const wuXing = resultData.wuXing as Record<string, number> | undefined;
  const productRecommend = planType === 'basic'
    ? await fetchReportProductRecommend(wuXing, {
        chart: {
          birthStr: String(resultData.birthStr ?? ''),
          gender: String(resultData.gender ?? 'male'),
          name: typeof resultData.name === 'string' ? resultData.name : undefined,
        },
      })
    : null;

  const written = writePaidReadingReport({
    readingId: input.readingId,
    reportContent: report,
    planLabel,
    subjectName: typeof resultData.name === 'string' ? resultData.name : undefined,
    locale: payload.lang ?? 'zh-CN',
    resultData,
    chartOverride: payload.calibratedChart ?? undefined,
    productRecommend,
  });

  await patchReading(input.readingId, {
    reportUrl: written.reportUrl,
    title: `${reading.title} · 报告`,
  });
  await patchOrderStatus(input.orderNo, 'completed');

  return { success: true, reportUrl: written.reportUrl };
}

export async function runReportJob(input: ReportJobInput) {
  const key = input.readingId.trim();
  const existing = inflightJobs.get(key);
  if (existing) return existing;
  const pending = runReportJobInner(input).finally(() => {
    inflightJobs.delete(key);
  });
  inflightJobs.set(key, pending);
  return pending;
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
