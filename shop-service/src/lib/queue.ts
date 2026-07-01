import { Queue } from 'bullmq';

const QUEUE_NAME = 'shop-fulfillment';

let fulfillmentQueue: Queue | null = null;

function getConnection() {
  return {
    url: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',
    maxRetriesPerRequest: null,
  };
}

export function getFulfillmentQueue(): Queue {
  if (!fulfillmentQueue) {
    fulfillmentQueue = new Queue(QUEUE_NAME, { connection: getConnection() });
  }
  return fulfillmentQueue;
}

export interface FulfillmentJobData {
  orderId: number;
  userId: number;
  sourceApp: string;
  recommendationContext?: Record<string, unknown>;
}

export async function enqueueFulfillment(data: FulfillmentJobData): Promise<void> {
  await getFulfillmentQueue().add('fulfill-order', data, {
    attempts: 5,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 200,
  });
}

export { QUEUE_NAME, getConnection };
