import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.ts";
import { configAuditLogs } from "../db/schema.ts";

export type AuditActorType = "api_key" | "staff" | "system";

export async function recordConfigAudit(input: {
  partnerId: string;
  actorType: AuditActorType;
  actorId?: string | null;
  moduleKey?: string | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
}) {
  const [row] = await db
    .insert(configAuditLogs)
    .values({
      partnerId: input.partnerId,
      actorType: input.actorType,
      actorId: input.actorId ?? null,
      moduleKey: input.moduleKey ?? null,
      action: input.action,
      resourceType: input.resourceType ?? null,
      resourceId: input.resourceId ?? null,
      before: (input.before as Record<string, unknown> | null) ?? null,
      after: (input.after as Record<string, unknown> | null) ?? null,
      requestId: input.requestId ?? null,
    })
    .returning();
  return row;
}

export async function listConfigAuditLogs(partnerId: string, limit = 50) {
  const rows = await db
    .select()
    .from(configAuditLogs)
    .where(eq(configAuditLogs.partnerId, partnerId))
    .orderBy(desc(configAuditLogs.createdAt))
    .limit(Math.min(limit, 200));
  return rows.map((r) => ({
    id: r.id,
    partnerId: r.partnerId,
    actorType: r.actorType,
    actorId: r.actorId,
    moduleKey: r.moduleKey,
    action: r.action,
    resourceType: r.resourceType,
    resourceId: r.resourceId,
    before: r.before,
    after: r.after,
    requestId: r.requestId,
    createdAt: r.createdAt,
  }));
}
