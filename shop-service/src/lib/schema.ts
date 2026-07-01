import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const productTypeEnum = pgEnum('product_type', [
  'digital',
  'subscription',
  'physical',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled',
]);

export const sourceAppEnum = pgEnum('source_app', [
  'shop',
  'bazi',
  'ziwei',
  'tarot',
  'admin',
]);

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  priceCents: integer('price_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  type: productTypeEnum('type').default('digital').notNull(),
  appSource: sourceAppEnum('app_source').default('shop').notNull(),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  imageUrl: text('image_url'),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  active: boolean('active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: varchar('order_number', { length: 32 }).notNull().unique(),
  userId: integer('user_id').notNull(),
  status: orderStatusEnum('status').default('pending').notNull(),
  stripeSessionId: varchar('stripe_session_id', { length: 255 }),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  totalCents: integer('total_cents').notNull(),
  currency: varchar('currency', { length: 3 }).default('usd').notNull(),
  sourceApp: sourceAppEnum('source_app').default('shop').notNull(),
  recommendationContext: jsonb('recommendation_context')
    .$type<Record<string, unknown>>()
    .default({}),
  customerEmail: varchar('customer_email', { length: 255 }),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  quantity: integer('quantity').default(1).notNull(),
  unitPriceCents: integer('unit_price_cents').notNull(),
  productSnapshot: jsonb('product_snapshot')
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const entitlements = pgTable('entitlements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  orderId: integer('order_id').references(() => orders.id),
  entitlementKey: varchar('entitlement_key', { length: 120 }).notNull(),
  metadata: jsonb('metadata').$type<Record<string, unknown>>().default({}),
  expiresAt: timestamp('expires_at'),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stripeEvents = pgTable('stripe_events', {
  id: serial('id').primaryKey(),
  stripeEventId: varchar('stripe_event_id', { length: 255 }).notNull().unique(),
  type: varchar('type', { length: 120 }).notNull(),
  processed: boolean('processed').default(false).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Entitlement = typeof entitlements.$inferSelect;
