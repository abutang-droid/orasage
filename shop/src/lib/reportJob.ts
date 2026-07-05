import { ENV } from './env';

function planTypeFromBaziSku(sku: string | null | undefined): string {
  if (!sku) return 'advanced';
  if (sku.includes('-basic')) return 'basic';
  if (sku.includes('-premium')) return 'premium';
  return 'advanced';
}

function planTypeFromZiweiSku(sku: string | null | undefined): string {
  if (sku === 'report-ziwei-basic') return 'basic';
  if (sku === 'report-ziwei-premium') return 'premium';
  return 'advanced';
}

export async function dispatchBaziReportJob(order: {
  orderNo: string;
  userId: number;
  sku?: string | null;
  readingId?: string | null;
}) {
  const sku = order.sku ?? '';
  if (!sku.startsWith('report-bazi') || !order.readingId) return;
  const res = await fetch(`${ENV.baziInternalUrl}/internal/report-job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '127.0.0.1',
    },
    body: JSON.stringify({
      orderNo: order.orderNo,
      userId: order.userId,
      readingId: order.readingId,
      planType: planTypeFromBaziSku(order.sku),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`bazi report-job failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

export async function dispatchZiweiReportJob(order: {
  orderNo: string;
  userId: number;
  sku?: string | null;
  readingId?: string | null;
}) {
  const sku = order.sku ?? '';
  if (!sku.startsWith('report-ziwei') || !order.readingId) return;
  const res = await fetch(`${ENV.ziweiInternalUrl}/api/internal/report-job`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-real-ip': '127.0.0.1',
    },
    body: JSON.stringify({
      orderNo: order.orderNo,
      userId: order.userId,
      readingId: order.readingId,
      planType: planTypeFromZiweiSku(order.sku),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ziwei report-job failed (${res.status}): ${text.slice(0, 200)}`);
  }
}

/** 根据 SKU 前缀分发报告生成任务 */
export async function dispatchReportJob(order: {
  orderNo: string;
  userId: number;
  sku?: string | null;
  readingId?: string | null;
}) {
  const sku = order.sku ?? '';
  if (sku.startsWith('report-bazi')) {
    await dispatchBaziReportJob(order);
  } else if (sku.startsWith('report-ziwei')) {
    await dispatchZiweiReportJob(order);
  }
}
