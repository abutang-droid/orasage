import { asc, desc, eq } from 'drizzle-orm';
import { db } from '../db/index.ts';
import {
  orderShipmentEvents,
  orderShipments,
  userOrders,
} from '../db/schema.ts';

export type ShipmentRow = typeof orderShipments.$inferSelect;

export async function listShipmentsForOrder(orderNo: string) {
  const shipments = await db
    .select()
    .from(orderShipments)
    .where(eq(orderShipments.orderNo, orderNo))
    .orderBy(desc(orderShipments.createdAt));

  if (shipments.length === 0) return [];

  const result = [];
  for (const shipment of shipments) {
    const events = await db
      .select()
      .from(orderShipmentEvents)
      .where(eq(orderShipmentEvents.shipmentId, shipment.id))
      .orderBy(asc(orderShipmentEvents.occurredAt));
    result.push({ shipment, events });
  }
  return result;
}

export function formatShipment(shipment: ShipmentRow, events: Awaited<ReturnType<typeof listShipmentsForOrder>>[number]['events']) {
  return {
    id: shipment.id,
    carrier: shipment.carrier,
    trackingNo: shipment.trackingNo,
    status: shipment.status,
    shippedAt: shipment.shippedAt?.toISOString() ?? null,
    events: events.map((e) => ({
      status: e.status,
      description: e.description,
      location: e.location,
      occurredAt: e.occurredAt.toISOString(),
    })),
  };
}

export async function createShipment(input: {
  orderNo: string;
  carrier: string;
  trackingNo: string;
  note?: string;
}) {
  const [order] = await db.select().from(userOrders).where(eq(userOrders.orderNo, input.orderNo)).limit(1);
  if (!order) {
    throw new Error('订单不存在');
  }

  const now = new Date();
  const [shipment] = await db.insert(orderShipments).values({
    orderNo: input.orderNo,
    carrier: input.carrier,
    trackingNo: input.trackingNo,
    status: 'in_transit',
    shippedAt: now,
  }).returning();

  const events = [
    {
      shipmentId: shipment.id,
      status: 'picked_up',
      description: input.note?.trim() || `包裹已由 ${input.carrier} 揽收`,
      location: null,
      occurredAt: now,
    },
    {
      shipmentId: shipment.id,
      status: 'in_transit',
      description: '包裹运输中',
      location: null,
      occurredAt: new Date(now.getTime() + 60_000),
    },
  ];
  await db.insert(orderShipmentEvents).values(events);

  if (order.status === 'paid') {
    await db.update(userOrders).set({ status: 'shipped' }).where(eq(userOrders.orderNo, input.orderNo));
  }

  return shipment;
}
