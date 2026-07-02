import { ENV } from './env';

function planTypeFromSku(sku: string | null | undefined): string {
  if (sku === 'report-bazi-basic') return 'basic';
  if (sku === 'report-bazi-premium') return 'premium';
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
      planType: planTypeFromSku(order.sku),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`report-job failed (${res.status}): ${text.slice(0, 200)}`);
  }
}
