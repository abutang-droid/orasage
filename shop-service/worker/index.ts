import { Worker } from 'bullmq';
import { eq } from 'drizzle-orm';
import { QUEUE_NAME, getConnection, type FulfillmentJobData } from '../src/lib/queue.js';
import { db, initDb, pool } from '../src/lib/db.js';
import { orders } from '../src/lib/schema.js';

const APP_CALLBACKS: Record<string, string | undefined> = {
  bazi: process.env.BAZI_INTERNAL_URL,
  ziwei: process.env.ZIWEI_INTERNAL_URL,
  tarot: process.env.TAROT_INTERNAL_URL,
};

async function notifySourceApp(data: FulfillmentJobData): Promise<void> {
  const baseUrl = APP_CALLBACKS[data.sourceApp];
  if (!baseUrl) return;

  const url = `${baseUrl}/internal/order-fulfilled`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: data.orderId,
        userId: data.userId,
        recommendationContext: data.recommendationContext ?? {},
      }),
    });
    if (!res.ok) {
      console.warn(`[fulfillment] callback ${data.sourceApp} failed: ${res.status}`);
    } else {
      console.log(`[fulfillment] notified ${data.sourceApp} for order ${data.orderId}`);
    }
  } catch (e) {
    console.warn(`[fulfillment] callback ${data.sourceApp} error`, e);
  }
}

async function processJob(data: FulfillmentJobData): Promise<void> {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, data.orderId))
    .limit(1);

  if (!order || order.status !== 'paid') {
    throw new Error(`order ${data.orderId} not ready for fulfillment`);
  }

  await notifySourceApp(data);

  await db
    .update(orders)
    .set({
      metadata: {
        ...(order.metadata as Record<string, unknown>),
        fulfilledAt: new Date().toISOString(),
      },
      updatedAt: new Date(),
    })
    .where(eq(orders.id, data.orderId));
}

async function main() {
  await initDb();

  const worker = new Worker<FulfillmentJobData>(
    QUEUE_NAME,
    async (job) => {
      console.log(`[fulfillment] processing order ${job.data.orderId}`);
      await processJob(job.data);
    },
    { connection: getConnection(), concurrency: 3 },
  );

  worker.on('failed', (job, err) => {
    console.error(`[fulfillment] job ${job?.id} failed`, err);
  });

  console.log(`fulfillment worker listening on queue "${QUEUE_NAME}"`);

  const shutdown = async () => {
    await worker.close();
    await pool.end();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
